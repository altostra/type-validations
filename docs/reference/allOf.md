# `allOf`

Creates *type-validator*s for
[*type-intersections*](https://www.typescriptlang.org/docs/handbook/advanced-types.html#intersection-types)
from a list of *type-validator*s.

Given a list of *type-validator*s (each validates specific type), `allOf` creates a 
new *type-validator* which is only satisfied if **all** the provided *type-validator*s
are satisfied.

## Type parameters

The type parameters `T1`, ..., `Ti` corresponds to the types of the
provided *type-validator*s.

## Parameters

One or more *type-validator*s, each of which validates one of the intersected types.

## Returned value

A `TypeValidator<T1 & ... & Ti>` that validates the intersection of the provided types.
