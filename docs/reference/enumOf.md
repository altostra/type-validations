# `enumOf`

Creates a *type-validation* that checks if a value is one of the specified values
(using strict equality).

## Type parameters

Name | Description
-|-
`T1`, ..., `Tn` | The type parameters `T1`, ..., `Tn` correspond to the types of the provided **values**.

## Parameters

Name | Type | Description
-|-|-
`value1`, ..., `valuen` | `Ti` | One or more **values** to compare to a *validated-value*.

## Return value

A `TypeValidation<T1 | ... | Ti>` that validates that a value equals one of the provided types.
