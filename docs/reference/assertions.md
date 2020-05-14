# [*Assertions*](https://github.com/microsoft/TypeScript/pull/32695)

TypeScript 3.7 added support for Assertions in control flow analysis and the  
`asserts` *type-predicate*.

## Why

A recurring pattern is to throw when a value fails validation:

```ts
const { body } = request;

if (!isBodyExpectedType(body)) {
  throw new Error(...);
}

useBody(body)

function useBody(body: ExpectedType) { ... }
```

And dealing with rejections may create even more recurring boilerplate:

```ts
const { body } = request;
const rejections: ValidationRejection[] = [];

if (!isBodyExpectedType(body, rejection => rejections.push(rejection))) {
  // Do something with the rejections:
  console.debug(rejections)
  throw new Error(...);
}

useBody(body)

function useBody(body: ExpectedType) { ... }
```

Using TypeScript's *Assertions in control flow analysis*, we can 
encapsulate that pattern into a function:

```ts
const { body } = request;

validateBody(body)
useBody(body)

function validateBody(value: unknown): asserts value is ExptedType {
  const rejections: ValidationRejection[] = [];

  if (!isBodyExpectedType(body, rejection => rejections.push(rejection))) {
    // Do something with the rejections:
    console.debug(rejections)
    throw new Error(...);
  }
}

function useBody(body: ExpectedType) { ... }
```
### `assertBy`

Using the function `assertBy` we can remove even more boilerplate, and effortlessly
create *assertion-functions*.

```ts
const { body } = request;
// Assertion methods must be explicitly typed.
const validateBody: Assertion<ExpectedType> = assertBy(
  isBodyExpectedType,
  (value, rejections) => {
    // Do something with the rejections:
    console.debug(rejections)
    return new Error(...);
  }
);

validateBody(body)
useBody(body)

function useBody(body: ExpectedType) { ... }
```

#### Type parameters

Name | Description
-|-
`T` | The validated type of the provided *type-validation*.

#### Parameters

Name | Type | Desctiption
-|-|-
`validation` | `AnyTypeValidation<T>` | *Type-validation* for the asserted type.
`errFactory` | (val: unknown, rejetions: ValidationRejection[]) => unknown | A function that creates an error for a given value and rejections.

#### Return value

An assertion function of type `(value: unknown) => asserts value is T`.
