# `arrayOf`

Given *type-guard* for type `T`, creates a *type-validator* for `T[]`.

## Type parameters

Name | Description
-|-
`T` | Type of the validated array elements.

## parameters
Name | Type | Description
-|-|-
`elementTypeValidation` | `AnyTypeValidation<T>` | Type validator to validate array elements.

## Return value

A `TypeValidation<T[]>` that validates values to be arrays of `T`.
