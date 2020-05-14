import { TypeValidation } from './Common'
import { createRejection, registerRejectingValidator, rejectionMessage } from './RejectionReasons'
import { inspect } from 'util'

/**
 * Creates a validator that only allow values which strictrly equal to `val`
 * @param expectedValue Value to create validator that only allow values which strictrly equal to `val`
 * @returns A validator that only allow values which strictrly equal to `val`
 */
export function is<T>(expectedValue: T): TypeValidation<T> {
  const type = typeOf(expectedValue)

  return registerRejectingValidator(
    ((actualValue, rejectionReason?): actualValue is T => {
      const result = actualValue === expectedValue

      if (!result && rejectionReason) {
        rejectionReason(createRejection(
          rejectionMessage`Value ${actualValue} is not equal to ${expectedValue}`,
          type
        ))
      }

      return result
    }),
    type
  )
}

export default is

function typeOf(x: unknown) {
  switch (typeof x) {
    case 'boolean':
    case 'symbol':
    case 'undefined':
    case 'number': {
      return String(x)
    }

    case 'bigint': {
      return `${x}n`
    }

    case 'function': {
      return `is(${functionType(x)})`
    }

    case 'object': {
      return x === null
        ? 'null'
        : `is(${objectTyoe(x)})`
    }

    case 'string': {
      return stringType(x)
    }

    default: {
      throw new Error('Invalid object type!')
    }
  }
}
function functionType(fn: Function): string {
  return `(...args) => *`
}
function objectTyoe(obj: object): string {
  return Array.isArray(obj)
    ? '[ ... ]'
    : '{ ... }'
}

function stringType(str: string): string {
  return !str.includes("'") ? `'${str}'` :
    !str.includes('"') ? `"${str}"` :
      !str.includes('`') ? `\`${str}\`` :
        inspect(str)
}

