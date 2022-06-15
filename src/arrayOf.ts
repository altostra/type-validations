import type { AnyTypeValidation, TypeValidation } from './Common'
import { transformValidation } from './Common'
import {
	asRejectingValidator,
	createRejection,
	registerRejectingValidator,
	rejectionMessage,
	typeName,
} from './RejectionReasons'

/**
 * Creates a type-guard that validates that a value is an array of elements of a specific type
 * @param elementTypeValidation Type-guard to validate array-elements
 * @returns A type-guard that validates that a value is an array of elements of a specific type
 */
export function arrayOf<T>(
	elementTypeValidation: AnyTypeValidation<T>,
): TypeValidation<T[]> {
	const type = () => `ArrayOf(${typeName(elementTypeValidation)})`
	const validation = asRejectingValidator(elementTypeValidation)

	return registerRejectingValidator(
		(val: unknown, rejectionReasons?): val is T[] => {
			if (!Array.isArray(val)) {
				rejectionReasons?.(createRejection(
					rejectionMessage`Value ${val} is not an array`,
					type(),
				))

				return false
			}

			return val.every((item, index) => validation(
				item,
				rejectionReasons && (rejection => {
					rejection.path.push(index)

					return rejectionReasons(rejection)
				}),
			))
		},
		type,
		(transform, args) => arrayOf(validation[transformValidation](transform, args)),
	)
}

export default arrayOf
