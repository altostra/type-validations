# `allOf`

Creates *type-validator*s for an
[*intersections-type*](https://www.typescriptlang.org/docs/handbook/2/objects.html#intersection-types)
from a list of *type-validator*s.

Given a list of *type-validator*s (each validates specific type), `allOf` creates a 
new *type-validator* which is only satisfied if **all** the provided *type-validator*s
are satisfied.

## Type parameters

### `T1`, ..., `Tn`
The type parameters `T1`, ..., `Tn` corresponds to the types of the provided *type-validator*s.

## Parameters

### `validation1`, ..., `validationn`
One or more *type-validator*s, each of which validates one of the intersected types.

**Type:** `AnyTypeValidation<Ti>`

## Return value

A `TypeValidation<T1 & ... & Ti>` that validates the intersection of the provided types.

## Examples

```ts
import {
    allOf,
    is,
    isFunction,
    objectOf,
    ValidationRejection
    } from '@altostra/type-validations'

function extend<First, Second>(first: First, second: Second): First & Second {
    const result: Partial<First & Second> = {}
    for (const prop of Object.getOwnPropertyNames(first)) {
        (result as any)[prop] = (first as any)[prop]
    }
    for (const prop of Object.getOwnPropertyNames(second)) {
        (result as any)[prop] = (second as any)[prop]
    }
    return result as First & Second
}

class Person {
    constructor(public name: string) { }
}

interface Loggable {
    log(name: string): void
}

class ConsoleLogger implements Loggable {
    log(name: string) {
        console.log(`Hello, I'm ${name}.`)
    }
}

const jim = extend(new Person('Jim'), ConsoleLogger.prototype)

const isLoggable = objectOf({
    log: isFunction(),
})

const isNamedJim = objectOf({
    name: is('Jim' as const),
})

const isJim = allOf(isNamedJim, isLoggable)

// ==========================================

console.log(isJim[typeValidatorType]) /* {
  name: 'Jim',
  [*]: *
} & {
  log: (...args) => *,
  [*]: *
} */

const rejections: ValidationRejection[] = []

console.log(isJim(jim, r => rejections.push(r))) // true
console.log(rejections) // []
console.log(isJim(new Person('James'), r => rejections.push(r))) // false
console.log(rejections) /* [
  {
    path: [ 'name' ],
    reason: "Value <'James'> is not equal to <'Jim'>",
    propertyType: "'Jim'"
  }
] */

const jimInCognito: unknown = jim

if (isJim(jimInCognito)) {
    jimInCognito.log(jimInCognito.name)
}
```
