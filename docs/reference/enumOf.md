# `enumOf`

Creates a *type-validation* that checks if a value is one of the specified values
(using strict equality).

## Type parameters

### `T1`, ..., `Tn`
The type parameters `T1`, ..., `Tn` correspond to the types of the provided **values**.

## Parameters

### `value1`, ..., `valuen`
One or more **values** to compare to a *validated-value*.

**Type:** `Ti`

## Return value

A `TypeValidation<T1 | ... | Ti>` that validates that a value equals one of the provided types.

## Example

```ts
import { enumOf, typeValidatorType } from '@altostra/type-validations'

type MyEnum =
    | 'Val1'
    | false

const isMyEnum = enumOf<MyEnum>('Val1', false)

console.log(isMyEnum[typeValidatorType]) // 'Val1' | false

console.log(isMyEnum('Val1', console.log)) // true
console.log(isMyEnum(false, console.log)) // true

console.log(isMyEnum('Val2', console.log)) /* {
  path: [],
  reason: "Value <'Val2'> is not equal to <'Val1'>",
  propertyType: "'Val1'"
}
{
  path: [],
  reason: "Value <'Val2'> is not equal to <false>",
  propertyType: 'false'
}
false */
console.log(isMyEnum(true, console.log)) /* {
  path: [],
  reason: "Value <true> is not equal to <'Val1'>",
  propertyType: "'Val1'"
}
{
  path: [],
  reason: 'Value <true> is not equal to <false>',
  propertyType: 'false'
}
false */

const incognito: unknown = 'Val1'

if (isMyEnum(incognito) && incognito) {{
    console.log(incognito) // incognito is of type 'Val1'
}}
```
