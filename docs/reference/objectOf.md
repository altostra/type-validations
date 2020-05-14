# objectOf

Creates *type-validation* that checks if a value is an object that all its properties
are validated with the provided validations.

## Type parameters

### `T` 
The object type that the result *type-validation* would validate.

**Extends:** `object`

## Parameters

### `propsValidation`
Either an object or an array of which all its properties are *type-validation*s.

If `propsValidation` is an array, the result *type-validation* also checks that 
the validated value is an array that has the exact length of `propsValidation`.

**Type:** `ObjectOrTupleValidations<T>`

### Options

#### `strict`
If `true` then the result *type-validation* also checks that the validated value
does not have additional own keys beyond the validated ones.

## Return value
A `TypeValidation<T>`.

## Example

```ts
import { anyOf, objectOf, typeValidatorType } from '@altostra/type-validations'
import { number, string } from '@altostra/type-validations/lib/primitives'

interface MyInterface {
    myString: string
}

const isStrictlyMyInterface = objectOf<MyInterface>({
    myString: string,
}, { strict: true })
const isIdentifiable = objectOf({
    id: anyOf(string, number),
})
const isMyTuple = objectOf([string, number] as const)

console.log(isStrictlyMyInterface[typeValidatorType]) /* {
  myString: string
} */
console.log(isIdentifiable[typeValidatorType]) /* {
  id: string | number,
  [*]: *
} */
console.log(isMyTuple[typeValidatorType]) /* [
  string,
  number
] */

console.log(isStrictlyMyInterface({ myString: 'a-string' }, console.log)) // true
console.log(isIdentifiable({ id: 'id' }, console.log)) // true
console.log(isIdentifiable({ id: 123, name: 'Smith' }, console.log)) // true
console.log(isMyTuple(['a-string', 123], console.log)) // true

console.log(isStrictlyMyInterface({ myString: 'a-string', id: 5 }, console.log)) /* {
  path: [ 'id' ],
  reason: "Object has redundant key <'id'>, and failed strict validation",
  propertyType: '{\n  myString: string\n}'
}
false */
console.log(isIdentifiable({ id: true }, console.log)) /* {
  path: [ 'id' ],
  reason: 'Value <true> is not a string',
  propertyType: 'string'
}
{
  path: [ 'id' ],
  reason: 'Value <true> is not a number',
  propertyType: 'number'
}
false */
console.log(isMyTuple([123, 'a-string'], console.log)) /* {
  path: [ 0 ],
  reason: 'Value <123> is not a string',
  propertyType: 'string'
}
false */
console.log(isMyTuple(['a-string'], console.log)) /* {
  path: [ 1 ],
  reason: 'Value <undefined> is not a number',
  propertyType: 'number'
}
false */
console.log(isMyTuple(['a-string', 123, 5], console.log)) /* {
  path: [ 'length' ],
  reason: 'Value <3> is not equal to <2>',
  propertyType: '2'
}
false */

const myInterfaceIncognito: unknown = { myString: 'a-string' }
const identifiableIncognito: unknown = { id: 5 }
const myTupleIncofnito: unknown = ['str', 6]

if (isStrictlyMyInterface(myInterfaceIncognito)) {
    console.log(myInterfaceIncognito.myString) // 'a-string'
}
if (isIdentifiable(identifiableIncognito)) {
    console.log(identifiableIncognito.id) // 5
}
if (isMyTuple(myTupleIncofnito)) {
    console.log(myTupleIncofnito[1]) // 6
}
```
