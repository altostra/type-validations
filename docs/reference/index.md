# Type validations

Type validations is a library for creating *type-validator*s: augmented 
[*type-guard*](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)s 
that perform full runtime type-validation and let TypeScript type checker know what a 
type may be in a certain context.

## `TypeValidation<T>`

The `TypeValidation<T>` interface is an augmented *type-guard* function, that is a
function that returns 
[*type predicate*](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates)
for a given parameter.

Beside of returning *type predicate*s, a `TypeValidation<T>`

 - may get a *rejections handler*:  
 A second parameter: a function which would be invoked with 
 [*rejections*](#Rejections), describing why a value failed to validate.
- is having a type: a `string` property that visually describes what the validator validates.
- can be convertible to a simple (not augmented) *type-guard* or `boolean` function.

### Parameters

#### `value`
Value to validate

**Type:** `unknown`

#### `rejectionReasons`
Optional callback that would be called with validaton rejecton reasons.  

- When validation succeeds - `rejectionReasons` would **not** be invoked.
- When validation fails - `rejectionReasons` would be invoked **at least once**
and **may be invoked multiple times**.

### Properties

#### Symbol: `[typeValidatorType]`
A description of the validated type

**Type:** `string`

### Methods

#### `asPredicate(): (value: unknown) => boolean`
Returns a predicate (no second arguemnt) for the specified validator.

#### `asPredicate(): (value: unknown) => value is T`
Returns a type-guard predicate (no second arguemnt) for the specified validator.

## Rejections

A rejection is an object describing the reason a given value failed to pass the *type-validation*.

A *rejections handler* parameter may be provided for a
While the *rejections handler* may be called multiple times for a single value, it is 
guaranteed it would never be called for values that pass validation.

### Properties

Name | Type | Description
-|-|-
`path` | `string[]` | The property names leading to the failing property (ordered inside-out).
`reasone` | `string` | A string describing the reason the property values failed to validate.
`propertyType` | `string` | A string visualizing the type of the failing property.

## Reference

### [`allOf`](./allOf.md)

Creates *type-validator*s for an
[*intersections-type*](https://www.typescriptlang.org/docs/handbook/2/objects.html#intersection-types)
from a list of *type-validator*s.

### [`anyOf`](./anyOf.md)

Creates *type-validator*s for a
[*union-type*](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types)
from a list of *type-validator*s.

### [`arrayOf`](./arrayOf.md)

Given *type-guard* for type `T`, creates a *type-validator* for `T[]`.

### [`assertBy`](./assertions.md)

Create *assertion-functions* from *type-validation* and an error-factory.

### [`enumOf`](./enumOf.md)

Creates a *type-validation* that checks if a value is one of the specified values
(using strict equality).

### [`is`](./is)

Creates a *type-validation* that only allows values that are strictly equal to 
the provided value.

### [`isEmptyArray`](./isEmptyArray.md)

A *type-validation* that checks if a value is an empty array.

### [`isEmptyObject`](./isEmptyObject.md)

A *type-validation* that checks if a value is an empty object.

### [`isFunction`](./isFunction.md)

Creates a *type-validation* that checks if a value is a function with a specified length.

### [`maybe`](./maybe.md)

Creates a *type-validation* that checks if a value is of validated type, `undefined`, 
and optionally `null`.

### [`objectOf`](./objectOf.md)

Creates *type-validation* that checks if a value is an object that all its properties
are validated with the provided validations.

### [`recordOf`](./recordOf.md)

Creates *type-validator* that checks that a given value is an object and that
all its properties are of a specific type.

### [`singleOrArray`](./singleOrArray.md)

Creates a *type-validation* that checks if a value is either a specific type or an
array of that type.

### [`taggedUnionOf`](./taggedUnionOf.md)

Creates *type-validator*s for a
[*union-type*](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types)
from a mapping between specified tag property values and validators, when the *union-type* 
is in fact a [*discriminated union*](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions).

### [`tupleOf`](./tupleOf.md)

Creates a *type-validation* that checks that an object is an array with a specific length,
and has all the provided indices validated.

### [Primitives](./primitives.md)

#### *Type-validations*
- `string`
- `maybeString`
- `number`
- `maybeNumber`
- `boolean`
- `maybeBoolean`
- `nullValidation`
- `nullOrUndefined`
- `undefinedValidation`
- `symbol`
- `maybeSymbol`
- `bigint`
- `maybeBigint`
- `any`
- `unknown`
- `never`

#### *Type-assertions*

- `stringAssertion`
- `maybeStringAssertion`
- `numberAssertion`
- `maybeNumberAssertion`
- `booleanAssertion`
- `maybeBooleanAssertion`
- `nullAssertion`
- `nullOrUndefinedAssertion`
- `undefinedAssertion`
- `symbolAssertion`
- `maybeSymbolAssertion`
- `bigintAssertion`
- `maybeBigintAssertion`
- `anyAssertion`
- `unknownAssertion`
- `assert`
