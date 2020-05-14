# `isFunction`

Creates a *type-validation* that checks if a value is a function with a specified length.

## Parameters

Name | Type | Description
-|-|-
`argsCount` | `number` ⩾ `0` or `undefined` | If provided, validate that a function has that exact `length`.

## Return value
A `TypeValidaton<(...args: any[]) => any>` that checks if a given value is a function with 
a specfied `length`.
