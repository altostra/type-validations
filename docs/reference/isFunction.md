# `isFunction`

Creates a *type-validation* that checks if a value is a function with a specified length.

## Parameters

### `argsCount`
If provided, validate that a function has that exact `length`.

**Type:** `number` ⩾ `0` or `undefined`

## Return value
A `TypeValidaton<(...args: any[]) => any>` that checks if a given value is a function with 
a specfied `length`.
