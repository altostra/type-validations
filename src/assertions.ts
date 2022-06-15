import type { AnyTypeValidation } from './Common'
import type { ValidationRejection } from './RejectionReasons'
import { asRejectingValidator } from './RejectionReasons'

/**
 * A function that if completes without throwing an error only if
 * the passed value is of specified type
 */
export type Assertion<T> = (val: unknown) => asserts val is T

/**
 * Creates an assertion function from the provided validation
 * @param validation Type validation for type `T`
 * @param errFactory A function that produce error from rejections
 *
 * @returns An assertion function for the validated type
 */
export function assertBy<T>(
	validation: AnyTypeValidation<T>,
	errFactory: (val: unknown, rejections: ValidationRejection[]) => unknown,
): Assertion<T> {
	const rejectingValidation = asRejectingValidator(validation)

	return function assertion(val: unknown) {
		const rejections: ValidationRejection[] = []

		if (!rejectingValidation(val, rej => rejections.push(rej))) {
			throw errFactory(val, rejections)
		}
	}
}
