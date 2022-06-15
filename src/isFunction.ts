import type { TypeValidation } from './Common'
import { MAX_DISPLAYED_TYPES } from './Common'
import {
	createRejection,
	literal,
	registerRejectingValidator,
	rejectionMessage,
} from './RejectionReasons'

/**
* Creates a type-validation that checks if a value is a function with
* 0 argument.
* @param argsCount The expected `length` of the function being 0.
* @returns A `TypeValidation<(...args: any[]) => any>` that checks if a given value
* is a function with 0 arguments.
*/
export function isFunction(argsCount: 0): TypeValidation<(...args: any[]) => any>
/**
* Creates a type-validation that checks if a value is a function with
* 1 argument.
* @param argsCount The expected `length` of the function being 1.
* @returns A `TypeValidation<(...args: any[]) => any>` that checks if a given value
* is a function with 1 arguments.
*/
export function isFunction(argsCount: 1): TypeValidation<(
	arg1: any,
	...args: any[]
) => any>
/**
 * Creates a type-validation that checks if a value is a function with
 * 2 argument.
 * @param argsCount The expected `length` of the function being 2.
 * @returns A `TypeValidation<(...args: any[]) => any>` that checks if a given value
 * is a function with 2 arguments.
 */
export function isFunction(argsCount: 2): TypeValidation<(
	arg1: any,
	arg2: any,
	...args: any[]
) => any>
/**
 * Creates a type-validation that checks if a value is a function with
 * 3 argument.
 * @param argsCount The expected `length` of the function being 3.
 * @returns A `TypeValidation<(...args: any[]) => any>` that checks if a given value
 * is a function with 3 arguments.
 */
export function isFunction(argsCount: 3): TypeValidation<(
	arg1: any,
	arg2: any,
	arg3: any,
	...args: any[]
) => any>
/**
 * Creates a type-validation that checks if a value is a function with
 * 4 argument.
 * @param argsCount The expected `length` of the function being 4.
 * @returns A `TypeValidation<(...args: any[]) => any>` that checks if a given value
 * is a function with 4 arguments.
 */
export function isFunction(argsCount: 4): TypeValidation<(
	arg1: any,
	arg2: any,
	arg3: any,
	arg4: any,
	...args: any[]
) => any>
/**
 * Creates a type-validation that checks if a value is a function with
 * 5 argument.
 * @param argsCount The expected `length` of the function being 5.
 * @returns A `TypeValidation<(...args: any[]) => any>` that checks if a given value
 * is a function with 5 arguments.
 */
// eslint-disable-next-line @typescript-eslint/no-magic-numbers
export function isFunction(argsCount: 5): TypeValidation<(
	arg1: any,
	arg2: any,
	arg3: any,
	arg4: any,
	arg5: any,
	...args: any[]
) => any>
/**
 * Creates a type-validation that checks if a value is a function with
 * a specified length.
 * @param argsCount The expected `length` of the function. \
 * If `undefined` then any `length` is valid.
 * @returns A `TypeValidation<(...args: any[]) => any>` that checks if a given value
 * is a function.
 */
export function isFunction(argsCount?: number): TypeValidation<(...args: any[]) => any>
export function isFunction(argsCount?: number): TypeValidation<(...args: any[]) => any> {
	if (
		(argsCount !== undefined) &&
		(argsCount < 0 ||
			!Number.isInteger(argsCount))
	) {
		throw new Error('Function can have zero or more arguments.')
	}

	const funcType = argsCount === undefined
		? '(...args) => *'
		: `(${functionArgs(argsCount ?? 0)}) => *`

	return registerRejectingValidator(
		(val, rejectionReasons?): val is ((...args: any[]) => any) => {
			if (typeof val !== 'function') {
				rejectionReasons?.(createRejection(
					rejectionMessage`Value ${val} is not a function`,
					funcType,
				))

				return false
			}
			else if (argsCount !== undefined && val.length !== argsCount) {
				rejectionReasons?.(createRejection(
					rejectionMessage`Function [${literal(val.name)}] expected to have ${argsCount} parameters, ` +
						`bug has ${val.length} instead.`,
					funcType,
				))

				return false
			}

			return true
		},
		funcType,
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
