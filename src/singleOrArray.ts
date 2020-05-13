import { anyOf } from './anyOf'
import { arrayOf } from './arrayOf'
import { AnyTypeValidation, TypeValidation } from './Common'

/**
 * Creates a tye validator that validates a value to be of specified type, or an array of that type
 * @param validator Type validation
 * @return A tye validator that validates a value to be of specified type, or an array of that type
 */
export function singleOrArray<T>(validator: AnyTypeValidation<T>): TypeValidation<T | T[]> {
  return anyOf(
    validator,
    arrayOf(validator),
  )
}

export default singleOrArray
