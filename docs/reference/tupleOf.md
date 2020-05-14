# `tupleOf`
Creates a *type-validation* that checks that an object is an array with a specific length,
and has all the provided indices validated.

## Type parameters

### `T`
The validated tuple type.

**Extends:** `any[]`

## Parameters

### `validation1`, ..., `validationn`
The tuple positional validations.

**Type:** `T[i]`

## Return value
A ` TypeValidation<T>`
