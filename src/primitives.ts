import { assertBy, Assertion } from './assertions'
import { TypeValidation } from './Common'
import { maybe } from './maybe'
import {
  createRejection,
  literal,
  registerRejectingValidator,
  rejectionMessage,
  ValidationRejection
  } from './RejectionReasons'
import type { FromTypeOf, JsType } from './JSTypes'

function simpleTypeValidation<T extends JsType>(type: T): TypeValidation<FromTypeOf<T>> {
  return registerRejectingValidator(
    ((val, rejectionReason?): val is FromTypeOf<T> => {
      if (typeof val === type) {
        return true
      }

      rejectionReason?.(createRejection(
        rejectionMessage`Value ${val} is not a ${literal(type)}`,
        type))

      return false
    }),
    type
  )
}

export type ErrFactory = (val: unknown, rejections: ValidationRejection[]) => any

/**
   * Validates that the parameter is a string
   */
export const string = simpleTypeValidation('string')

export function stringAssertion(errFactory: ErrFactory): Assertion<string> {
  return assertBy(string, errFactory)
}

/**
 * Validates that the parameter is a number
 */
export const number = simpleTypeValidation('number')

export function numberAssertion(errFactory: ErrFactory): Assertion<number> {
  return assertBy(number, errFactory)
}

/**
 * Validates that the parameter is a boolean
 */
export const boolean = simpleTypeValidation('boolean')

export function booleanAssertion(errFactory: ErrFactory): Assertion<boolean> {
  return assertBy(boolean, errFactory)
}

/**
 * Validates that the parameter is a null
 */
export const nullValidation = registerRejectingValidator(
  ((x: unknown, rejectionReason?): x is null => {
    if (x === null) {
      return true
    }

    rejectionReason?.(createRejection(
      rejectionMessage`Value ${x} is not ${null}`,
      'null'
    ))

    return false
  }),
  'null'
)
export { nullValidation as null }

export function nullAssertion(errFactory: ErrFactory): Assertion<null> {
  return assertBy(nullValidation, errFactory)
}

/**
 * Validates that the parameter is an undefined
 */
export const undefinedValidation = simpleTypeValidation('undefined')

export function undefinedAssertion(errFactory: ErrFactory): Assertion<undefined> {
  return assertBy(undefinedValidation, errFactory)
}

/**
 * Validates that the parameter is a symbol
 */
export const symbol = simpleTypeValidation('symbol')

export function symbolAssertion(errFactory: ErrFactory): Assertion<symbol> {
  return assertBy(symbol, errFactory)
}

/**
 * Validates that the parameter is a bigint
 */
export const bigint = simpleTypeValidation('bigint')

export function bigintAssertion(errFactory: ErrFactory): Assertion<bigint> {
  return assertBy(bigint, errFactory)
}

/**
 * Validates any parameter
 */
export const any = registerRejectingValidator(
  ((x: unknown): x is any => true),
  '*'
)
export function anyAssertion(errFactory?: ErrFactory): Assertion<any> {
  return () => { }
}

/**
 * Validates any parameter
 */
export const unknown: TypeValidation<unknown> = any

export const unknownAssertion: (errFactory?: ErrFactory) => Assertion<unknown> = anyAssertion

/**
 *
 * Invalidates any parameter
 */
export const never = registerRejectingValidator(
  ((val, rejectedReason?): val is never => {
    rejectedReason?.(createRejection(
      rejectionMessage`Value ${val} exists therefor is not 'never'.`,
      'X (never)'
    ))

    return false
  }),
  'X (never)'
)

export function assert(errFactory: ErrFactory): Assertion<never> {
  return assertBy(never, errFactory)
}

/**
 * Validates that the parameter is a string or undefined
 */
export const maybeString = maybe(string)

export function maybeStringAssertion(errFactory: ErrFactory): Assertion<string | undefined> {
  return assertBy(maybeString, errFactory)
}

/**
 * Validates that the parameter is a number or undefined
 */
export const maybeNumber = maybe(number)

export function maybeNumberAssertion(errFactory: ErrFactory): Assertion<number | undefined> {
  return assertBy(maybeNumber, errFactory)
}

/**
 * Validates that the parameter is a boolean or undefined
 */
export const maybeBoolean = maybe(boolean)

export function maybeBooleanAssertion(errFactory: ErrFactory): Assertion<boolean | undefined> {
  return assertBy(maybeBoolean, errFactory)
}

/**
 * Validates that the parameter is a null or undefined
 */
export const nullOrUndefined = maybe(nullValidation)

export function nullOrUndefinedAssertion(errFactory: ErrFactory): Assertion<null | undefined> {
  return assertBy(nullOrUndefined, errFactory)
}

/**
 * Validates that the parameter is a symbol or undefined
 */
export const maybeSymbol = maybe(symbol)

export function maybeSymbolAssertion(errFactory: ErrFactory): Assertion<symbol | undefined> {
  return assertBy(maybeSymbol, errFactory)
}

/**
 * Validates that the parameter is a bigint or undefined
 */
export const maybeBigint = maybe(bigint)

export function maybeBigintAssertion(errFactory: ErrFactory): Assertion<bigint | undefined> {
  return assertBy(maybeBigint, errFactory)
}
