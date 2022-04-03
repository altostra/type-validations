import anyOf from './anyOf'
import { transformValidation, TypeValidation, TypeValidationFunc } from './Common'
import objectOf from './objectOf'
import { maybeNumber, number, undefinedValidation } from './primitives'
import { asRejectingValidator, createRejection, registerRejectingValidator } from './RejectionReasons'
import { AnyTypeValidation, typeValidatorType } from '.'

export interface WithRecursionOptionsBase {
  maxDepth?: number
  skipDepth?: number
}
export interface WithRecursionMaxOptions extends WithRecursionOptionsBase {
  // The maximum amount of times the recursion is allowed to run before rejecting the data
  maxDepth?: number
  // The maximum amount of times the recursion is allowed to run before accepting the data
  skipDepth?: never
}
export interface WithRecursionSkipOptions extends WithRecursionOptionsBase {
  // The maximum amount of times the recursion is allowed to run before rejecting the data
  maxDepth?: never
  // The maximum amount of times the recursion is allowed to run before accepting the data
  skipDepth?: number
}

/**
 * Recursive validation options
 */
export type WithRecursionOptions =
  | WithRecursionMaxOptions
  | WithRecursionSkipOptions

const isWithRecursionOptions = anyOf(
  objectOf<WithRecursionMaxOptions>({
    maxDepth: maybeNumber,
    skipDepth: undefinedValidation,
  }),
  objectOf<WithRecursionSkipOptions>({
    maxDepth: undefinedValidation,
    skipDepth: maybeNumber,
  })
)


const DEPTH_SYMBOL = Symbol('set-depth')
let currentGlobalDepth = 0

/**
 * A function to generate a type validation. The function's params
 * is equivalent to the result and can be used as validation.
 * @param recurse A reference to the result type-validation. \
 * **Note:** You must not call this parameter (even though it represents a function)
 */
export type RecursiveValidationFactory<T> =
  (recurse: TypeValidation<T>) => AnyTypeValidation<T>

export interface WithRecursionValidations<T> extends TypeValidation<T> {
  setMaxDepth(depth: number): WithRecursionValidations<T>
  setSkipDepth(depth: number): WithRecursionValidations<T>
  resetDepthLimitation(): WithRecursionValidations<T>
}

export const withRecursion = Object.assign(function _withRecursion<T>(
  factory: RecursiveValidationFactory<T>,
  options?: WithRecursionOptions
): WithRecursionValidations<T> {
  const {
    maxDepth,
    skipDepth,
  } = validateOptions(options)

  let result: WithRecursionValidations<T>
  const type = () => `↻(${result[typeValidatorType]})`
  const resultReferenceFunc: TypeValidationFunc<T> = (value, reject): value is T => {
    if (result === undefined) {
      throw new Error('Recursive validation reference must not be called before initialization')
    }

    try {
      incGlobal()

      if (maxDepth && currentGlobalDepth! >= maxDepth) {
        reject?.(createRejection(`Recursion max depth has reached at ${maxDepth}`, type()))
        return false
      }
      else if (skipDepth && currentGlobalDepth! >= skipDepth) {
        // Skip farther validations
        return true
      }

      return result(value, reject)
    }
    finally {
      decGlobal()
    }
  }
  const resultReference = registerRejectingValidator(
    resultReferenceFunc,
    '↻(Recursive)',
    (transformation, args) => {
      switch (transformation) {
        case DEPTH_SYMBOL:
          if (args.length !== 1 || !isWithRecursionOptions(args[0])) {
            throw new Error('Invalid transformation')
          }

          return withRecursion(factory, args[0])
        default:
          return result[transformValidation](transformation, args)
      }
    },
  )

  result = Object.assign(asRejectingValidator(factory(resultReference), type), {
    setMaxDepth: (depth: number) => withRecursion.setMaxDepth(result, depth),
    setSkipDepth: (depth: number) => withRecursion.setSkipDepth(result, depth),
    resetDepthLimitation: () => withRecursion.resetDepthLimitation(result),
  })

  return result
}, {
  setMaxDepth<T extends TypeValidation<any>>(validation: T, depth: number): T {
    return validation[transformValidation](DEPTH_SYMBOL, [{ maxDepth: depth }]) as T
  },
  setSkipDepth<T extends TypeValidation<any>>(validation: T, depth: number): T {
    return validation[transformValidation](DEPTH_SYMBOL, [{ skipDepth: depth }]) as T
  },
  resetDepthLimitation<T extends TypeValidation<any>>(validation: T): T {
    return validation[transformValidation](DEPTH_SYMBOL, [{}]) as T
  },
})

const optionsKeys: (keyof WithRecursionOptions)[] = [
  'maxDepth',
  'skipDepth',
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

  return options
}

function incGlobal() {
  return ++currentGlobalDepth
}

function decGlobal() {
  if (currentGlobalDepth > 0) {
    currentGlobalDepth--
  }

  return currentGlobalDepth
}
