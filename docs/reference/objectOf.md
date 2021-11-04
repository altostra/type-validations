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

Does not affect validations specified by `propertySpec`.

See [Controlling strictness](#controlling-strictness)

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
const myTupleIncognito: unknown = ['str', 6]

if (isStrictlyMyInterface(myInterfaceIncognito)) {
    console.log(myInterfaceIncognito.myString) // 'a-string'
}
if (isIdentifiable(identifiableIncognito)) {
    console.log(identifiableIncognito.id) // 5
}
if (isMyTuple(myTupleIncognito)) {
    console.log(myTupleIncognito[1]) // 6
}
```
## Controlling strictness

### Non-strict validations

A non-strict *object validation* tests all the properties specified by `propertySpec`.  
No matter how many additional properties an object has nor what values they have - 
that object would pass non-strict validation:

```ts
const anObject = {
  a: 1,
  b: 2,
}

const isMyObject = objectOf({
  a: number,
})

const test = isMyObject(anObject) // true
```
### Strict validations

A strict *object validation* tests all the properties specified by `propertySpec`,
just like a non-strict validation does, and also validated that an object does not
have additional properties.  
In order to pass a strict validation an object must have all the specified properties,
and nothing else:

```ts
const anObject = {
  a: 1,
  b: 2,
}
const anotherObject = {
  a: '1',
}
const theObject {
  a: 100,
}

const isMyObject = objectOf({
  a: number,
}, { strict: true })

const testAnObject = isMyObject(anObject) // false
const testAnotherObject = isMyObject(anotherObject) // false
const testTheObject = isMyObject(theObject) // true
```
### Recursively setting strictness

Specifying *strictness* in `objectOf` options only affect the returned validation, 
on the topmost level.

If any of the validated properties is an object-type that is validated using `objectOf`,
it wouldn't be affected:

```ts
// A validator may be declared somewhere like this
const isNestedObject = objectOf({
  a: number,
})

// Then used in another object-validation:
const isMyObject = objectOf({
  nested: isNestedObject,
}, { strict: true })

const topmostNonStrict = {
  nested: {
    a: 1,
  },
  b: 2,
}
const nestedNonStrict = {
  nested: {
    a: 1,
    b: 2,
  },
}

const isTopmostStrict = isMyObject(topmostNonStrict) // false
const isNestedStrict = isMyObject(nestedNonStrict) // true! oopsie!
```

There are few ways to control strictness in all validated properties and levels.

#### Controlling strictness on object-type-validation created by `objectOf`

If the type-validation you want to make strict (or non-strict) is an object-type-validation
that was created with `objectOf`, you can simply call `validator.strict()` to create 
a validation that is *strict* in all its nested properties.  

```ts
const isMyObject = objectOf({
  nested: isNestedObject,
})

const isStrictlyMyObject = isMyObject.strict()

const isNestedStrict = isMyObject(nestedNonStrict) // false, and correct
```

Similarly, `validator.unstrict()` would create a validation that is *non-strict* 
in all its nested properties.

```ts
// A validator may be declared somewhere like this
const isNestedObject = objectOf({
  a: number,
}, { strict: true })

// Then used in another object-validation:
const isMyObject = objectOf({
  nested: isNestedObject,
})
const isNonStrictMyObject = isMyObject.unstrict()

const topmostNonStrict = {
  nested: {
    a: 1,
  },
  b: 2,
}
const nestedNonStrict = {
  nested: {
    a: 1,
    b: 2,
  },
}

const isTopmostStrict = isMyObject(topmostNonStrict) // true
const isNestedStrict = isMyObject(nestedNonStrict) // false! oopsie!
const isNonStrict = isNonStrictMyObject(nestedNonStrict) // true
```

#### Controlling strictness on any kind of `TypeValidation`

When strictness is needed to be controlled on any kind of `TypeValidation`, 
`objectOf.strict(validation)` can be used:

```ts
const isA = objectOf({
  a: number,
})
const isB = objectOf({
  b: string,
})

const isAOrB = anyOf(isA, isB)

const a = {
  a: 1
}
const b = {
  b: '2'
}
const ab = {
  ...a,
  ...b,
}

const testA = isAOrB(a) // true
const testB = isAOrB(b) // true
const testAB = isAOrB(ab) // true 🧐

const isAXorB = objectOf.strict(isAOrB)

const testXA = isAXorB(a) // true
const testXB = isAXorB(b) // true
const testXAB = isAXorB(ab) // false 😎
```

Similarly, `objectOf.unstrict(validation)` can be used to turn off strictness.
