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
 * Creates a validator that validates that an object has all the provided keys, and optionally prevents from \
 * the object to have additional keys
 * @param propsValidation An object that provides a type validator for each property of a validated object
 * @param {strict} `true` to create a validator that fails if an object has more properties than the provided validations;\
 * Otherwise `false`
 * @returns A validator that validates that an object has all the provided keys, and optionally prevents from \
 * the object to have additional keys
 */
export function objectOf<T extends object>(
  propsValidation: ObjectOrTupleValidations<T>,
  { strict }: ObjectOfOptions = {}
): TypeValidation<T> {
  const validationEntries = Object.entries(propsValidation) as [string, AnyTypeValidation<T[keyof T]>][]
  let isTuple = false

  if (Array.isArray(propsValidation)) {
    isTuple = true
    strict = strict ?? true

    if (strict) {
      validationEntries.push(['length', is(propsValidation.length)])
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

  propsValidation = fromEntries(rejectorsEntries) as typeof propsValidation

  const result: TypeValidation<T> = registerRejectingValidator(
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

      const result = Object.entries(propsValidation)
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

      const supportedKeys = new Set(Object.keys(propsValidation))

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

      // Remove length validation from explicit validator (it would be re-added)
      if (isTuple && strict) {
        transformedValidators.pop()
      }

      const objectOfValidators: typeof propsValidation = isTuple
        ? transformedValidators.map(([, validation]) => validation)
        : fromEntries(transformedValidators) as any

      return objectOf(objectOfValidators, { strict })
    }
  )

  return result
}

export default objectOf
