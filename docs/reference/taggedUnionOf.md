# `taggedUnionOf`

Creates *type-validator*s for a
[*union-type*](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types)
from a mapping between specified tag-property values and validators, when the *union-type* 
is in fact a [*discriminated union*](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions).

## Rationale

While a *discriminated union* is in fact a *union* and thus can be validated using [`anyOf`](./anyOf.md)
validation - using `anyOf` for *discriminated union* is expensive, as `anyOf` must invoke
each of the validators until one of them passes.

If rejections are collected and a value fails to validate by an `anyOf` validator, then the rejections from
all the validators must be emitted even though the values was intended to pass only one (or a few)
of the validators used by the `anyOf` validator.  
This in turn creates a lot of noise while trying to understand why the value has failed to validate.

---

Using `taggedUnionOf` instead creates a validator that invokes only the appropriate internal-validator
according to the values's tag property.  
If the value's tag is not provided when creating the validator (e.g. the validated value was hand-crafted and 
a typo was made in the tag property) - no internal-validator is invoked and the validation quickly
fails.

If rejections are collected and a value fails to validate - only one rejection is emitted, 
describing what tag is used and why it has failed thus significantly reducing noise.

## Type parameters

### `TKey`

Specifies the property name of the tag of the *tagged-union*.

### `TUnion`

The validated union type.

### `TTag`

The type of the known tags of the *tagged-union*.

## Parameters

### `tagKey`
Specifies the property name of the tag of the *tagged-union*.


### spec1, ..., specn

A mapping (either an object or a `Map`) from tag values and validator to validate objects
having the specified tag.

If more than one spec is specified they are combined and treated as if a single spec
was specified containing all `(tag,validator)` pairs from all specs.

## Return value

A `TaggedUnionValidation<TUnion, TKey, TTag>` that validates values to be members of 
the *tagged-union* type.

A `TaggedUnionValidation` also has a `unionSpec` method that returns a spec that can be
used in other calls of `taggedUnionOf`.

## Examples

> Due to typescript limitation (when type inference is used), the validator in the first mapping
must be casted to validator of the entire *tagged-union* type.

### Usage with object spec

When the *tag* values are all object keys (i.e. they are all either `string`, `number` 
or `symbol`) an object may be used to map from *tag* value to a validator.

```ts
interface A {
  tag: 'a'
  ...
}
interface B {
  tag: 'b'
  ...
}
type TaggedUnion = A | B

const isA = objectOf<A>({...})
const isB = objectOf<B>({...})

const isTaggedUnion = taggedUnionOf('tag', {
  // When the tag's values === 'a', use `isA` type validation
  // Due to typescript limitation, the first (and only the first) validation must be casted to the validated type.
  a: isA as TypeValidation<TaggedUnion>,
  // When the tag's values === 'b', use `isB` type validation (this time, no cast is needed)
  b: isB,
})
```
### Usage with `Map` spec

```ts
const ATag = {}, BTag = {}

interface A {
  objectTag: object // Assumed to be ATag
  ...
}
interface B {
  objectTag: object // Assumed to be BTag
  ...
}
type TaggedUnion = A | B

const isA = objectOf<A>({...})
const isB = objectOf<B>({...})

const isTaggedUnion = taggedUnionOf('objectTag', new Map(
  // When the tag's values === ATag, use `isA` type validation
  // Due to typescript limitation, the first (and only the first) validation must be casted to the validated type.
  [ ATag, isA as TypeValidation<TaggedUnion> ],
  // When the tag's values === BTag, use `isB` type validation (this time, no cast is needed)
  [ BTag, isB ],
))
```

### Combining *tagged-union* validators.

It is possible to use *tagged-union* validator to compose validators
for larger *tagged-unions* as long the **tag** property key is the same.

```ts
interface A {
  tag: 'a'
  ...
}
interface B {
  tag: 'b'
  ...
}
interface C {
  tag: 'c'
  ...
}
interface D {
  tag: 'd'
  ...
}
interface E {
  tag: 'e'
  ...
}

type ABUnion = A | B
type CDUnion = C | D
type CombinedUnion = E | ABUnion | CDUnion

const isA = objectOf<A>({...})
const isB = objectOf<B>({...})
const isC = objectOf<C>({...})
const isD = objectOf<D>({...})
const isE = objectOf<E>({...})

const isAB = taggedUnionOf('tag', {
  a: isA as TypeValidation<ABUnion>,
  b: isB,
})

const isCD = taggedUnionOf('tag', {
  c: isC as TypeValidation<CDUnion>,
  d: isD,
})

const isCombinedUnion = taggedUnionOf('tag', {
    e: isE as TypeValidation<CombinedUnion>,
  },
  isAB.unionSpec(),
  isCD.unionSpec()
)
```
