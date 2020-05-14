# `anyOf`

Creates *type-validator*s for a
[*union-type*](https://www.typescriptlang.org/docs/handbook/advanced-types.html#union-types)
from a list of *type-validator*s.

Given a list of *type-validator*s (each validates specific type), `anyOf` creates a 
new *type-validator* which is satisfied if **any** the provided *type-validator*s
are satisfied.

## Type parameters

### `T1`, ..., `Tn`
The type parameters `T1`, ..., `Tn` corresponds to the types of the provided 
*type-validator*s.

## Parameters

### `validation1`, ..., `validationn`
One or more *type-validator*s, each of which validates one of the unified types.

**Type:** `AnyTypeValidation<Ti>`

## Return value

A `TypeValidation<T1 | ... | Ti>` that validates the union of the provided types.
