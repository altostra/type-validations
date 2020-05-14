# `is`

Creates a *type-validation* that only allows values that are strictly equal to 
the provided value.

## Type parameters

### `T`
The type of the provided value.

## Parameters

### `expectedValue`
The value which the result *type-validation* compares to.

**Type:** `T`

## Return value
A `TypeValidation<T>` that validates that a given value is equal to `expectedValue`.

## Example

```ts
import { is, typeValidatorType } from '@altostra/type-validations'

const isA = is('A' as const)
const isNaN = is(NaN)

console.log(isA[typeValidatorType]) // 'A'
console.log(isNaN[typeValidatorType]) // NaN

console.log(isA('A', console.log)) // true
console.log(isNaN(NaN, console.log)) // true

console.log(isNaN('A', console.log)) /* {
  path: [],
  reason: "Value <'A'> is not equal to <NaN>",
  propertyType: 'NaN'
}
false */
console.log(isA(NaN, console.log)) /* {
  path: [],
  reason: "Value <NaN> is not equal to <'A'>",
  propertyType: "'A'"
}
false */

const incognito = 'A'

// @ts-expect-error: This condition will always return 'false' since the types 
// '"A"' and '"B"' have no overlap.
if (isA(incognito) && incognito === 'B') {
    console.log(incognito)
}
```
