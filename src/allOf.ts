import { AnyTypeValidation, MAX_DISPLAYED_TYPES, TypeValidation } from './Common'
import { asRejectingValidator, registerRejectingValidator, typeName } from './RejectionReasons'
import { every } from '@reactivex/ix-es2015-cjs/iterable/every'
import { from } from '@reactivex/ix-es2015-cjs/iterable/from'
import { map } from '@reactivex/ix-es2015-cjs/iterable/operators/map'

/**
 * Creates a validator that checks that a value satisfies all the provided type-guards
 * @param validation1 A type-guard
 * @param validation2 A type-guard
 * @returns A validator that checks that a value satisfies all the provided type-guards
 */
export function allOf<T1, T2>(
  validation1: AnyTypeValidation<T1>,
  validation2: AnyTypeValidation<T2>
): TypeValidation<T1 & T2>
/**
 * Creates a validator that checks that a value satisfies all the provided type-guards
 * @param validation1 A type-guard
 * @param validation2 A type-guard
 * @param validation3 A type-guard
 * @returns A validator that checks that a value satisfies all the provided type-guards
 */
export function allOf<T1, T2, T3>(
  validation1: AnyTypeValidation<T1>,
  validation2: AnyTypeValidation<T2>,
  validation3: AnyTypeValidation<T3>
): TypeValidation<T1 & T2 & T3>
/**
 * Creates a validator that checks that a value satisfies all the provided type-guards
 * @param validation1 A type-guard
 * @param validation2 A type-guard
 * @param validation3 A type-guard
 * @param validation4 A type-guard
 * @returns A validator that checks that a value satisfies all the provided type-guards
 */
export function allOf<T1, T2, T3, T4>(
  validation1: AnyTypeValidation<T1>,
  validation2: AnyTypeValidation<T2>,
  validation3: AnyTypeValidation<T3>,
  validation4: AnyTypeValidation<T4>
): TypeValidation<T1 & T2 & T3 & T4>
/**
 * Creates a validator that checks that a value satisfies all the provided type-guards
 * @param validation1 A type-guard
 * @param validation2 A type-guard
 * @param validation3 A type-guard
 * @param validation4 A type-guard
 * @param validation5 A type-guard
 * @returns A validator that checks that a value satisfies all the provided type-guards
 */
export function allOf<T1, T2, T3, T4, T5>(
  validation1: AnyTypeValidation<T1>,
  validation2: AnyTypeValidation<T2>,
  validation3: AnyTypeValidation<T3>,
  validation4: AnyTypeValidation<T4>,
  validation5: AnyTypeValidation<T5>
): TypeValidation<T1 & T2 & T3 & T4 & T5>
/**
 * Creates a validator that checks that a value satisfies all the provided type-guards
 * @param validation1 A type-guard
 * @param validation2 A type-guard
 * @param validation3 A type-guard
 * @param validation4 A type-guard
 * @param validation5 A type-guard
 * @param validation6 A type-guard
 * @returns A validator that checks that a value satisfies all the provided type-guards
 */
export function allOf<T1, T2, T3, T4, T5, T6>(
  validation1: AnyTypeValidation<T1>,
  validation2: AnyTypeValidation<T2>,
  validation3: AnyTypeValidation<T3>,
  validation4: AnyTypeValidation<T4>,
  validation5: AnyTypeValidation<T5>,
  validation6: AnyTypeValidation<T6>
): TypeValidation<T1 & T2 & T3 & T4 & T5 & T6>
export function allOf<T>(
  ...validations: AnyTypeValidation<T>[]
): TypeValidation<T> {
  const allTypes = validations
    .map(validatation => typeName(validatation))
  const types = allTypes.length <= MAX_DISPLAYED_TYPES
    ? allTypes
    : [
      ...allTypes.slice(0, 2),
      '...',
      ...allTypes.slice(allTypes.length - 2, allTypes.length)
    ]
  const type = types.join(' & ')

  const rejectingValidatons = from(validations)
    .pipe(
      map(validation => asRejectingValidator(validation))
    )

  return registerRejectingValidator(
    ((item: unknown, rejectionReasons?): item is T => every(
      rejectingValidatons,
      validation => validation(
        item,
        rejectionReasons && (rejection => rejectionReasons(rejection))
      ))),
    type
  )
}

export default allOf
