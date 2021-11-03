import {
  AnyTypeValidation,
  MAX_DISPLAYED_TYPES,
  TypeValidation,
  ValidatedTypes
  } from './Common'
import { asRejectingValidator, registerRejectingValidator, typeName } from './RejectionReasons'
import { every } from '@reactivex/ix-es2015-cjs/iterable/every'
import { from } from '@reactivex/ix-es2015-cjs/iterable/from'
import { map } from '@reactivex/ix-es2015-cjs/iterable/operators/map'

/**
 * An intersection of all types in a tuple
 */
export type IntersectionOf<T> = T extends readonly [infer U, ...infer V]
  ? U & IntersectionOf<V>
  : unknown

/**
 * At least one type-validation
 */
export type AllOfArgs = readonly [AnyTypeValidation<any>, ...AnyTypeValidation<any>[]]

/**
 * Creates a validator that checks that a value satisfies all the provided type-guards
 * @param validations Type guards to validate a value
 * @returns A validator that checks that a value satisfies all the provided type-guards
 */
export function allOf<T extends AllOfArgs>(
  ...validations: T
): TypeValidation<IntersectionOf<ValidatedTypes<T>>>
/**
 * Creates a validator that checks that a value satisfies all the provided type-guards
 * @param firstValidation A type validation
 * @param validations Type validations
 * @returns A validator that checks that a value satisfies all the provided type-guards
 */
export function allOf<T>(
  firstValidation: AnyTypeValidation<T>,
  ...validations: readonly AnyTypeValidation<T>[]
): TypeValidation<T>
export function allOf(
  ...validations: AnyTypeValidation<any>[]
): TypeValidation<IntersectionOf<ValidatedTypes<any>>> {
  const allTypes = validations
    .map(validation => typeName(validation))
  const types = allTypes.length <= MAX_DISPLAYED_TYPES
    ? allTypes
    : [
      ...allTypes.slice(0, 2),
      '...',
      ...allTypes.slice(allTypes.length - 2, allTypes.length)
    ]
  const type = types.join(' & ')

  const rejectingValidations = from(validations)
    .pipe(
      map(validation => asRejectingValidator(validation))
    )

  return registerRejectingValidator(
    ((item: unknown, rejectionReasons?): item is IntersectionOf<ValidatedTypes<any>> => every(
      rejectingValidations,
      validation => validation(
        item,
        rejectionReasons && (rejection => rejectionReasons(rejection))
      ))),
    type
  )
}

export default allOf
