# `isEmptyObject`

A *type-validation* that checks if a value is an empty object.

## Parameters

### `value`
Value to validate

**Type:** `unknown`

### `rejectionReasons`
Optional callback that would be called with validaton rejecton reasons.  

- When validation succeeds - `rejectionReasons` would **not** be invoked.
- When validation fails - `rejectionReasons` would be invoked **at least once**
and **may be invoked multiple times**.

## Properties

### Symbol: `[typeValidatorType]`
A description of the validated type

**Type:** `string`

## Methods

### `asPredicate(): (value: unknown) => boolean`
Returns a predicate (no second arguemnt) for the specified validator.

### `asPredicate(): (value: unknown) => value is Record<never, unknown>`
Returns a type-guard predicate (no second arguemnt) for the specified validator.

## Example

```ts
import { isEmptyObject, typeValidatorType } from '@altostra/type-validations'

console.log(isEmptyObject[typeValidatorType]) // {}

console.log(isEmptyObject({}, console.log)) // true
console.log(isEmptyObject([], console.log)) // true

console.log(isEmptyObject('A', console.log)) /* {
  path: [],
  reason: "Value <'A'> is not an object",
  propertyType: '{}'
}
false */
console.log(isEmptyObject({ prop: undefined }, console.log))  /* {
  path: [],
  reason: 'Object <{ prop: undefined }> is not emtpy',
  propertyType: '{}'
}
false */
console.log(isEmptyObject([0], console.log)) /* { path: [], reason: 'Object <[ 0 ]> is not emtpy', propertyType: '{}' }
false */

const incognito: unknown = {}

if (isEmptyObject(incognito)) {
    Object.keys(incognito) // []
}
```
