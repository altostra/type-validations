# `maybe`

Creates a *type-validation* that checks if a value is of validated type, `undefined`, 
and optionally `null`.

## Type parameters

### `T`
The concrete type that is validated if a value is not `undefined` nor `null`.

## Parameters

### `validator`
A *type-validation* to check values that are not `null` nor `undefined`.

**Type:** `AnyTypeValidation<T>`

### `withNull`
If `true` the returned *type-validation* accepts `null` as well.  
Otherwise, the returned *type-validation* only accepts `undefined`, or whatever 
`validator` accepts.

**Type:** `boolean` \| `undefined`

## Return type
A *type-validation*;  
If `withNull` is `true` then `TypeValidation<T | undefined | null>`;  
Otherwise, `TypeValidation<T | undefined>`.
