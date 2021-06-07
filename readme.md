# Type validations

![CI](https://github.com/altostra/type-validations/workflows/CI/badge.svg)
[![npm version](https://badge.fury.io/js/%40altostra%2Ftype-validations.svg)](https://badge.fury.io/js/%40altostra%2Ftype-validations)

Type validations is a library for creating *type-validator*s: augmented 
[*type-guard*](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)s 
that perform full runtime type-validation and let TypeScript type checker know what a 
type may be in a certain context.

## Installation

```sh
$ npm install @altostra/type-validations
```

## Reference

A full reference can be found [here](./docs/reference/index.md).

### [`allOf`](./docs/reference/docs/reference/allOf.md)

Creates *type-validator*s for an
[*intersections-type*](https://www.typescriptlang.org/docs/handbook/2/objects.html#intersection-types)
from a list of *type-validator*s.

### [`anyOf`](./docs/reference/anyOf.md)

Creates *type-validator*s for a
[*union-type*](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types)
from a list of *type-validator*s.

### [`arrayOf`](./docs/reference/arrayOf.md)

Given *type-guard* for type `T`, creates a *type-validator* for `T[]`.

### [`assertBy`](./docs/reference/assertions.md)

Create *assertion-functions* from *type-validation* and an error-factory.

### [`enumOf`](./docs/reference/enumOf.md)

Creates a *type-validation* that checks if a value is one of the specified values
(using strict equality).

### [`is`](./docs/reference/is.md)

Creates a *type-validation* that only allows values that are strictly equal to 
the provided value.

### [`isEmptyArray`](./docs/reference/isEmptyArray.md)

A *type-validation* that checks if a value is an empty array.

### [`isEmptyObject`](./docs/reference/isEmptyObject.md)

A *type-validation* that checks if a value is an empty object.

### [`isFunction`](./docs/reference/isFunction.md)

Creates a *type-validation* that checks if a value is a function with a specified length.

### [`maybe`](./docs/reference/maybe.md)

Creates a *type-validation* that checks if a value is of validated type, `undefined`, 
and optionally `null`.

### [`objectOf`](./docs/reference/objectOf.md)

Creates *type-validation* that checks if a value is an object that all its properties
are validated with the provided validations.

### [`recordOf`](./docs/reference/recordOf.md)

Creates *type-validator* that checks that a given value is an object and that
all its properties are of a specific type.

### [`singleOrArray`](./docs/reference/singleOrArray.md)

Creates a *type-validation* that checks if a value is either a specific type or an
array of that type.

### [`taggedUnionOf`](./docs/reference/taggedUnionOf.md)

Creates *type-validator*s for a
[*union-type*](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types)
from a mapping between specified tag property values and validators, when the *union-type* 
is in fact a [*discriminated union*](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions).

### [`tupleOf`](./docs/reference/tupleOf.md)

Creates a *type-validation* that checks that an object is an array with a specific length,
and has all the provided indices validated.

### [Primitives](./docs/reference/primitives.md)

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
