import { AnyTypeValidation, TypeValidation } from './Common'
import {
  asRejectingValidator,
  createRejection,
  registerRejectingValidator,
  rejectionMessage,
  typeName
  } from './RejectionReasons'

/**
 * Creates a type-guard that validates that a value is an array of elements of a specific type
 * @param elementTypeValidation Type-guard to validate array-elements
 * @returns A type-guard that validates that a value is an array of elements of a specific type
 */
export function arrayOf<T>(
  elementTypeValidation: AnyTypeValidation<T>
): TypeValidation<T[]> {
  const type = `ArrayOf(${typeName(elementTypeValidation)})`
  elementTypeValidation = asRejectingValidator(elementTypeValidation)

  return registerRejectingValidator(
    ((val: unknown, rejectionReasons?): val is T[] => {
      if (!Array.isArray(val)) {
        rejectionReasons && rejectionReasons(createRejection(
          rejectionMessage`Value ${val} is not an array`,
          type
        ))

        return false
      }

      return val.every((item, index) => elementTypeValidation(
        item,
        rejectionReasons && (rejection => {
          rejection.path.push(index)

          return rejectionReasons(rejection)
        })
      ))
    }),
    type
  )
}

export default arrayOf
