# `is`

Creates a *type-validation* that only allows values that are strictly equal to 
the provided value.

## Type parameters

### `T`
The type of the provided value.

## Parameters

### `expectedValue`
The value which the result *type-validation* compares to.

**Type:** `T`

## Return value
A `TypeValidation<T>` that validates that a given value is equal to `expectedValue`.
