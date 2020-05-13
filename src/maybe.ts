import { AnyTypeValidation, TypeValidation } from './Common'
import {
  arrayRejectionReasons,
  asRejectingValidator,
  createRejection,
  literal,
  registerRejectingValidator,
  rejectionMessage,
  typeName
  } from './RejectionReasons'

export type NullableType<T, WithNull extends boolean> = WithNull extends true
  ? T | undefined | null
  : T | undefined

/**
* Creates a validator that checks if a value is either of specified type or undefined
* @param validator A validator to check if a value is of specified type otherwise than undefined
* @param withNull A *falsie* value checks only for undefined besides the specified type-guard
* @returns A validator that checks if a value is either of specified type or undefined
*/
export function maybe<T extends TInput, TInput = any, TWithNull extends boolean = false>(
  validator: AnyTypeValidation<T, TInput>,
  withNull?: TWithNull
): TypeValidation<NullableType<T, TWithNull>, NullableType<TInput, TWithNull>> {
  const rejector = asRejectingValidator(validator)
  const baseType = typeName(validator)
  const nullType = withNull
    ? `${baseType} | null`
    : baseType

  const type = `?(${nullType})`

  return registerRejectingValidator(
    (value: NullableType<TInput, TWithNull>, rejectionReasone?): value is NullableType<T, TWithNull> => {
      const rejections = rejectionReasone && arrayRejectionReasons()

      const result = value === undefined ||
        (withNull && value === null) ||
        rejector(value, rejections)

      if (!result && rejectionReasone) {
        rejectionReasone(createRejection(
          withNull
            ? rejectionMessage`Value ${value} is not ${undefined}, ${null}, nor ${literal(nullType)}`
            : rejectionMessage`Value ${value} is not ${undefined} nor ${literal(nullType)}`,
          type
        ))

        rejections?.forEach(rejection => rejectionReasone(rejection))
      }

      return result
    },
    type
  )
}

export default maybe
