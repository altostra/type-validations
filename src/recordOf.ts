import type {
	AnyTypeValidation,
	TypeValidation,
} from './Common'
import {
	isObject,
	pathKey,
	transformValidation,
} from './Common'
import {
	asRejectingValidator,
	createRejection,
	indent,
	literal,
	registerRejectingValidator,
	rejectionMessage,
	typeName,
} from './RejectionReasons'

/**
 * Validators specification for `recordOf` validation.
 */
export interface RecordValidations<T, TKey extends string = string> {
	/**
	 * Record properties validator
	 */
	value: AnyTypeValidation<T>
	/**
	 * Record property-keys validator
	 */
	key?: AnyTypeValidation<TKey>
}

/**
 * Creates a validator that validates that all own-enumerable props of an object are of specified type
 * @param propsTypeValidation Record properties validator
 * @returns A validator that validates that all own-enumerable props of an object are of specified type
 */
export function recordOf<T>(
	propsTypeValidation: AnyTypeValidation<T>,
): TypeValidation<Record<number | string, T>>
/**
 * Creates a validator that validates that all own-enumerable props of an object are of specified type
 * @param validations Record validators
 * @returns A validator that validates that all own-enumerable props of an object are of specified type
 */
export function recordOf<T, TKey extends string>(
	validations: RecordValidations<T, TKey>
): TypeValidation<Record<TKey, T>>
export function recordOf<T, TKey extends string = string>(
	options: AnyTypeValidation<T> | RecordValidations<T, TKey>,
): TypeValidation<Record<TKey, T>> {
	let propsTypeValidation: AnyTypeValidation<T>
	let keysTypeValidation: AnyTypeValidation<TKey> | undefined = undefined

	if (typeof options === 'function') {
		propsTypeValidation = options
	}
	else {
		propsTypeValidation = options.value
		keysTypeValidation = options.key
	}

	const keyTypeName = keysTypeValidation
		? () => typeName(keysTypeValidation!)
		: () => '*'
	const type = () => `{ [${keyTypeName()}]: ${indent(typeName(propsTypeValidation), '	')} }`
	const propsValidation = asRejectingValidator(propsTypeValidation)
	const keysValidation = keysTypeValidation && asRejectingValidator(keysTypeValidation)

	return registerRejectingValidator(
		(val: unknown, rejectionReasons?): val is Record<number | string, T> => {
			if (!isObject(val)) {
				rejectionReasons?.(createRejection(
					rejectionMessage`Value ${val} is not an object`,
					type(),
				))

				return false
			}

			return Object.entries(val)
				.every(([key, recordValue]) =>
					(!keysValidation || keysValidation(
						key,
						rejectionReasons && (rejection => rejectionReasons(({
							...rejection,
							reason: rejectionMessage`Invalid record key ${key}: ${literal(rejection.reason)}`,
						}))),
					)) &&
					propsValidation(
						recordValue,
						rejectionReasons && (rejection => {
							rejection.path.push(pathKey(key))

							return rejectionReasons(rejection)
						}),
					))
		},
		type,
		(transformation, args) => recordOf({
			value: propsValidation[transformValidation](transformation, args),
			key: keysValidation?.[transformValidation](transformation, args),
		}),
	)
}

export default recordOf
