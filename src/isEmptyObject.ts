import { isObject, Key, TypeValidation } from './Common'
import { createRejection, registerRejectingValidator, rejectionMessage } from './RejectionReasons'

const EMPTY_OBJECT_TYPE = '{}'
export const isEmptyObject = registerRejectingValidator(
  ((val: unknown, rejectionReasons?) => {
    if (!isObject(val)) {
      rejectionReasons?.(createRejection(
        rejectionMessage`Value ${val} is not an object`,
        EMPTY_OBJECT_TYPE
      ))

      return false
    }
    else if (Object.keys(val).length > 0) {
      rejectionReasons?.(createRejection(
        rejectionMessage`Object ${val} is not emtpy`,
        EMPTY_OBJECT_TYPE
      ))

      return false
    }

    return true
  }) as TypeValidation<Record<Key, undefined>>,
  EMPTY_OBJECT_TYPE
)

export default isEmptyObject
