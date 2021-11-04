import { createRejection, registerRejectingValidator, rejectionMessage } from './RejectionReasons'
import type { TypeValidation } from './Common'

const IS_EMPTY_ARRAY_TYPE = '[]'

/**
 * A validator that checks if a value is an empty array
 */
export const isEmptyArray = registerRejectingValidator(
  ((val: unknown, rejectionReasons?): val is [] => {
    if (!Array.isArray(val)) {
      rejectionReasons?.(createRejection(
        rejectionMessage`Value ${val} is not an array`,
        IS_EMPTY_ARRAY_TYPE
      ))

      return false
    }
    else if (val.length > 0) {
      rejectionReasons?.(createRejection(
        rejectionMessage`Array ${val} is not empty`,
        IS_EMPTY_ARRAY_TYPE
      ))

      return false
    }

    return true
  }),
  IS_EMPTY_ARRAY_TYPE
)

export default isEmptyArray
