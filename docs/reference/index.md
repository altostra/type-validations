# Type validations

Type validations is a library for creating *type-validator*s: augmented 
[*type-guard*](https://www.typescriptlang.org/docs/handbook/advanced-types.html#type-guards-and-differentiating-types)s 
that perform full runtime type-validation and let TypeScript type checker know what a 
type may be in a certain context.

## `TypeValidation<T>`

The `TypeValidation<T>` interface is an augmented *type-guard* function, that is a
function that returns 
[*type predicate*](https://www.typescriptlang.org/docs/handbook/advanced-types.html#using-type-predicates)
for a given parameter.

Beside of returning *type predicate*s, a `TypeValidation<T>`

 - may get a *rejections handler*:  
 A second parameter: a function which would be invoked with 
 [*rejections*](#Rejections), describing why a value failed to validate.
- is having a type: a `string` property that visually describes what the validator validates.
- can be convertible to a simple (not augmented) *type-guard* or `boolean` function.

### Parameters

#### `value`
Value to validate

**Type:** `unknown`

#### `rejectionReasons`
Optional callback that would be called with validaton rejecton reasons.  

- When validation succeeds - `rejectionReasons` would **not** be invoked.
- When validation fails - `rejectionReasons` would be invoked **at least once**
and **may be invoked multiple times**.

### Properties

#### Symbol: `[typeValidatorType]`
A description of the validated type

**Type:** `string`

### Methods

#### `asPredicate(): (value: unknown) => boolean`
Returns a predicate (no second arguemnt) for the specified validator.

#### `asPredicate(): (value: unknown) => value is T`
Returns a type-guard predicate (no second arguemnt) for the specified validator.

## Rejections

A rejection is an object describing the reason a given value failed to pass the *type-validation*.

A *rejections handler* parameter may be provided for a
While the *rejections handler* may be called multiple times for a single value, it is 
guaranteed it would never be called for values that pass validation.

### Properties

Name | Type | Description
-|-|-
`path` | `string[]` | The property names leading to the failing property (ordered inside-out).
`reasone` | `string` | A string describing the reason the property values failed to validate.
`propertyType` | `string` | A string visualizing the type of the failing property.
