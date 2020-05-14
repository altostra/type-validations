# `arrayOf`

Given *type-guard* for type `T`, creates a *type-validator* for `T[]`.

## Type parameters

### `T`
Type of the validated array elements.

## parameters

### `elementTypeValidation`
Type validator to validate array elements.

**Type:** `AnyTypeValidation<T>`

## Return value

A `TypeValidation<T[]>` that validates values to be arrays of `T`.

## Example

```ts
import { arrayOf, typeValidatorType } from '@altostra/type-validations'
import { string } from '@altostra/type-validations/lib/primitives'

const isArrayOfStrings = arrayOf(string)

console.log(isArrayOfStrings[typeValidatorType]) // ArrayOf(string)

console.log(isArrayOfStrings([], console.log)) // true
console.log(isArrayOfStrings(['a', 'b', 'cd'], console.log)) // true
console.log(isArrayOfStrings(['a', 'b', 6], console.log)) /* {
  path: [ 2 ],
  reason: 'Value <6> is not a string',
  propertyType: 'string'
}
false
*/

const incognitoArray: unknown = ['str']

if (isArrayOfStrings(incognitoArray)) {
    console.log(incognitoArray.length) // 1
}
```
