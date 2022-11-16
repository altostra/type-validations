import anyOf from './anyOf'
import type {
	AnyTypeValidation,
	Key,
	TypeValidation,
} from './Common'
import {
	fromEntries,
	isObject,
	MAX_DISPLAYED_TYPES,
	pathKey,
	transformValidation,
} from './Common'
import enumOf from './enumOf'
import is from './is'
import { boolean } from './primitives'
import {
	asRejectingValidator,
	createRejection,
	indent,
	registerRejectingValidator,
	rejectionMessage,
	typeName,
} from './RejectionReasons'

/**
 * A type which provides an object property validators
 */
export type ObjectValidations<T extends object> = {
	readonly [K in keyof T]-?: AnyTypeValidation<T[K]>
}

/**
 * A type which provides a tuple property validators
 */
export type TupleValidations<T extends any[]> = {
	readonly [K in keyof T]-?: K extends number
		? AnyTypeValidation<T[K]> | T[K]
		: AnyTypeValidation<T[K]>
}

export type ObjectOrTupleValidations<T extends object> = T extends any[]
	? TupleValidations<T>
	: ObjectValidations<T>

const identifierRX = /^[_$a-z][_$a-z0-9]*$/i

function literalKey(key: string): string {
	return identifierRX.test(key)
		? key
		: `"${key}"`
}

const strictnessTransformation = Symbol('strict')

export interface ObjectOfOptions {
	strict?: Strictness | boolean
}

export type Strictness =
	| 'strict-locked'
	| 'strict-unlocked'
	| 'strict'
	| 'unstrict-locked'
	| 'unstrict-unlocked'
	| 'unstrict'

enum StrictnessKind {
	Strict = 'strict',
	StrictLocked = 'strict-locked',
	StrictUnlocked = 'strict-unlocked',
	Unstrict = 'unstrict',
	UnstrictLocked = 'unstrict-locked',
	UnstrictUnlocked = 'unstrict-unlocked',

}

export type RecordObjectType<T extends object> =
	& T
	& {
		[K in Key]: K extends keyof T
			? T[K]
			: unknown
	}

/**
 * A `TypeValidation<T>` that validates object
 */
export interface ObjectOfTypeValidation<T extends object> extends TypeValidation<T> {
	readonly isStrict: boolean

	/**
	 * Returns a `ObjectOfTypeValidation<T>` validation that also checks that the
	 * object contains no unspecified properties.
	 *
	 * Affect all `objectOf` validations,	\
	 * If one of the specified properties is also an object validated using `objectOf`,
	 * in the returned validation the property would also perform strict validations,
	 * and so on, recursively.
	 * @example
	 * const testedObject = {
	 *	 nested: {
	 *		 a: 1,
	 *		 b: 2,
	 *	 },
	 * }
	 *
	 * const isMyObject = objectOf({
	 *	 nested: objectOf({
	 *		 a: number,
	 *	 })
	 * })
	 *
	 * const isStrictlyMyObject = isMyObject.strict()
	 *
	 * const tested = isMyObject(testedObject) // true
	 * const strictlyTested = isStrictlyMyObject(testedObject) // false
	 */
	strict(): ObjectOfTypeValidation<T>
	/**
	 * Returns a `ObjectOfTypeValidation<T>` validation that only validates the
	 * specified properties and never checks that an object contains other, unspecified, properties.
	 *
	 * Affect all `objectOf` validations,	\
	 * If one of the specified properties is also an object validated using `objectOf`,
	 * in the returned validation the property would also perform non-strict validations,
	 * and so on, recursively.
	 * @example
	 * const testedObject = {
	 *	 nested: {
	 *		 a: 1,
	 *		 b: 2,
	 *	 },
	 * }
	 *
	 * const isStrictlyMyObject = objectOf({
	 *	 // This nested property is strictly validated
	 *	 nested: objectOf({
	 *		 a: number,
	 *	 }).strict()
	 * })
	 *
	 * const isMyObject = isStrictlyMyObject.unstrict()
	 *
	 * const tested = isStrictlyMyObject(testedObject) // false
	 * const nonStrictlyTested = isMyObject(testedObject) // true
	 */
	unstrict(): ObjectOfTypeValidation<T>
	lock(): ObjectOfTypeValidation<T>
	unlock(): ObjectOfTypeValidation<T>
	/**
	 * Returns the `propertiesSpec` used to create this validation.
	 */
	propertySpec(): ObjectOrTupleValidations<T>
}

/**
 * Creates a validator that validates that an object has all the provided keys, and optionally prevents from \
 * the object to have additional keys
 * @param propertySpec An object that provides a type validator for each property of a validated object
 * @param {strict} `true` to create a validator that fails if an object has more
 * properties than the provided validations;\
 * Otherwise `false` \
 * \
 * Does not affect validations specified by `propertySpec`.
 * @returns A validator that validates that an object has all the provided keys, and optionally prevents from \
 * the object to have additional keys
 */
function objectOf<T extends object>(
	propertySpec: ObjectOrTupleValidations<T>,
	{ strict }: ObjectOfOptions = {},
): ObjectOfTypeValidation<T> {
	const validationEntries = Object.entries(propertySpec) as [string, AnyTypeValidation<T[keyof T]>][]
	let isTuple = false

	if (Array.isArray(propertySpec)) {
		isTuple = true
		strict = normalizeStrictness(strict ?? 'strict')

		if (isStrict(strict)) {
			validationEntries.push(['length', is(propertySpec.length)])
		}
	}

	const normalizedStrict = normalizeStrictness(strict)

	const allValidationTypes = validationEntries
		.map(([key, validator]) => isTuple
			? () => indent(typeName(validator), '	')
			: () => `${literalKey(key)}: ${indent(typeName(validator), '	')}`)

	// Remove length validation from printed type
	if (isTuple && isStrict(normalizedStrict)) {
		allValidationTypes.pop()
	}

	const validationTypes = allValidationTypes.length <= MAX_DISPLAYED_TYPES
		? allValidationTypes
		: [
			...allValidationTypes.slice(0, 2),
			() => '...',
			...allValidationTypes.slice(allValidationTypes.length - 2, allValidationTypes.length),
		]

	if (!isStrict(normalizedStrict) && !isTuple) {
		validationTypes.push(() => '[*]: *')
	}
	else if (!isStrict(normalizedStrict)) {
		validationTypes.push(() => '...*[]')
	}

	const type = isTuple
		? () => `[
  ${validationTypes.map(type => type()).join(',\n  ')}
]`
		: () => `{
  ${validationTypes.map(type => type()).join(',\n  ')}
}`

	const rejectorsEntries = validationEntries.map(([key, validation]) =>
		[key, asRejectingValidator(validation)] as [string, TypeValidation<any>])

	propertySpec = fromEntries(rejectorsEntries) as typeof propertySpec

	const result: ObjectOfTypeValidation<T> = Object.assign(
		registerRejectingValidator(
			(val: unknown, rejectionReasons?): val is T => {
				if (!isObject(val)) {
					rejectionReasons?.(createRejection(
						rejectionMessage`Value ${val} is not an object`,
						type(),
					))

					return false
				}

				if (isTuple && !Array.isArray(val)) {
					rejectionReasons?.(createRejection(
						rejectionMessage`Value ${val} is not an array`,
						type(),
					))

					return false
				}

				const result = Object.entries(propertySpec)
					.every(([key, validation]) => (validation as AnyTypeValidation<unknown>)(
						val[key],
						rejectionReasons && (rejection => {
							rejection.path.push(pathKey(key))

							return rejectionReasons(rejection)
						}),
					))

				if (!isStrict(normalizedStrict) || !result) {
					return result
				}

				const supportedKeys = new Set(Object.keys(propertySpec))

				return Object.keys(val)
					.every(key => {
						if (!rejectionReasons) {
							return supportedKeys.has(key)
						}
						else if (supportedKeys.has(key)) {
							return true
						}

						rejectionReasons(createRejection(
							rejectionMessage`Object has redundant key ${key}, and failed strict validation`,
							type(),
							[pathKey(key)],
						))
					})
			},
			type,
			(transformation, args) => {
				const transformedValidators: typeof rejectorsEntries =
					rejectorsEntries.map(
						([key, validation]) => [key, validation[transformValidation](transformation, args)],
					)

				let resultStrict = normalizedStrict

				if (transformation === strictnessTransformation) {
					const [strict] = args

					if (!isValidStrictness(strict)) {
						throw new Error(`Invalid strictness arg!
Arg: ${strict}`)
					}

					if (isUnlocked(strict) || !isLocked(normalizedStrict)) {
						resultStrict = normalizeStrictness(strict)
					}
				}

				// Remove length validation from explicit validator (it would be re-added)
				if (isTuple && isStrict(normalizedStrict)) {
					transformedValidators.pop()
				}

				const objectOfValidators: typeof propertySpec = isTuple
					? transformedValidators.map(([, validation]) => validation)
					: fromEntries(transformedValidators) as any

				return objectOf(objectOfValidators, { strict: resultStrict })
			},
		), {
			// Overridden below
			isStrict: false,
			strict() {
				return validation.strict(result)
			},
			unstrict() {
				return validation.unstrict(result)
			},
			lock() {
				if (isLocked(normalizedStrict)) {
					return result
				}
				else if (isStrict(normalizedStrict)) {
					return result[transformValidation](
						strictnessTransformation,
						[StrictnessKind.StrictLocked],
					) as ObjectOfTypeValidation<T>
				}
				else {
					return result[transformValidation](
						strictnessTransformation,
						[StrictnessKind.UnstrictLocked],
					) as ObjectOfTypeValidation<T>
				}
			},
			unlock() {
				if (!isLocked(normalizedStrict)) {
					return result
				}
				else if (isStrict(normalizedStrict)) {
					return result[transformValidation](
						strictnessTransformation,
						[StrictnessKind.StrictUnlocked],
					) as ObjectOfTypeValidation<T>
				}
				else {
					return result[transformValidation](
						strictnessTransformation,
						[StrictnessKind.UnstrictUnlocked],
					) as ObjectOfTypeValidation<T>
				}
			},
			propertySpec: () => (Array.isArray(propertySpec)
				? [...propertySpec]
				: { ...propertySpec }) as typeof propertySpec,
		})

	// Lock `isStrict`
	Object.defineProperty(result, 'isStrict', {
		configurable: true,
		enumerable: true,
		writable: false,
		value: isStrict(normalizedStrict),
	})

	return result
}

const validation = Object.assign(
	objectOf, {
		/**
	 * Returns a new validation where all nested `objectOf` validations are strict
	 * @param validation The validation to make strict
	 */
		strict<T extends TypeValidation<any>>(validation: T): T {
			return validation[transformValidation](strictnessTransformation, [StrictnessKind.Strict]) as T
		},
		/**
	* Returns a new validation where all nested `objectOf` validations are non-strict
	* @param validation The validation to make non-strict
	*/
		unstrict<T extends TypeValidation<any>>(validation: T): T {
			return validation[transformValidation](strictnessTransformation, [StrictnessKind.Unstrict]) as T
		},
	})

export { validation as objectOf }
export default validation

const isValidStrictness = anyOf(
	boolean,
	enumOf<Strictness>(
		'strict',
		'strict-locked',
		'strict-unlocked',
		'unstrict',
		'unstrict-locked',
		'unstrict-unlocked',
	),
)

function normalizeStrictness(strict: Strictness | boolean = 'unstrict'): Strictness {
	if (typeof strict === 'boolean') {
		strict = strict
			? 'strict'
			: 'unstrict'
	}
	else if (isUnlocked(strict)) {
		strict = strict === 'strict-unlocked'
			? 'strict'
			: 'unstrict'
	}

	return strict
}

function isStrict(strict: Strictness): boolean {
	return strict === 'strict' ||
		strict === 'strict-locked' ||
		strict === 'strict-unlocked'
}

function isLocked(strict: Strictness): boolean {
	return strict === 'strict-locked' ||
		strict === 'unstrict-locked'
}

function isUnlocked(strict?: Strictness | boolean): boolean {
	return strict === 'strict-unlocked' ||
		strict === 'unstrict-unlocked'
}
