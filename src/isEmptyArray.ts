import { TypeValidation } from './Common'
import { createRejection, registerRejectingValidator, rejectionMessage } from './RejectionReasons'

const IS_EMPTY_ARRAY_TYPE = '[]'
export const isEmptyArray = registerRejectingValidator(
  ((val: unknown, rejectionReasons?) => {
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
  }) as TypeValidation<[]>,
  IS_EMPTY_ARRAY_TYPE
)

export default isEmptyArray
