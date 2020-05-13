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
export function allOf<
  T1 extends TInput,
  T2 extends TInput,
  TInput = unknown
>(
  validation1: AnyTypeValidation<T1, TInput>,
  validation2: AnyTypeValidation<T2, TInput>
): TypeValidation<T1 & T2, TInput>
/**
 * Creates a validator that checks that a value satisfies all the provided type-guards
 * @param validation1 A type-guard
 * @param validation2 A type-guard
 * @param validation3 A type-guard
 * @returns A validator that checks that a value satisfies all the provided type-guards
 */
export function allOf<
  T1 extends TInput,
  T2 extends TInput,
  T3 extends TInput,
  TInput = unknown
>(
  validation1: AnyTypeValidation<T1, TInput>,
  validation2: AnyTypeValidation<T2, TInput>,
  validation3: AnyTypeValidation<T3, TInput>
): TypeValidation<T1 & T2 & T3, TInput>
/**
 * Creates a validator that checks that a value satisfies all the provided type-guards
 * @param validation1 A type-guard
 * @param validation2 A type-guard
 * @param validation3 A type-guard
 * @param validation4 A type-guard
 * @returns A validator that checks that a value satisfies all the provided type-guards
 */
export function allOf<
  T1 extends TInput,
  T2 extends TInput,
  T3 extends TInput,
  T4 extends TInput,
  TInput = unknown
>(
  validation1: AnyTypeValidation<T1, TInput>,
  validation2: AnyTypeValidation<T2, TInput>,
  validation3: AnyTypeValidation<T3, TInput>,
  validation4: AnyTypeValidation<T4, TInput>
): TypeValidation<T1 & T2 & T3 & T4, TInput>
/**
 * Creates a validator that checks that a value satisfies all the provided type-guards
 * @param validation1 A type-guard
 * @param validation2 A type-guard
 * @param validation3 A type-guard
 * @param validation4 A type-guard
 * @param validation5 A type-guard
 * @returns A validator that checks that a value satisfies all the provided type-guards
 */
export function allOf<
  T1 extends TInput,
  T2 extends TInput,
  T3 extends TInput,
  T4 extends TInput,
  T5 extends TInput,
  TInput = unknown
>(
  validation1: AnyTypeValidation<T1, TInput>,
  validation2: AnyTypeValidation<T2, TInput>,
  validation3: AnyTypeValidation<T3, TInput>,
  validation4: AnyTypeValidation<T4, TInput>,
  validation5: AnyTypeValidation<T5, TInput>
): TypeValidation<T1 & T2 & T3 & T4 & T5, TInput>
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
export function allOf<
  T1 extends TInput,
  T2 extends TInput,
  T3 extends TInput,
  T4 extends TInput,
  T5 extends TInput,
  T6 extends TInput,
  TInput = unknown
>(
  validation1: AnyTypeValidation<T1, TInput>,
  validation2: AnyTypeValidation<T2, TInput>,
  validation3: AnyTypeValidation<T3, TInput>,
  validation4: AnyTypeValidation<T4, TInput>,
  validation5: AnyTypeValidation<T5, TInput>,
  validation6: AnyTypeValidation<T6, TInput>
): TypeValidation<T1 & T2 & T3 & T4 & T5 & T6, TInput>
export function allOf<
  T extends TInput,
  TInput = unknown
>(
  ...validations: AnyTypeValidation<T, TInput>[]
): TypeValidation<T, TInput> {
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
    ((item: TInput, rejectionReasons?) => every(
      rejectingValidatons,
      validation => validation(
        item,
        rejectionReasons && (rejection => rejectionReasons(rejection))
      ))) as TypeValidation<T, TInput>,
    type
  )
}

export default allOf
