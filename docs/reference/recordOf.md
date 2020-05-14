# `recordOf`

Creates *type-validator* that checks that a given value is an object and that
all its properties are of a specific type.

## Type parameters

### `T`
The type of the properties of a validated object value.

## Parameters

### `propsTypeValidation`
The properties validator.

**Type:** `AnyTypeValidation<T>`

## Return value
A `TypeValidation<Record<string | number, T>>`
