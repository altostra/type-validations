import { AnyTypeValidation, MAX_DISPLAYED_TYPES, TypeValidation } from './Common'
import {
  asRejectingValidator,
  registerRejectingValidator,
  typeName,
  ValidationRejection
  } from './RejectionReasons'
import { from } from '@reactivex/ix-es2015-cjs/iterable/from'
import { map } from '@reactivex/ix-es2015-cjs/iterable/operators/map'
import { some } from '@reactivex/ix-es2015-cjs/iterable/some'

/**
 * Creates a validator that checks that a value is either of the types guarded by the provided type-guards
 * @param validation1 A type-guard
 * @param validation2 A type-guard
 * @returns A validator that checks that a value is either of the types guarded by the provided type-guards
 */
export function anyOf<
  T1 extends TInput1,
  T2 extends TInput2,
  TInput1 = unknown,
  TInput2 = unknown
>(
  validation1: AnyTypeValidation<T1, TInput1>,
  validation2: AnyTypeValidation<T2, TInput2>
): TypeValidation<T1 | T2, TInput1 | TInput2>
/**
 * Creates a validator that checks that a value is either of the types guarded by the provided type-guards
 * @param validation1 A type-guard
 * @param validation2 A type-guard
 * @param validation3 A type-guard
 * @returns A validator that checks that a value is either of the types guarded by the provided type-guards
 */
export function anyOf<
  T1 extends TInput1,
  T2 extends TInput2,
  T3 extends TInput3,
  TInput1 = unknown,
  TInput2 = unknown,
  TInput3 = unknown
>(
  validation1: AnyTypeValidation<T1, TInput1>,
  validation2: AnyTypeValidation<T2, TInput2>,
  validation3: AnyTypeValidation<T3, TInput3>
): TypeValidation<T1 | T2 | T3, TInput1 | TInput2 | TInput3>
/**
 * Creates a validator that checks that a value is either of the types guarded by the provided type-guards
 * @param validation1 A type-guard
 * @param validation2 A type-guard
 * @param validation3 A type-guard
 * @param validation4 A type-guard
 * @returns A validator that checks that a value is either of the types guarded by the provided type-guards
 */
export function anyOf<
  T1 extends TInput1,
  T2 extends TInput2,
  T3 extends TInput3,
  T4 extends TInput4,
  TInput1 = unknown,
  TInput2 = unknown,
  TInput3 = unknown,
  TInput4 = unknown
>(
  validation1: AnyTypeValidation<T1, TInput1>,
  validation2: AnyTypeValidation<T2, TInput2>,
  validation3: AnyTypeValidation<T3, TInput3>,
  validation4: AnyTypeValidation<T4, TInput4>
): TypeValidation<T1 | T2 | T3 | T4, TInput1 | TInput2 | TInput3 | TInput4>
/**
 * Creates a validator that checks that a value is either of the types guarded by the provided type-guards
 * @param validation1 A type-guard
 * @param validation2 A type-guard
 * @param validation3 A type-guard
 * @param validation4 A type-guard
 * @param validation5 A type-guard
 * @returns A validator that checks that a value is either of the types guarded by the provided type-guards
 */
export function anyOf<
  T1 extends TInput1,
  T2 extends TInput2,
  T3 extends TInput3,
  T4 extends TInput4,
  T5 extends TInput5,
  TInput1 = unknown,
  TInput2 = unknown,
  TInput3 = unknown,
  TInput4 = unknown,
  TInput5 = unknown
>(
  validation1: AnyTypeValidation<T1, TInput1>,
  validation2: AnyTypeValidation<T2, TInput2>,
  validation3: AnyTypeValidation<T3, TInput3>,
  validation4: AnyTypeValidation<T4, TInput4>,
  validation5: AnyTypeValidation<T5, TInput5>
): TypeValidation<T1 | T2 | T3 | T4 | T5, TInput1 | TInput2 | TInput3 | TInput4 | TInput5>
/**
 * Creates a validator that checks that a value is either of the types guarded by the provided type-guards
 * @param validations Type-guards
 * @returns A validator that checks that a value is either of the types guarded by the provided type-guards
 */
export function anyOf<
  T extends TInput,
  TInput = unknown
>(
  ...validations: AnyTypeValidation<T, TInput>[]
): TypeValidation<T, TInput>
export function anyOf<
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
  const type = types.join(' | ')

  const rejectingValidatons = from(validations)
    .pipe(
      map(validation => asRejectingValidator(validation))
    )

  return registerRejectingValidator(
    ((item: TInput, rejectionReason?) => {
      const rejections: ValidationRejection[] = []

      const isValid = some(
        rejectingValidatons,
        validation =>
          validation(
            item,
            rejectionReason && (rejection => rejections.push(rejection))
          )
      )

      if (!isValid && rejectionReason) {
        rejections.forEach(rejection => rejectionReason(rejection))
      }

      return isValid
    }) as TypeValidation<T, TInput>,
    type
  )
}

export default anyOf
