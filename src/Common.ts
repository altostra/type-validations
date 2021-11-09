import { isTypeValidation, typeValidatorType, ValidationRejection } from './RejectionReasons'

export const MAX_DISPLAYED_TYPES = 5

/**
 * TS has problem to convert a func-to-boolean into a type-guard, and vice versa \
 * so whenever we want a user to be able to use either - use this type
 */
export type AnyTypeValidation<T> =
  | ((item: unknown) => item is T)
  | ((item: unknown) => boolean)
  | TypeValidation<T>

/**
* Type validator that can validate values' types and have metadata and validation rejection reasons
* @param item Value to validate
* @param [rejectionReasons] Optional callback that would be called with validation rejection reasons.\
* \
* When validation succeeds - `rejectionReasons` would **not** be invoked.\
* When validation fails - `rejectionReasons` would be invoked **at least once**,
* and **may be invoked multiple times**.
* @returns `true` if **`item`** is valid as to the validated type; otherwise `false`.
*/
export type TypeValidationFunc<T> = (
  value: unknown,
  rejectionReasons?: (rejection: ValidationRejection) => void
) => value is T

export const transformValidation = Symbol('transform')

/**
 * Type validator that can validate values' types and have metadata and validation rejection reasons
 * @param value Value to validate
 * @param [rejectionReasons] Optional callback that would be called with validation rejection reasons.\
 * \
 * When validation succeeds - `rejectionReasons` would **not** be invoked.\
 * When validation fails - `rejectionReasons` would be invoked **at least once**,
 * and **may be invoked multiple times**.
 * @returns `true` if **`value`** is valid as to the validated type; otherwise `false`.
 */
export interface TypeValidation<T> extends TypeValidationFunc<T> {
  /**A description of the validated type */
  [typeValidatorType]: string
  /**
   * Returns a predicate (no second argument) for the specified validator
   * @returns A predicate (no second argument) for the specified validator
   */
  asPredicate(this: TypeValidation<T>): (val: unknown) => boolean
  /**
   * Returns a type-guard predicate (no second argument) for the specified validator
   * @returns A type-guard predicate (no second argument) for the specified validator
   */
  asTypePredicate(this: TypeValidation<T>): (val: unknown) => val is T
  /**
   * Create a new TypeValidation where the specified transformation is applied.
   */
  [transformValidation]: (transformation: Symbol, args: unknown[]) => TypeValidation<T>
}

/*
 * A type that convert a predicate (function to boolean) to a type-guard of a specified type
 */
export type AsTypeValidation<T, TFunc extends (arg: any) => boolean> = TFunc extends (arg: unknown) => boolean
  ? TypeValidation<T>
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

export function typeOf<T extends AnyTypeValidation<unknown>>(validator: T): ValidatorType<T> {
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

/**
 * Transforms a tuple of validations to tuple of the validated types
 */
export type ValidatedTypes<T> = T extends [AnyTypeValidation<infer U>, ...infer Rest]
  ? [U, ...ValidatedTypes<Rest>]
  : T

export type NotEmptyArray<T> = readonly [T, ...T[]]
