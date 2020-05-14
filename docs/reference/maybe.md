# `maybe`

Creates a *type-validation* that checks if a value is of validated type, `undefined`, 
and optionally `null`.

## Type parameters

### `T`
The concrete type that is validated if a value is not `undefined` nor `null`.

## Parameters

### `validator`
A *type-validation* to check values that are not `null` nor `undefined`.

**Type:** `AnyTypeValidation<T>`

### `withNull`
If `true` the returned *type-validation* accepts `null` as well.  
Otherwise, the returned *type-validation* only accepts `undefined`, or whatever 
`validator` accepts.

**Type:** `boolean` \| `undefined`

## Return type
A *type-validation*;  
If `withNull` is `true` then `TypeValidation<T | undefined | null>`;  
Otherwise, `TypeValidation<T | undefined>`.

## Example

```ts
import { maybe, objectOf, typeValidatorType } from '@altostra/type-validations'

const maybeObject = maybe(objectOf({}))
const maybeNullableObject = maybe(objectOf({}), true)

console.log(maybeObject[typeValidatorType]) /* ?({
  [*]: *
}) */
console.log(maybeNullableObject[typeValidatorType]) /* ?({
  [*]: *
} | null) */

console.log(maybeObject(console.log, console.log)) // true
console.log(maybeObject({}, console.log)) // true
console.log(maybeObject([], console.log)) // true
console.log(maybeObject(undefined, console.log)) // true

console.log(maybeNullableObject(console.log, console.log)) // true
console.log(maybeNullableObject({}, console.log)) // true
console.log(maybeNullableObject([], console.log)) // true
console.log(maybeNullableObject(undefined, console.log)) // true
console.log(maybeNullableObject(null, console.log)) // true

console.log(maybeObject(null, console.log)) /* {
  path: [],
  reason: 'Value <null> is not <undefined> nor {\n  [*]: *\n}',
  propertyType: '?({\n  [*]: *\n})'
}
{
  path: [],
  reason: 'Value <null> is not an object',
  propertyType: '{\n  [*]: *\n}'
}
false */
console.log(maybeObject('string', console.log)) /* {
  path: [],
  reason: "Value <'string'> is not <undefined> nor {\n  [*]: *\n}",
  propertyType: '?({\n  [*]: *\n})'
}
{
  path: [],
  reason: "Value <'string'> is not an object",
  propertyType: '{\n  [*]: *\n}'
}
false */
console.log(maybeNullableObject('object', console.log)) /* {
  path: [],
  reason: "Value <'object'> is not <undefined>, <null>, nor {\n  [*]: *\n} | null",
  propertyType: '?({\n  [*]: *\n} | null)'
}
{
  path: [],
  reason: "Value <'object'> is not an object",
  propertyType: '{\n  [*]: *\n}'
}
false */

const maybeObjectIncognito: unknown = {}
const maybeNullableObjectIncognito: unknown = null

if (maybeObject(maybeObjectIncognito) && maybeObjectIncognito) {
    console.log(Object.keys(maybeObjectIncognito)) // []
}

if (maybeNullableObject(maybeNullableObjectIncognito)) {
    console.log(maybeNullableObjectIncognito) // null
}
```
