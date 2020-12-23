import { anyOf, UnionOf } from './anyOf'
import { MAX_DISPLAYED_TYPES, TypeValidation } from './Common'
import { is } from './is'
import {
  createRejection,
  literal,
  registerRejectingValidator,
  rejectionMessage
  } from './RejectionReasons'
import { typeOf } from './typeOf'

/**
 * Creates a TypeValidator that validates that a value is one of specified values
 * @param values The enumerated values
 * @returns A TypeValidator that validates that a value is one of specified values
 */
export function enumOf<T extends readonly any[]>(...values: T): TypeValidation<UnionOf<T>>
/**
 * Creates a TypeValidator that validates that a value is one of specified values
 * @param values Values of the enumeration
 * @returns A TypeValidator that validates that a value is one of specified values
 */
export function enumOf<T>(...values: readonly T[]): TypeValidation<T>
export function enumOf<T extends readonly any[]>(...values: T): TypeValidation<UnionOf<T>> {
  const validValues = new Set(values)
  const types = values.map(typeOf)

  const typeParts = types.length <= MAX_DISPLAYED_TYPES
    ? types
    : [
      ...types.slice(0, 2),
      '...',
      ...types.slice(types.length - 2, types.length)
    ]

  const type = typeParts.join(' | ')

  return registerRejectingValidator(
    (val, rejectionsHandler?): val is UnionOf<T> => {
      const isValid = validValues.has(val)

      if (!isValid && rejectionsHandler) {
        rejectionsHandler(createRejection(
          rejectionMessage`Value ${val} is not one of the valid values: ${literal(types.join(', '))}`,
          type,
        ))
      }

      return isValid
    },
    type
  )
  // return anyOf(...values.map(is))
}

export default enumOf
