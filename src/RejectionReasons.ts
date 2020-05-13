import {
  AnyTypeValidation,
  fromEntries,
  isObject,
  Key,
  TypeValidation,
  TypeValidationFunc
  } from './Common'
import { concat } from '@reactivex/ix-es2015-cjs/iterable/concat'
import { from } from '@reactivex/ix-es2015-cjs/iterable/from'
import { map } from '@reactivex/ix-es2015-cjs/iterable/operators/map'
import { take } from '@reactivex/ix-es2015-cjs/iterable/operators/take'
import { inspect } from 'util'

/**
 * A description or why value didn't pass validations
 */
export interface ValidationRejection {
  /**
   * The path of he failed property, from inner-most, out.
   */
  path: (string | number)[]
  /**
   * An explanation of why the value failed validation
   */
  reason: string
  /**
   * A description of the type expected by the failing property
   */
  propertyType: string
}

/**
 * Type name of unknown types
 */
export const CUSTOM_TYPE = '* (Custom type)'
export function typeName(validator: AnyTypeValidation<any>): string {
  return isTypeValidation(validator)
    ? validator[typeValidatorType]
    : `* (${validator.name || 'Custom type'})`
}

/**
 * A symbol that gets a validator's type
 */
export const typeValidatorType = Symbol('type')

/**
 * Checks if a given function is a type-validator
 * @param f The function to check
 * @returns `true` if *`f`* is type-validator; otherwise, `false`.
 */
export function isTypeValidation<T extends TInput, TInput = unknown>(
  f: AnyTypeValidation<T, TInput>
): f is TypeValidation<T, TInput> {
  return typeof f === 'function' &&
    Object.prototype.hasOwnProperty.call(f, typeValidatorType)
}

const predicates = new WeakMap<TypeValidation<any, any>, (val: any) => boolean>()

/**
 * Returns a type-guard predicate (no second arguemnt) for the specified validator
 * @returns A type-guard predicate (no second arguemnt) for the specified validator
 */
export function asPredicate<T extends TInput, TInput = any>(this: TypeValidation<T, TInput>): (val: TInput) => boolean {
  if (predicates.has(this)) {
    return predicates.get(this)!
  }

  // To preserve function name
  const thisName = this.name
  const obj = {
    [thisName]: (val: TInput) => this(val)
  }
  const result = obj[thisName]

  predicates.set(this, result)
  return result
}

/**
 * Registers a validator as a validator that notifies with rejection reasons.\
 * \
 * *This function does not change the function, and does not caus it to notify.*
 * @param validator The validator to register, and add methods and metadata to
 * @param type The checked type be the validator
 *
 * @returns The function with metadata stored for it.
 */
export function registerRejectingValidator<T>(
  validator: TypeValidationFunc<T>,
  type: string
): TypeValidation<T> {
  Object.assign(validator, {
    [typeValidatorType]: type,
    asPredicate,
    asTypePredicate: asPredicate,
  })

  return validator as TypeValidation<T>
}

/**
 * Wraps a validator function with function that emit rejection reasons when validation by the provided
 * validator fails
 * @param validator The validator to wrap
 * @param rejectionGenerator A function that can create rejection reason for a failed value
 * @param type A string that describe the validated type
 * @returns A type validator that wraps a validator function with function that emit rejection reasons
 * when validation by the provided validator fails
 */
export function setValidatorRejection<T>(
  validator: AnyTypeValidation<T>,
  rejectionGenerator?: (rejectedValue: unknown) => ValidationRejection,
  type?: string
): TypeValidation<T> {
  type = type ?? typeName(validator)
  rejectionGenerator = rejectionGenerator ?? (value => createRejection(
    `Value [${value}] failed validation`,
    type!
  ))

  // To preserve function name
  const functionName = validator.name
  const obj = {
    [functionName]: ((
      value: unknown,
      rejectionReasons?: (rejection: ValidationRejection) => void
    ) => {
      const isValid = validator(value)

      if (!isValid && rejectionReasons) {
        rejectionReasons(rejectionGenerator!(value))
      }

      return isValid
    }) as TypeValidation<T>
  }

  return registerRejectingValidator(obj[functionName], type)
}

/**
 * Converts a validator to full type-validator (of a custom type)
 * @param validator The validator to convert to full type-validator
 * @returns A full type-validator (of a custom type)
 */
export function asRejectingValidator<T>(validator: AnyTypeValidation<T>): TypeValidation<T> {
  if (isTypeValidation(validator)) {
    return validator
  }

  // To preserve function name
  const functionName = validator.name
  const obj = {
    [functionName]: ((
      value: unknown,
      rejectionReasons?: (rejection: ValidationRejection) => void
    ) => {
      let wasRejectionEmitted = false
      const isValid = (validator as TypeValidation<T>)(
        value,
        rejectionReasons && ((rejection: ValidationRejection) => {
          wasRejectionEmitted = true
          rejectionReasons(rejection)
        })
      )

      if (!isValid && !wasRejectionEmitted && rejectionReasons) {
        rejectionReasons(createRejection(
          `Value [${value}] failed validation`,
          typeName(validator)
        ))
      }

      return isValid

    }) as TypeValidation<T>
  }

  const result = obj[functionName]
  return registerRejectingValidator(result, typeName(result))
}

/**
 * Wraps a validator function with function that emit rejection reasons mapped from the original rejections
 * @param validator The validator to wrap
 * @param rejectionGenerator A function that can create rejection reason for a failed value
 * @param type A string that describe the validated type
 * @returns A type validator that wraps a validator function with function that emit rejection reasons mapped from the original rejections
 */
export function mapRejection<T>(
  validator: TypeValidation<T>,
  rejectionProjections: (value: unknown, rejection: ValidationRejection) => ValidationRejection,
  type?: string
): TypeValidation<T> {
  // To preserve function name
  const validatorName = validator.name
  const obj = {
    [validatorName]: ((value, rejectionReason?) => validator(
      value,
      rejectionReason && (rejection => rejectionReason(rejectionProjections(value, rejection))))) as TypeValidation<T>
  }

  return registerRejectingValidator(obj[validatorName], type ?? validator[typeValidatorType])
}


export function createRejection(
  reason: string,
  propertyType: string,
  path: ValidationRejection['path'] = []
): ValidationRejection {
  return {
    path,
    reason,
    propertyType,
  }
}

/**
 * A type that can be passed to type-validators, and is array of rejections.
 */
export type ArrayRejectionReasons =
  & ValidationRejection[]
  & ((rejection: ValidationRejection) => void)

/**
 * Creates an object that can be passed to type-validators, and is array of rejections.
 * @returns An object that can be passed to type-validators, and is array of rejections.
 */
export function arrayRejectionReasons(): ArrayRejectionReasons {
  const rejections: ArrayRejectionReasons = [] as any
  const pushRejection = (rejection => void rejections.push(rejection)) as ArrayRejectionReasons

  return new Proxy(
    pushRejection, {
    defineProperty: (_, prop, attr) => Reflect.defineProperty(rejections, prop, attr),
    deleteProperty: (_, prop) => Reflect.deleteProperty(rejections, prop),
    enumerate: () => Reflect.enumerate(rejections) as any,
    get: (_, prop, receiver) => Reflect.get(rejections, prop, receiver),
    getOwnPropertyDescriptor: (_, prop) => ({
      ...Reflect.getOwnPropertyDescriptor(rejections, prop),
      configurable: true,
    }),
    getPrototypeOf: () => Reflect.getPrototypeOf(rejections),
    has: (_, prop) => Reflect.has(rejections, prop),
    isExtensible: () => Reflect.isExtensible(rejections),
    ownKeys: () => Reflect.ownKeys(rejections),
    preventExtensions: () => Reflect.preventExtensions(rejections),
    set: (_, prop, value) => Reflect.set(rejections, prop, value, rejections),
    setPrototypeOf: () => false,
  })
}

const indentRx = /^\s+/mg
export function indent(str: undefined, indent: string): undefined
export function indent(str: string, indent: string): string
export function indent(str: string | undefined, indent: string): string | undefined
export function indent(str: string | undefined, indent: string): string | undefined {
  if (!str) {
    return str
  }

  return str.replace(indentRx, indentStr => indent + indentStr)
}

let colors = false

export function setRejectReasonsColoring(isColored: boolean) {
  colors = isColored
}

const customValueSym = Symbol('rejection-literal')
function isCustomValue(val: unknown): val is { [customValueSym]: unknown } {
  return isObject(val) &&
    Object.getOwnPropertySymbols(val).includes(customValueSym)
}

export const EMPTY_MESSAGE_VALUE = Object.freeze({ [inspect.custom]: () => '' })
const MAX_INSPECT_PROPS = 3

/**
 * Converts values to string
 * @param value A value to convert to string
 * @returns A string visualization of the value
 */
export function stringify(value: unknown): string {
  if (isCustomValue(value)) {
    return String(value[customValueSym])
  }

  const inspectedValue = isObject(value)
    ? objectToInspect(value)
    : value

  return `<${inspect(inspectedValue, {
    depth: 1,
    colors,
  })}>`

  function objectToInspect(value: Record<Key, unknown>): unknown {
    if (value === EMPTY_MESSAGE_VALUE) {
      return value
    }

    if (Array.isArray(value)) {
      return Object.assign(
        [
          ...from(value)
            .pipe(
              map(value => isObject(value)
                ? objectToInspect(value)
                : value),
              take(MAX_INSPECT_PROPS)
            )
        ],
        {
          ...value.length > MAX_INSPECT_PROPS && { '...': inspectAsAny() },
        }
      )
    }

    return Object.keys(value).length <= MAX_INSPECT_PROPS
      ? value
      : fromEntries(
        concat(
          from(Object.entries(value))
            .pipe(
              take(MAX_INSPECT_PROPS),
            ),
          [['...', inspectAsAny()]]
        )
      )
  }
}
function inspectAsAny() {
  return {
    [inspect.custom]: () => '...',
  }
}

/**
 * A tagged template which pretty print templated values for validation rejections
 * @param strings The template strings
 * @param values The template values
 */
export function rejectionMessage(strings: TemplateStringsArray, ...values: unknown[]): string {
  const result: string[] = []

  for (let i = 0; i < values.length; i++) {
    const value = stringify(values[i])

    result.push(strings[i])
    result.push(value)
  }

  result.push(strings[strings.length - 1])

  return result.join('')
}

/**
 * Creates a literal value that would print the string as-is, when templated in `rejectionMessage`
 * @param value A literal string for rejectionMessage
 */
export function literal(value: string): unknown {
  return {
    [customValueSym]: value
  }
}
