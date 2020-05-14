# `recordOf`

Creates *type-validator* that checks that a given value is an object and that
all its properties are of a specific type.

## Type parameters

### `T`
The type of the properties of a validated object value.

## Parameters

### `propsTypeValidation`
The properties validator.

**Type:** `AnyTypeValidation<T>`

## Return value
A `TypeValidation<Record<string | number, T>>`

## Example

```ts
import { recordOf, typeValidatorType } from '@altostra/type-validations'
import { number } from '@altostra/type-validations/lib/primitives'

const isNumericRecord = recordOf(number)

console.log(isNumericRecord[typeValidatorType]) // { [*]: number }

console.log(isNumericRecord({ num: 5 }, console.log)) // true
console.log(isNumericRecord([5], console.log)) // true
console.log(isNumericRecord({}, console.log)) // true
console.log(isNumericRecord([], console.log)) // true

console.log(isNumericRecord({ num: 5, str: 'a-string' }, console.log)) /* {
  path: [ 'str' ],
  reason: "Value <'a-string'> is not a number",
  propertyType: 'number'
}
false */
console.log(isNumericRecord(['str'], console.log)) /* {
  path: [ 0 ],
  reason: "Value <'str'> is not a number",
  propertyType: 'number'
}
false */
console.log(isNumericRecord(5, console.log)) /* {
  path: [],
  reason: 'Value <5> is not an object',
  propertyType: '{ [*]: number }'
}
false */

const incognito: unknown = {
    a: 1,
    b: 2,
}

if (isNumericRecord(incognito)) {
    for (const [key, num] of Object.entries(incognito)) {
        console.log(key, num) /* a 1 *
                               * b 2 */
    }
}
```
