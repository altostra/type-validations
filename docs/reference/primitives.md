# Primitives

## *Type-validation*s
The following *type-validation*s provide validations for all JavaScript's primitive types.

Type validation | Validated type | Remarks
-|-|-
`string` | `string`
`number` | `number`
`boolean` | `boolean`
`nullValidation` | `null`
`undefinedValidation` | `undefined`
`symbol` | `symbol`
`bigint` | `bigint`
`any` | `any` | Always returns `true`.
`unknown` | `unknown` | Always returns `true`. <br> Alias of `any`.
`never` | `never` | Always returns `false`.
`maybeString` | `string` \| `undefined`
`maybeNumber` | `number` \| `undefined`
`maybeBoolean` | `boolean` \| `undefined`
`nullOrUndefined` | `null` \| `undefined`
`maybeSymbol` | `symbol` \| `undefined`
`maybeBigint` | `bigint` \| `undefined`

## *Assertions*
The following *assertion*s provide assertions for all JavaScript's primitive types.

Each assertion function creates a corresponding assertion provided `errFactory` function.

### Parameters

#### `errFactory`
A function that creates an error for a given value and rejections.

**Type:** (val: unknown, rejections: ValidationRejection[]) => unknown

### *Assertion* factories

Assertion factory | Validated type | Remarks
-|-|-
`stringAssertion` | `string`
`numberAssertion` | `number`
`booleanAssertion` | `boolean`
`nullAssertion` | `null`
`undefinedAssertion` | `undefined`
`symbolAssertion` | `symbol`
`bigintAssertion` | `bigint`
`anyAssertion` | `any` | Returns an assertion that always returns.
`unknownAssertion` | `unknown` | Returns an assertion that always returns. <br> Alias of `anyAssertion`.
`assert` | `never` | Returns an assertion that always throws.
`maybeStringAssertion` | `string` \| `undefined`
`maybeNumberAssertion` | `number` \| `undefined`
`maybeBooleanAssertion` | `boolean` \| `undefined`
`nullOrUndefinedAssertion` | `null` \| `undefined`
`maybeSymbolAssertion` | `symbol` \| `undefined`
`maybeBigintAssertion` | `bigint` \| `undefined`
