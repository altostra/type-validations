# Type validations

Type validations is a library for creating *type-validator*s: augmented 
[*type-guard*](https://www.typescriptlang.org/docs/handbook/advanced-types.html#type-guards-and-differentiating-types)s 
that perform full runtime type-validation and let TypeScript type checker know what a 
type may be in a certain context.

## Installation

```sh
$ npm install @altostra/type-validations
```

## Reference

A full reference can be found [here](./docs/reference/index).

### [`allOf`](./docs/reference/docs/reference/allOf)

Creates *type-validator*s for an
[*intersections-type*](https://www.typescriptlang.org/docs/handbook/advanced-types.html#intersection-types)
from a list of *type-validator*s.

### [`anyOf`](./docs/reference/anyOf)

Creates *type-validator*s for a
[*union-type*](https://www.typescriptlang.org/docs/handbook/advanced-types.html#union-types)
from a list of *type-validator*s.

### [`arrayOf`](./docs/reference/arrayOf)

Given *type-guard* for type `T`, creates a *type-validator* for `T[]`.

### [`assertBy`](./docs/reference/assertions)

Create *assertion-functions* from *type-validation* and an error-factory.

### [`enumOf`](./docs/reference/enumOf)

Creates a *type-validation* that checks if a value is one of the specified values
(using strict equality).

### [`is`](./docs/reference/is)

Creates a *type-validation* that only allows values that are strictly equal to 
the provided value.

### [`isEmptyArray`](./docs/reference/isEmptyArray)

A *type-validation* that checks if a value is an empty array.

### [`isEmptyObject`](./docs/reference/isEmptyObject)

A *type-validation* that checks if a value is an empty object.

### [`isFunction`](./docs/reference/isFunction)

Creates a *type-validation* that checks if a value is a function with a specified length.

### [`maybe`](./docs/reference/maybe)

Creates a *type-validation* that checks if a value is of validated type, `undefined`, 
and optionally `null`.

### [`objectOf`](./docs/reference/objectOf)

Creates *type-validation* that checks if a value is an object that all its properties
are validated with the provided validations.

### [`recordOf`](./docs/reference/recordOf)

Creates *type-validator* that checks that a given value is an object and that
all its properties are of a specific type.

### [`singleOrArray`](./docs/reference/singleOrArray)

Creates a *type-validation* that checks if a value is either a specific type or an
array of that type.

### [`tupleOf`](./docs/reference/tupleOf)

Creates a *type-validation* that checks that an object is an array with a specific length,
and has all the provided indices validated.

### [Primitives](./docs/reference/primitives)

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
