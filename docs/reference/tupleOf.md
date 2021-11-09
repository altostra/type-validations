# `tupleOf`
Creates a *type-validation* that checks that an object is an array with a specific length,
and has all the provided indices validated.

## Type parameters

### `T`
The validated tuple type.

**Extends:** `any[]`

## Parameters

### `validation1`, ..., `validationn`
The tuple positional validations.

**Type:** `T[i]`

## Return value
A ` TypeValidation<T>`

## Example

```ts
import { tupleOf, typeValidatorType } from '@altostra/type-validations'
import { number, string } from '@altostra/type-validations/lib/primitives'

const isMyTuple = tupleOf(number, string)

console.log(isMyTuple[typeValidatorType]) /* [
  number,
  string
] */

console.log(isMyTuple([6, 'str'], console.log)) // true

console.log(isMyTuple(['a-string', 123], console.log)) /* {
  path: [ 0 ],
  reason: "Value <'a-string'> is not a number",
  propertyType: 'number'
}
false */
console.log(isMyTuple([123], console.log)) /* {
  path: [ 1 ],
  reason: 'Value <undefined> is not a string',
  propertyType: 'string'
}
false */
console.log(isMyTuple([123, 'a-string', 5], console.log)) /* {
  path: [ 'length' ],
  reason: 'Value <3> is not equal to <2>',
  propertyType: '2'
}
false */

const myTupleIncognito: unknown = ['str', 6]

if (isMyTuple(myTupleIncognito)) {
    console.log(myTupleIncognito[1]) // 6
}
```
