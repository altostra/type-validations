import {
  AnyTypeValidation,
  fromEntries,
  isObject,
  Key,
  MAX_DISPLAYED_TYPES,
  pathKey,
  transformValidation,
  TypeValidation
  } from './Common'
import is from './is'
import {
  asRejectingValidator,
  createRejection,
  indent,
  registerRejectingValidator,
  rejectionMessage,
  typeName
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
  ? T[K] | AnyTypeValidation<T[K]>
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
  strict?: boolean
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
  /**
   * Returns a `ObjectOfTypeValidation<T>` validation that also checks that the
   * object contains no unspecified properties.
   *
   * Affect all `objectOf` validations,  \
   * If one of the specified properties is also an object validated using `objectOf`,
   * in the returned validation the property would also perform strict validations,
   * and so on, recursively.
   * @example
   * const testedObject = {
   *   nested: {
   *     a: 1,
   *     b: 2,
   *   },
   * }
   *
   * const isMyObject = objectOf({
   *   nested: objectOf({
   *     a: number,
   *   })
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
   * Affect all `objectOf` validations,  \
   * If one of the specified properties is also an object validated using `objectOf`,
   * in the returned validation the property would also perform non-strict validations,
   * and so on, recursively.
   * @example
   * const testedObject = {
   *   nested: {
   *     a: 1,
   *     b: 2,
   *   },
   * }
   *
   * const isStrictlyMyObject = objectOf({
   *   // This nested property is strictly validated
   *   nested: objectOf({
   *     a: number,
   *   }).strict()
   * })
   *
   * const isMyObject = isStrictlyMyObject.unstrict()
   *
   * const tested = isStrictlyMyObject(testedObject) // false
   * const nonStrictlyTested = isMyObject(testedObject) // true
   */
  unstrict(): ObjectOfTypeValidation<T>
  /**
   * Returns the `propertiesSpec` used to create this validation.
   */
  propertySpec(): ObjectOrTupleValidations<T>
}

/**
 * Creates a validator that validates that an object has all the provided keys, and optionally prevents from \
 * the object to have additional keys
 * @param propertySpec An object that provides a type validator for each property of a validated object
 * @param {strict} `true` to create a validator that fails if an object has more properties than the provided validations;\
 * Otherwise `false` \
 * \
 * Does not affect validations specified by `propertySpec`.
 * @returns A validator that validates that an object has all the provided keys, and optionally prevents from \
 * the object to have additional keys
 */
function objectOf<T extends object>(
  propertySpec: ObjectOrTupleValidations<T>,
  { strict }: ObjectOfOptions = {}
): ObjectOfTypeValidation<T> {
  const validationEntries = Object.entries(propertySpec) as [string, AnyTypeValidation<T[keyof T]>][]
  let isTuple = false

  if (Array.isArray(propertySpec)) {
    isTuple = true
    strict = strict ?? true

    if (strict) {
      validationEntries.push(['length', is(propertySpec.length)])
    }
  }

  const allValidationTypes = validationEntries
    .map(([key, validator]) => isTuple
      ? indent(typeName(validator), '  ')
      : `${literalKey(key)}: ${indent(typeName(validator), '  ')}`)

  // Remove length validation from printed type
  if (isTuple && strict) {
    allValidationTypes.pop()
  }

  const validationTypes = allValidationTypes.length <= MAX_DISPLAYED_TYPES
    ? allValidationTypes
    : [
      ...allValidationTypes.slice(0, 2),
      '...',
      ...allValidationTypes.slice(allValidationTypes.length - 2, allValidationTypes.length),
    ]

  if (!strict && !isTuple) {
    validationTypes.push('[*]: *')
  }
  else if (!strict) {
    validationTypes.push('...*[]')
  }

  const type = isTuple
    ? `[
  ${validationTypes.join(',\n  ')}
]`
    : `{
  ${validationTypes.join(',\n  ')}
}`

  const rejectorsEntries = validationEntries.map(([key, validation]) =>
    [key, asRejectingValidator(validation)] as [string, TypeValidation<any>])

  propertySpec = fromEntries(rejectorsEntries) as typeof propertySpec

  const result: ObjectOfTypeValidation<T> = Object.assign(
    registerRejectingValidator(
      ((val: unknown, rejectionReasons?): val is T => {
        if (!isObject(val)) {
          rejectionReasons?.(createRejection(
            rejectionMessage`Value ${val} is not an object`,
            type
          ))

          return false
        }
        if (isTuple && !Array.isArray(val)) {
          rejectionReasons?.(createRejection(
            rejectionMessage`Value ${val} is not an array`,
            type
          ))

          return false
        }

        const result = Object.entries(propertySpec)
          .every(([key, validation]) => (validation as AnyTypeValidation<unknown>)(
            val[key],
            rejectionReasons && (rejection => {
              rejection.path.push(pathKey(key))

              return rejectionReasons(rejection)
            })
          ))

        if (!strict || !result) {
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
              type,
              [pathKey(key)]
            ))
          })
      }),
      type,
      (transformation, args) => {
        const transformedValidators: typeof rejectorsEntries = rejectorsEntries.map(([key, validation]) =>
          [key, validation[transformValidation](transformation, args)])

        let isStrict = strict

        if (transformation === strictnessTransformation) {
          const [strict] = args

          if (typeof strict !== 'boolean') {
            throw new Error(`Invalid strictness arg!
Arg: ${strict}`)
          }

          isStrict = strict
        }

        // Remove length validation from explicit validator (it would be re-added)
        if (isTuple && strict) {
          transformedValidators.pop()
        }

        const objectOfValidators: typeof propertySpec = isTuple
          ? transformedValidators.map(([, validation]) => validation)
          : fromEntries(transformedValidators) as any

        return objectOf(objectOfValidators, { strict: isStrict })
      }
    ), {
    strict() {
      return validation.strict(result)
    },
    unstrict() {
      return validation.unstrict(result)
    },
    propertySpec: () => (Array.isArray(propertySpec)
      ? [...propertySpec]
      : { ...propertySpec }) as typeof propertySpec,
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
    return validation[transformValidation](strictnessTransformation, [true]) as T
  },
  /**
  * Returns a new validation where all nested `objectOf` validations are non-strict
  * @param validation The validation to make non-strict
  */
  unstrict<T extends TypeValidation<any>>(validation: T): T {
    return validation[transformValidation](strictnessTransformation, [false]) as T
  },
})

export { validation as objectOf }
export default validation
