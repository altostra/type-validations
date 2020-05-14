# `isEmptyArray`

A *type-validation* that checks if a value is an empty array.

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

### `asPredicate(): (value: unknown) => value is []`
Returns a type-guard predicate (no second arguemnt) for the specified validator.

## Example

```ts
import { isEmptyArray, typeValidatorType } from '@altostra/type-validations'

console.log(isEmptyArray[typeValidatorType]) // []

console.log(isEmptyArray([], console.log)) // true

console.log(isEmptyArray('A', console.log)) /* { path: [], reason: "Value <'A'> is not an array", propertyType: '[]' }
false */
console.log(isEmptyArray([0], console.log)) /* { path: [], reason: 'Array <[ 0 ]> is not empty', propertyType: '[]' }
false */

const incognito: unknown = []

if (isEmptyArray(incognito)) {
    console.log(incognito.length) // 0

    // @ts-expect-error: This condition will always return 'false' since 
    // the types '0' and '1' have no overlap.
    console.log(incognito.length === 1) // false
}
```
