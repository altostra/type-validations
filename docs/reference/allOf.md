# `allOf`

Creates *type-validator*s for an
[*intersections-type*](https://www.typescriptlang.org/docs/handbook/advanced-types.html#intersection-types)
from a list of *type-validator*s.

Given a list of *type-validator*s (each validates specific type), `allOf` creates a 
new *type-validator* which is only satisfied if **all** the provided *type-validator*s
are satisfied.

## Type parameters

### `T1`, ..., `Tn`
The type parameters `T1`, ..., `Tn` corresponds to the types of the provided *type-validator*s.

## Parameters

### `validation1`, ..., `validationn`
One or more *type-validator*s, each of which validates one of the intersected types.

**Type:** `AnyTypeValidation<Ti>`

## Return value

A `TypeValidation<T1 & ... & Ti>` that validates the intersection of the provided types.
