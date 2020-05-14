import { AnyTypeValidation } from './Common'
import { asRejectingValidator, ValidationRejection } from './RejectionReasons'

/**
 * A function that if completes without throwing an error only if
 * the passed value is of specified type
 */
export type Assertion<T extends TInput, TInput = unknown> =
  (val: TInput) => asserts val is T

/**
 * Creates an assertion function from the provided validation
 * @param validation Type validation for type `T`
 * @param errFactory A function that produce error from rejections
 *
 * @returns An assertion function for the validated type
 */
export function assertBy<T extends TInput, TInput = unknown>(
  validation: AnyTypeValidation<T, TInput>,
  errFactory: (val: unknown, rejetions: ValidationRejection[]) => unknown
): Assertion<T, TInput> {
  errFactory = errFactory

  const rejectingValidation = asRejectingValidator(validation)

  return function assertion(val: TInput) {
    const rejections: ValidationRejection[] = []

    if (!rejectingValidation(val, rej => rejections.push(rej))) {
      throw errFactory!(val, rejections)
    }
  }
}
