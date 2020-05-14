# `enumOf`

Creates a *type-validation* that checks if a value is one of the specified values
(using strict equality).

## Type parameters

### `T1`, ..., `Tn`
The type parameters `T1`, ..., `Tn` correspond to the types of the provided **values**.

## Parameters

### `value1`, ..., `valuen`
One or more **values** to compare to a *validated-value*.

**Type:** `Ti`

## Return value

A `TypeValidation<T1 | ... | Ti>` that validates that a value equals one of the provided types.
