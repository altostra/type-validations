# `arrayOf`

Given *type-guard* for type `T`, creates a *type-validator* for `T[]`.

## Type parameters

### `T`
Type of the validated array elements.

## parameters

### `elementTypeValidation`
Type validator to validate array elements.

**Type:** `AnyTypeValidation<T>`

## Return value

A `TypeValidation<T[]>` that validates values to be arrays of `T`.
