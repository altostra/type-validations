# objectOf

Creates *type-validation* that checks if a value is an object that all its properties
are validated with the provided validations.

## Type parameters

### `T` 
The object type that the result *type-validation* would validate.

**Extends:** `object`

## Parameters

### `propsValidation`
Either an object or an array of which all its properties are *type-validation*s.

If `propsValidation` is an array, the result *type-validation* also checks that 
the validated value is an array that has the exact length of `propsValidation`.

**Type:** `ObjectOrTupleValidations<T>`

### Options

#### `strict`
If `true` then the result *type-validation* also checks that the validated value
does not have additional own keys beyond the validated ones.

## Return value
A `TypeValidation<T>`.
