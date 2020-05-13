import { anyOf } from './anyOf'
import { TypeValidation } from './Common'
import { is } from './is'

/**
 * Creates a TypeValidator that validates that a value is one of specified values
 * @param val1 Enum value
 * @param val2 Enum value
 * @returns A TypeValidator that validates that a value is one of specified values
 */
export function enumOf<T1, T2>(val1: T1, val2: T2): TypeValidation<T1 | T2>
/**
 * Creates a TypeValidator that validates that a value is one of specified values
 * @param val1 Enum value
 * @param val2 Enum value
 * @param val3 Enum value
 * @returns A TypeValidator that validates that a value is one of specified values
 */
export function enumOf<T1, T2, T3>(val1: T1, val2: T2, val3: T3): TypeValidation<T1 | T2 | T3>
/**
 * Creates a TypeValidator that validates that a value is one of specified values
 * @param val1 Enum value
 * @param val2 Enum value
 * @param val3 Enum value
 * @param val4 Enum value
 * @returns A TypeValidator that validates that a value is one of specified values
 */
export function enumOf<T1, T2, T3, T4>(
  val1: T1,
  val2: T2,
  val3: T3,
  val4: T4
): TypeValidation<T1 | T2 | T3 | T4>
/**
 * Creates a TypeValidator that validates that a value is one of specified values
 * @param val1 Enum value
 * @param val2 Enum value
 * @param val3 Enum value
 * @param val4 Enum value
 * @param val5 Enum value
 * @returns A TypeValidator that validates that a value is one of specified values
 */
export function enumOf<T1, T2, T3, T4, T5>(
  val1: T1,
  val2: T2,
  val3: T3,
  val4: T4,
  val5: T5
): TypeValidation<T1 | T2 | T3 | T4 | T5>
/**
 * Creates a TypeValidator that validates that a value is one of specified values
 * @param values Values of the enumeration
 * @returns A TypeValidator that validates that a value is one of specified values
 */
export function enumOf<T>(...values: T[]): TypeValidation<T>
export function enumOf<T>(...values: T[]): TypeValidation<T> {
  return anyOf(...values.map(is))
}

export default enumOf
