import {
  AnyTypeValidation,
  MAX_DISPLAYED_TYPES,
  TypeValidation,
  ValidatedTypes
  } from './Common'
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
 * A union of all types in a tuple
 */
export type UnionOf<T> = T extends readonly [infer U, ...infer V]
  ? U | UnionOf<V>
  : never

/**
 * Creates a validator that checks that a value is at-least one of the types guarded by the provided type-guards
 * @param validations Type guards
 * @returns A validator that checks that a value is either of the types guarded by the provided type-guards
 */
export function anyOf<T extends readonly AnyTypeValidation<any>[]>(
  ...validations: T
): TypeValidation<UnionOf<ValidatedTypes<T>>>
/**
 * Creates a validator that checks that a value is either of the types guarded by the provided type-guards
 * @param validations Type-guards
 * @returns A validator that checks that a value is either of the types guarded by the provided type-guards
 */
export function anyOf<T>(
  ...validations: readonly AnyTypeValidation<T>[]
): TypeValidation<UnionOf<ValidatedTypes<T>>>
export function anyOf<T extends readonly AnyTypeValidation<any>[]>(
  ...validations: T
): TypeValidation<UnionOf<ValidatedTypes<T>>> {
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
    ((item: unknown, rejectionReason?): item is UnionOf<ValidatedTypes<T>> => {
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
    }),
    type
  )
}

export default anyOf
