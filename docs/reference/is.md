# `is`

Creates a *type-validation* that only allows values that are strictly equal to 
the provided value.

## Type parameters

Name | Description
-|-
`T` | The type of the provided value.

## Parameters

Name | Type | Description
-|-|-
`expectedValue` | `T` | The value which the result *type-validation* compares to.

## Return value
A `TypeValidation<T>` that validates that a given value is equal to `expectedValue`.
