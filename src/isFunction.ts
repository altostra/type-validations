import { MAX_DISPLAYED_TYPES, TypeValidation } from './Common'
import {
  createRejection,
  literal,
  registerRejectingValidator,
  rejectionMessage
  } from './RejectionReasons'

export function isFunction(argsCount: 1): TypeValidation<(
  arg1: any,
  ...args: any[]
) => any>
export function isFunction(argsCount: 2): TypeValidation<(
  arg1: any,
  arg2: any,
  ...args: any[]
) => any>
export function isFunction(argsCount: 3): TypeValidation<(
  arg1: any,
  arg2: any,
  arg3: any,
  ...args: any[]
) => any>
export function isFunction(argsCount: 4): TypeValidation<(
  arg1: any,
  arg2: any,
  arg3: any,
  arg4: any,
  ...args: any[]
) => any>
export function isFunction(argsCount: 5): TypeValidation<(
  arg1: any,
  arg2: any,
  arg3: any,
  arg4: any,
  arg5: any,
  ...args: any[]
) => any>
export function isFunction(argsCount?: number): TypeValidation<(...args: any[]) => any>
export function isFunction(argsCount?: number): TypeValidation<(...args: any[]) => any> {
  if (
    (argsCount !== undefined) &&
    (argsCount < 0 ||
      !Number.isInteger(argsCount))
  ) {
    throw new Error('Function can have zero or more arguemnts.')
  }

  const funcType = argsCount === undefined
    ? `(...args) => *`
    : `(${functionArgs(argsCount ?? 0)}) => *`

  return registerRejectingValidator(
    ((val, rejectionReasons?) => {

      if (typeof val !== 'function') {
        rejectionReasons?.(createRejection(
          rejectionMessage`Value ${val} is not a function`,
          funcType
        ))

        return false
      }
      else if (argsCount !== undefined && val.length !== argsCount) {
        rejectionReasons?.(createRejection(
          rejectionMessage`Function [${literal(val.name)}] expected to have ${argsCount} parameters, bug has ${val.length} instead.`,
          funcType
        ))

        return false
      }

      return true
    }) as TypeValidation<(...args: any[]) => any>,
    funcType
  )
}

function functionArgs(count: number) {
  if (count === 1) {
    return 'arg'
  }

  const allArgs = Array.from({ length: count }, (_, i) => `arg${i + 1}`)
  const args = allArgs.length <= MAX_DISPLAYED_TYPES
    ? allArgs
    : [
      ...allArgs.slice(0, 2),
      '...',
      ...allArgs.slice(allArgs.length - 2, allArgs.length),
    ]

  return args.join(', ')
}

export default isFunction
