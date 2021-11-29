import { transformValidation, TypeValidation } from './Common'
import { asRejectingValidator, createRejection, registerRejectingValidator } from './RejectionReasons'
import { AnyTypeValidation, typeValidatorType } from '.'

export interface WithRecursionOptionsBase {
  maxDepth?: number
  skipDepth?: number
  maxGlobalDepth?: number
  skipGlobalDepth?: number
}
export interface WithRecursionMaxOptions extends WithRecursionOptionsBase {
  // The maximum amount of times the recursion is allowed to run before rejecting the data
  maxDepth?: number
  // The maximum amount of times the recursion is allowed to run before accepting the data
  skipDepth?: never
  // The maximum amount of times any recursion is allowed to run before rejecting the data
  // Should be used when you have recursion between more than one type
  maxGlobalDepth?: number
  // The maximum amount of times any recursion is allowed to run before accepting the data
  // Should be used when you have recursion between more than one type
  skipGlobalDepth?: never
}
export interface WithRecursionSkipOptions extends WithRecursionOptionsBase {
  // The maximum amount of times the recursion is allowed to run before rejecting the data
  maxDepth?: never
  // The maximum amount of times the recursion is allowed to run before accepting the data
  skipDepth?: number
  // The maximum amount of times any recursion is allowed to run before rejecting the data
  // Should be used when you have recursion between more than one type
  maxGlobalDepth?: never
  // The maximum amount of times any recursion is allowed to run before accepting the data
  // Should be used when you have recursion between more than one type
  skipGlobalDepth?: number
}

/**
 * Recursive validation options
 */
export type WithRecursionOptions =
  | WithRecursionMaxOptions
  | WithRecursionSkipOptions


let currentGlobalDepth: number | undefined = undefined

/**
 * A function to generate a type validation. The function's params
 * is equivalent to the result and can be used as validation.
 * @param recurse A reference to the result type-validation. \
 * **Note:** You must not call this parameter (even though it represents a function)
 */
export type RecursiveValidationFactory<T> =
  (recurse: TypeValidation<T>) => AnyTypeValidation<T>


export function withRecursion<T>(
  factory: RecursiveValidationFactory<T>,
  options?: WithRecursionOptions
): TypeValidation<T> {
  const {
    maxDepth,
    maxGlobalDepth,
    skipDepth,
    skipGlobalDepth,
  } = validateOptions(options)

  let currentDepth = 0
  const hasGlobal = typeof currentGlobalDepth === 'number'
  currentGlobalDepth = maxGlobalDepth || skipGlobalDepth
    ? currentGlobalDepth ?? 0
    : currentGlobalDepth

  let result: TypeValidation<T>
  const type = () => `↻(${result[typeValidatorType]})`
  const resultReference = registerRejectingValidator(
    (value: unknown, reject): value is T => {
      try {
        currentDepth++
        incGlobal()

        if (
          (maxDepth && currentDepth > maxDepth) ||
          (maxGlobalDepth && currentGlobalDepth! > maxGlobalDepth)
        ) {
          reject?.(createRejection('Recursion max depth has reached', type()))
        }
        else if (
          (skipDepth && currentDepth > skipDepth) ||
          (skipGlobalDepth && currentGlobalDepth! > skipGlobalDepth)
        ) {
          // Skip farther validations
          return true
        }

        return result(value, reject)
      }
      finally {
        decGlobal()
        // Decrease until zero
        currentDepth = currentDepth && (currentDepth - 1)

        if (currentGlobalDepth === 0 && !hasGlobal) {
          currentGlobalDepth = undefined
        }
      }
    },
    type,
    (transformation, args) => result[transformValidation](transformation, args)
  )

  result = asRejectingValidator(factory(resultReference))

  return result
}

const optionsKeys: (keyof WithRecursionOptions)[] = [
  'maxDepth',
  'maxGlobalDepth',
  'skipDepth',
  'skipGlobalDepth',
]
function validateOptions(options: WithRecursionOptions = {}): WithRecursionOptions {
  // All must be positive integers
  for (const key of optionsKeys) {
    const value = options[key]

    if (value !== undefined) {
      if (typeof value !== 'number') {
        throw new Error(`Invalid \`withRecursion\` ${key}. [${String(value)}] is not a number`)
      }
      else if (value < 0) {
        throw new Error(`Invalid \`withRecursion\` ${key}. [${value}] must not be negative`)
      }
      else if (!Number.isInteger(value)) {
        throw new Error(`Invalid \`withRecursion\` ${key}. [${value}] must be an integer`)
      }
    }
  }

  // Skip and max cannot be used in the same time
  if (options.maxDepth !== undefined && options.skipDepth !== undefined) {
    throw new Error('`withRecursion` maxDepth at same time with skipDepth')
  }
  if (options.maxGlobalDepth !== undefined && options.skipGlobalDepth !== undefined) {
    throw new Error('`withRecursion` maxGlobalDepth at same time with skipGlobalDepth')
  }

  // Global must be greater than (or equals) to type-local
  if (
    options.maxDepth !== undefined &&
    options.maxGlobalDepth !== undefined &&
    options.maxDepth > options.maxGlobalDepth
  ) {
    throw new Error('`withRecursion` maxDepth must be lesser than maxGlobalDepth')
  }

  if (
    options.skipDepth !== undefined &&
    options.skipGlobalDepth !== undefined &&
    options.skipDepth > options.skipGlobalDepth
  ) {
    throw new Error('`withRecursion` skipDepth must be lesser than skipGlobalDepth')
  }

  return options
}

function incGlobal() {
  if (typeof currentGlobalDepth === 'number') {
    currentGlobalDepth++
  }

  return currentGlobalDepth
}

function decGlobal() {
  if (
    typeof currentGlobalDepth === 'number' &&
    currentGlobalDepth > 0
  ) {
    currentGlobalDepth--
  }

  return currentGlobalDepth
}
