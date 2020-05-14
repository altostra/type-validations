import {
  AnyTypeValidation,
  isObject,
  pathKey,
  TypeValidation
  } from './Common'
import {
  asRejectingValidator,
  createRejection,
  indent,
  registerRejectingValidator,
  rejectionMessage,
  typeName
  } from './RejectionReasons'

/**
 * Creates a validator that validates that all own-enumerable props of an object are of specified type
 * @param propsTypeValidation Record properties validator
 * @returns A validator that validates that all own-enumerable props of an object are of specified type
 */
export function recordOf<T>(
  propsTypeValidation: AnyTypeValidation<T>,
): TypeValidation<Record<string | number, T>> {
  const type = `{ [*]: ${indent(typeName(propsTypeValidation), '  ')} }`
  propsTypeValidation = asRejectingValidator(propsTypeValidation)

  return registerRejectingValidator(
    ((val: unknown, rejectionReasons?): val is Record<string | number, T> => {
      if (!isObject(val)) {
        rejectionReasons?.(createRejection(
          rejectionMessage`Value ${val} is not an object`,
          type,
        ))

        return false
      }

      return Object.entries(val)
        .every(([key, recordValue]) =>
          propsTypeValidation(
            recordValue,
            rejectionReasons && (rejection => {
              rejection.path.push(pathKey(key))

              return rejectionReasons(rejection)
            })
          ))
    }),
    type
  )
}

export default recordOf
