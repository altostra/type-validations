# `singleOrArray`
Creates a *type-validation* that checks if a value is either a specific type or an
array of that type.

## Type parameters

### `T`
The validated type.

## Parameters

### `validator`
Type validation.

**Type:** `AnyTypeValidation<T>`

## Return value
A `TypeValidation<T | T[]>`

## Example

```ts
import { singleOrArray, typeValidatorType } from '@altostra/type-validations'
import { number } from '@altostra/type-validations/lib/primitives'

const isNumberOrNumericArray = singleOrArray(number)

console.log(isNumberOrNumericArray[typeValidatorType]) // number | ArrayOf(number)

console.log(isNumberOrNumericArray(6, console.log)) // true
console.log(isNumberOrNumericArray([5], console.log)) // true
console.log(isNumberOrNumericArray([], console.log)) // true

console.log(isNumberOrNumericArray({ num: 5 }, console.log)) /* {
  path: [],
  reason: 'Value <{ num: 5 }> is not a number',
  propertyType: 'number'
}
{
  path: [],
  reason: 'Value <{ num: 5 }> is not an array',
  propertyType: 'ArrayOf(number)'
}
false */
console.log(isNumberOrNumericArray(['str'], console.log)) /* {
  path: [],
  reason: "Value <[ 'str' ]> is not a number",
  propertyType: 'number'
}
{
  path: [ 0 ],
  reason: "Value <'str'> is not a number",
  propertyType: 'number'
}
false */
console.log(isNumberOrNumericArray('str', console.log)) /* {
  path: [],
  reason: "Value <'str'> is not a number",
  propertyType: 'number'
}
{
  path: [],
  reason: "Value <'str'> is not an array",
  propertyType: 'ArrayOf(number)'
}
false */

const incognito: unknown = 5

if (isNumberOrNumericArray(incognito) && !Array.isArray(incognito)) {
    console.log(Math.abs(incognito)) // 5
}
```
