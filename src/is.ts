import { TypeValidation } from './Common'
import { createRejection, registerRejectingValidator, rejectionMessage } from './RejectionReasons'
import { typeOf } from './typeOf'

/**
 * Creates a validator that only allow values which strictrly equal to `val`
 * @param expectedValue Value to create validator that only allow values which strictrly equal to `val`
 * @returns A validator that only allow values which strictrly equal to `val`
 */
export function is<T>(expectedValue: T): TypeValidation<T> {
  const type = typeOf(expectedValue)

  return registerRejectingValidator(
    ((actualValue, rejectionReason?): actualValue is T => {
      const result = Object.is(actualValue, expectedValue)

      if (!result && rejectionReason) {
        rejectionReason(createRejection(
          rejectionMessage`Value ${actualValue} is not equal to ${expectedValue}`,
          type
        ))
      }

      return result
    }),
    type
  )
}

export default is
