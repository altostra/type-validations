# `singleOrArray`
Creates a *type-validation* that checks if a value is either a specific type or an
array of that type.

## Type parameters

### `T`
The validated type.

## Parameters

### `validator`
Type validation.

**Type:** `AnyTypeValidation<T>`

## Return value
A `TypeValidation<T | T[]>`
