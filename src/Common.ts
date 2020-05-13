import { isTypeValidation, typeValidatorType, ValidationRejection } from './RejectionReasons'

export const MAX_DISPLAYED_TYPES = 5

/**
 * TS has problem to convert a func-to-boolean into a type-guard, and vice versa \
 * so whenever we want a user to be able to use either - use this type
 */
export type AnyTypeValidation<T extends TInput, TInput = any> =
  | ((item: TInput) => item is T)
  | ((item: TInput) => boolean)
  | TypeValidation<T, TInput>

/**
* Type validator that can validate values' types and have metadata and validation rejection reasons
* @param item Value to validate
* @param [rejectionReasons] Optional callback that would be called with validaton rejecton reasons.\
* \
* When validation succeeds - `rejectionReasons` would **not** be invoked.\
* When validation fails - `rejectionReasons` would be invoked **at least once**,
* and **may be invoked multiple times**.
* @returns `true` if **`item`** is valid as to the validated type; otherwise `false`.
*/
export type TypeValidationFunc<T extends TInput, TInput = any> = (
  item: TInput,
  rejectionReasons?: (rejection: ValidationRejection) => void
) => item is T

/**
 * Type validator that can validate values' types and have metadata and validation rejection reasons
 * @param item Value to validate
 * @param [rejectionReasons] Optional callback that would be called with validaton rejecton reasons.\
 * \
 * When validation succeeds - `rejectionReasons` would **not** be invoked.\
 * When validation fails - `rejectionReasons` would be invoked **at least once**,
 * and **may be invoked multiple times**.
 * @returns `true` if **`item`** is valid as to the validated type; otherwise `false`.
 */
export interface TypeValidation<T extends TInput, TInput = any> extends TypeValidationFunc<T, TInput> {
  /**A description of the validated type */
  [typeValidatorType]: string
  /**
   * Returns a predicate (no second arguemnt) for the specified validator
   * @returns A predicate (no second arguemnt) for the specified validator
   */
  asPredicate(this: TypeValidation<T, TInput>): (val: TInput) => boolean
  /**
   * Returns a type-guard predicate (no second arguemnt) for the specified validator
   * @returns A type-guard predicate (no second arguemnt) for the specified validator
   */
  asTypePredicate(this: TypeValidation<T, TInput>): (val: TInput) => val is T
}

/*
 * A type that convert a predicate (function to boolean) to a type-gaurd of a specified type
 */
export type AsTypeValidation<T, TFunc extends (arg: any) => boolean> = TFunc extends (arg: infer TInput) => boolean
  ? T extends TInput ? TypeValidation<T, TInput> : never // We won't this to fail if T and TInput are invalid
  : never

/**
 * A type that convert a type-guard to a predicate (function to boolean)
 */
export type AsPredicate<TFunc extends TypeValidation<unknown>> = TFunc extends TypeValidation<unknown>
  ? ((...args: Parameters<TFunc>) => boolean)
  : never

export type ValidatorType<T extends AnyTypeValidation<unknown>> = T extends TypeValidation<unknown>
  ? string
  : undefined

export function typeOf<T extends AnyTypeValidation<unknown, any>>(validator: T): ValidatorType<T> {
  return (isTypeValidation(validator)
    ? validator[typeValidatorType]
    : undefined) as ValidatorType<T>
}

export function pathKey(key: string): string | number {
  const index = Number(key)

  return Number.isInteger(index) && index >= 0
    ? index
    : key
}

export type Key = keyof any

/**
 * Check if a value is javascript object
 * @param val The value to check
 */
export function isObject(val: unknown): val is Record<Key, unknown> {
  if (!val) {
    return false
  }

  const valType = typeof val

  return valType === 'object' || valType === 'function'
}

export const fromEntries = Object.fromEntries ?? fromEntriesPolyfill

function fromEntriesPolyfill<TValues>(entries: Iterable<[Key, TValues]>): Record<Key, TValues> {
  const result: Record<Key, TValues> = {}

  for (const [key, value] of entries) {
    result[key as any] = value
  }

  return result
}
