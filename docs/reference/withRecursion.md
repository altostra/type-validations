# withRecursion

Creates a *type-validation* that performs its validation recursively.

## Usage examples
The following example shows some validations and their expected result

```ts
interface Recursive {
  [key: string]: string[] | Recursive
}

const isRecursive = withRecursion<Recursive>(
  recursedType => recordOf(
    anyOf(
      arrayOf(string),
      recursedType,
    )
  )
)

const isRecursiveWithMaxDepth = isRecursive.withMaxDepthOf(2)
const isRecursiveWithSkipAtDepth = isRecursive.withSkipAtDepthOf(2)

const depth1 = {
  value: ['a'],
}
const depth3 = {
  value1: ['a'],
  recurse1: {
    value2: ['a', 'b'],
    recurse2: {
      value3: ['a', 'b', 'c']
    }
  }
}

const invalid1 = {
  badValue: 5
}
const invalid3 = {
  value1: ['a'],
  recurse1: {
    value2: ['a', 'b'],
    recurse2: {
      badValue3: [182],
    }
  }
}

// The validation without max-depth or skip rigorously validate a value at any depth
const isDepth1Recursive = isRecursive(depth1) // true
const isDepth3Recursive = isRecursive(depth3) // true
const isInvalid1Recursive = isRecursive(invalid1) // false
const isInvalid3Recursive = isRecursive(invalid3) // false

// With max-depth, the validation fails if the validation didn't pass at the specified depth
const isDepth1Recursive = isRecursiveWithMaxDepth(depth1) // true
const isDepth3Recursive = isRecursiveWithMaxDepth(depth3) // false - rejected because the values is too deep
const isInvalid1Recursive = isRecursiveWithMaxDepth(invalid1) // false
const isInvalid3Recursive = isRecursiveWithMaxDepth(invalid3) // false

// With skip-depth, the validation passes immediately if the validation didn't pass at the specified depth
const isDepth1Recursive = isRecursiveWithSkipAtDepth(depth1) // true
const isDepth3Recursive = isRecursiveWithSkipAtDepth(depth3) // true
const isInvalid1Recursive = isRecursiveWithSkipAtDepth(invalid1) // false
const isInvalid3Recursive = isRecursiveWithSkipAtDepth(invalid3) // true - passed because the values is too deep
```

## Type parameters

### `T`
The object type that the result *type-validation* would validate.

## Parameters

### `factory`
A function to generate a type validation.  
The function's first parameter is equivalent to the would-be-result of the
function and can be used to construct the result type-validation.

***Note:*** While the parameter can be used as a placeholder for the result *type-validation*
when constructing the validation - you **must not** call it in the `factory` function.

**Type:** `ObjectOrTupleValidations<T>`

### Options

#### `maxDepth: number` 
If set, the result *type-validation* would reject a value if it couldn't validate it up
until the specified depth.

> Excludes `skipDepth`

#### `skipDepth: number` 
If set, the result *type-validation* would pass a value if it couldn't validate it up
until the specified depth.

> Excludes `maxDepth`

## Return value
A `TypeValidation<T>`.
