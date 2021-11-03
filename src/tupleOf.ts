import { TypeValidation } from './Common'
import { objectOf, ObjectOrTupleValidations } from './objectOf'


/**
 * Creates a validator that validates that an object is an array with specific length,
 * has all the provided indices validated.
 * @param validations The tuple positional validations
 * @returns A validator that validates that an object is an array with specific length,
 * has all the provided indices validated.
 */
export function tupleOf<T extends any[]>(
  ...validations: ObjectOrTupleValidations<T>
): TypeValidation<T> {
  return objectOf<T>(validations, { strict: true })
}

export default tupleOf
