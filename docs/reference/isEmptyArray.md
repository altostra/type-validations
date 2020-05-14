# `isEmptyArray`

A *type-validation* that checks if a value is an empty array.

## Parameters

### `value`
Value to validate

**Type:** `unknown`

### `rejectionReasons`
Optional callback that would be called with validaton rejecton reasons.  

- When validation succeeds - `rejectionReasons` would **not** be invoked.
- When validation fails - `rejectionReasons` would be invoked **at least once**
and **may be invoked multiple times**.

## Properties

### Symbol: `[typeValidatorType]`
A description of the validated type

**Type:** `string`

## Methods

### `asPredicate(): (value: unknown) => boolean`
Returns a predicate (no second arguemnt) for the specified validator.

### `asPredicate(): (value: unknown) => value is []`
Returns a type-guard predicate (no second arguemnt) for the specified validator.
