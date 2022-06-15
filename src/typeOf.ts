import { inspect } from 'util'

/**
 * Returns a string that represents the literal type of a value
 * @param x The value to return a literal type name for
 */
export function typeOf(x: unknown): string {
	switch (typeof x) {
		case 'boolean': // fallthrough

		case 'symbol': // fallthrough

		case 'undefined': // fallthrough

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
				: `is(${objectType(x)})`
		}

		case 'string': {
			return stringType(x)
		}

		default: {
			throw new Error('Invalid object type!')
		}
	}
}

// eslint-disable-next-line @typescript-eslint/ban-types
function functionType(fn: Function): string {
	return '(...args) => *'
}

function objectType(obj: object): string {
	return Array.isArray(obj)
		? '[ ... ]'
		: '{ ... }'
}

function stringType(str: string): string {
	return !str.includes("'") ? `'${str}'`
		: !str.includes('"') ? `"${str}"`
		: !str.includes('`') ? `\`${str}\``
		: inspect(str)
}
