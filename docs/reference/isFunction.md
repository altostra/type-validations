# `isFunction`

Creates a *type-validation* that checks if a value is a function with a specified length.

## Parameters

### `argsCount`
If provided, validate that a function has that exact `length`.

**Type:** `number` ⩾ `0` or `undefined`

## Return value
A `TypeValidation<(...args: any[]) => any>` that checks if a given value is a function with 
a specified `length`.

## Example

```ts
import { isFunction, typeValidatorType } from '@altostra/type-validations'

const isAFunction = isFunction()
const isFunctionOfTwo = isFunction(2)

console.log(isAFunction[typeValidatorType]) // (...args) => *
console.log(isFunctionOfTwo[typeValidatorType]) // (arg1, arg2) => *

console.log(isAFunction(console.log, console.log)) // true
console.log(isFunctionOfTwo(parseInt, console.log)) // true

console.log(isAFunction({}, console.log)) /* {
  path: [],
  reason: 'Value <{}> is not a function',
  propertyType: '(...args) => *'
}
false */

console.log(isFunctionOfTwo(5, console.log)) /* {
  path: [],
  reason: 'Value <5> is not a function',
  propertyType: '(arg1, arg2) => *'
}
false */

console.log(isFunctionOfTwo(console.log, console.log)) /* {
  path: [],
  reason: 'Function [bound consoleCall] expected to have <2> parameters, bug has <0> instead.',
  propertyType: '(arg1, arg2) => *'
}
false */

const incognito: unknown = function myFunc(this: unknown) {
    console.log(`this is ${this}`)
}

if (isAFunction(incognito)) {
    incognito.call('great!') // this is great!
}
```
