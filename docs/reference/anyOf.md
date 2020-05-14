# `anyOf`

Creates *type-validator*s for a
[*union-type*](https://www.typescriptlang.org/docs/handbook/advanced-types.html#union-types)
from a list of *type-validator*s.

Given a list of *type-validator*s (each validates specific type), `anyOf` creates a 
new *type-validator* which is satisfied if **any** the provided *type-validator*s
are satisfied.

## Type parameters

### `T1`, ..., `Tn`
The type parameters `T1`, ..., `Tn` corresponds to the types of the provided 
*type-validator*s.

## Parameters

### `validation1`, ..., `validationn`
One or more *type-validator*s, each of which validates one of the unified types.

**Type:** `AnyTypeValidation<Ti>`

## Return value

A `TypeValidation<T1 | ... | Ti>` that validates the union of the provided types.

## Examples

```ts
import {
    anyOf,
    isFunction,
    objectOf,
    typeValidatorType,
    ValidationRejection
    } from '@altostra/type-validations'

interface Bird {
    fly(): void
    layEggs(): void
}

interface Fish {
    swim(): void
    layEggs(): void
}

interface Dog {
    bark(): void
    swingTail(): void
}

function getSmallPet(): Fish | Bird {
    return Math.random() > 0.5
        ? {
            fly() { console.log("I'm flying") },
            layEggs() { console.log('Laying bird`s eggs') },
        }
        : {
            swim() { console.log("I'm swimming") },
            layEggs() { console.log('Laying fish eggs') }
        }
}

function getDog(): Dog {
    return {
        bark() { console.log('Haw haw!') },
        swingTail() { console.log('Swinging tail') }
    }
}

const isBird = objectOf<Bird>({
    fly: isFunction(),
    layEggs: isFunction(),
})
const isFish = objectOf<Fish>({
    swim: isFunction(),
    layEggs: isFunction(),
})
const isSmallPet = anyOf(isBird, isFish)

const dog = getDog()
const smallPet = getSmallPet()

const rejections: ValidationRejection[] = []

console.log(isSmallPet[typeValidatorType]) /* {
  fly: (...args) => *,
  layEggs: (...args) => *,
  [*]: *
} | {
  swim: (...args) => *,
  layEggs: (...args) => *,
  [*]: *
} */

console.log(isSmallPet(smallPet, r => rejections.push(r))) // true
console.log(rejections) // []

console.log(isSmallPet(dog, r => rejections.push(r))) // true
console.log(rejections) /* [
  {
    path: [ 'fly' ],
    reason: 'Value <undefined> is not a function',
    propertyType: '(...args) => *'
  },
  {
    path: [ 'swim' ],
    reason: 'Value <undefined> is not a function',
    propertyType: '(...args) => *'
  }
] */

const unknown = Math.random() > 0.5
    ? smallPet
    : dog

if (isSmallPet(unknown, console.log)) {
    unknown.layEggs()
}

// Either lay egges message or rejection
```
