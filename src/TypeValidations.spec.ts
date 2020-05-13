import { allOf } from './allOf'
import { arrayOf } from './arrayOf'
import { AnyTypeValidation } from './Common'
import { objectOf } from './objectOf'
import {
  anyOf,
  maybe,
  primitives,
  recordOf
  } from '.'
import { expect } from 'chai'
import { isObject } from 'util'

export type Primitives = Exclude<keyof typeof primitives,
  | 'nullValidator'
  | 'maybeString'
  | 'maybeNumber'
  | 'maybeBoolean'
  | 'nullOrUndefined'
  | 'maybeSymbol'
  | 'maybeBigint'
>

export function primitivesChecks(
  fn: AnyTypeValidation<any>,
  valids: { [P in Primitives]?: boolean }
) {
  assertValidation(() => expect(fn('str'), 'string validation failure').to.be, 'string')
  assertValidation(() => expect(fn(5), 'number validation failure').to.be, 'number')
  assertValidation(() => expect(fn(true), 'boolean validation failure').to.be, 'boolean')
  assertValidation(() => expect(fn(Symbol('sym')), 'symbol validation failure').to.be, 'symbol')
  assertValidation(() => expect(fn(BigInt(567)), 'bigint validation failure').to.be, 'bigint')
  assertValidation(() => expect(fn(null), 'null validation failure').to.be, 'null')
  assertValidation(() => expect(fn(void 0), 'undefined validation failure').to.be, 'undefined')

  function assertValidation(assertion: () => Chai.Assertion, primitive: Primitives) {
    if (valids[primitive] === undefined) {
      return
    }

    if (valids[primitive]) {
      assertion().true
    }
    else {
      assertion().false
    }
  }
}
export const invalidPrimitives: { [P in Primitives]?: boolean } = {
  bigint: false,
  boolean: false,
  null: false,
  number: false,
  string: false,
  symbol: false,
  undefined: false,
}


describe('Type validations', () => {
  describe('Premitive validations', () => {
    describe('When validating string', () => {
      it('Should validate a string', () => {
        expect(primitives.string('')).to.be.true
        expect(primitives.string('a string')).to.be.true
      })

      it('Should invalidate a non string', () => {
        expect(primitives.string(5)).to.be.false
        expect(primitives.string(true)).to.be.false
        expect(primitives.string(Symbol('sym'))).to.be.false
        expect(primitives.string(BigInt(5))).to.be.false
        expect(primitives.string({})).to.be.false
        expect(primitives.string(['a'])).to.be.false
        expect(primitives.string(null)).to.be.false
        expect(primitives.string(undefined)).to.be.false
      })
    })

    describe('When validating number', () => {
      it('Should validate a number', () => {
        expect(primitives.number(5)).to.be.true
        expect(primitives.number(NaN)).to.be.true
        expect(primitives.number(Infinity)).to.be.true
        expect(primitives.number(-0)).to.be.true
        expect(primitives.number(0)).to.be.true
      })

      it('Should invalidate a non number', () => {
        expect(primitives.number('hello')).to.be.false
        expect(primitives.number(true)).to.be.false
        expect(primitives.number(Symbol('sym'))).to.be.false
        expect(primitives.number(BigInt(5))).to.be.false
        expect(primitives.number({})).to.be.false
        expect(primitives.number(['a'])).to.be.false
        expect(primitives.number(null)).to.be.false
        expect(primitives.number(undefined)).to.be.false
      })
    })

    describe('When validating boolean', () => {
      it('Should validate a boolean', () => {
        expect(primitives.boolean(true)).to.be.true
        expect(primitives.boolean(false)).to.be.true
      })

      it('Should invalidate a non boolean', () => {
        expect(primitives.boolean('hello')).to.be.false
        expect(primitives.boolean(5)).to.be.false
        expect(primitives.boolean(Symbol('sym'))).to.be.false
        expect(primitives.boolean(BigInt(5))).to.be.false
        expect(primitives.boolean({})).to.be.false
        expect(primitives.boolean(['a'])).to.be.false
        expect(primitives.boolean(null)).to.be.false
        expect(primitives.boolean(undefined)).to.be.false
      })
    })

    describe('When validating symbol', () => {
      it('Should validate a symbol', () => {
        expect(primitives.symbol(Symbol('sym'))).to.be.true
        expect(primitives.symbol(Symbol.iterator)).to.be.true
        expect(primitives.symbol(Symbol.for('a-sym'))).to.be.true
      })

      it('Should invalidate a non symbol', () => {
        expect(primitives.symbol('hello')).to.be.false
        expect(primitives.symbol(5)).to.be.false
        expect(primitives.symbol(true)).to.be.false
        expect(primitives.symbol(BigInt(5))).to.be.false
        expect(primitives.symbol({})).to.be.false
        expect(primitives.symbol(['a'])).to.be.false
        expect(primitives.symbol(null)).to.be.false
        expect(primitives.symbol(undefined)).to.be.false
      })
    })

    describe('When validating bigint', () => {
      it('Should validate a bigint', () => {
        expect(primitives.bigint(BigInt(5))).to.be.true
        expect(primitives.bigint(BigInt(0))).to.be.true
        expect(primitives.bigint(BigInt(-5))).to.be.true
        expect(primitives.bigint(BigInt('456532424324233654645746546346344635352324324234'))).to.be.true
      })

      it('Should invalidate a non bigint', () => {
        expect(primitives.bigint('hello')).to.be.false
        expect(primitives.bigint(5)).to.be.false
        expect(primitives.bigint(true)).to.be.false
        expect(primitives.bigint(Symbol('a'))).to.be.false
        expect(primitives.bigint({})).to.be.false
        expect(primitives.bigint(['a'])).to.be.false
        expect(primitives.bigint(null)).to.be.false
        expect(primitives.bigint(undefined)).to.be.false
      })
    })

    describe('When validating null', () => {
      it('Should validate a null', () => {
        expect(primitives.null(null)).to.be.true
      })

      it('Should invalidate a non null', () => {
        expect(primitives.null('hello')).to.be.false
        expect(primitives.null(5)).to.be.false
        expect(primitives.null(true)).to.be.false
        expect(primitives.null(Symbol('a'))).to.be.false
        expect(primitives.null({})).to.be.false
        expect(primitives.null(['a'])).to.be.false
        expect(primitives.null(BigInt(5))).to.be.false
        expect(primitives.null(undefined)).to.be.false
      })
    })

    describe('When validating undefined', () => {
      it('Should validate a undefined', () => {
        expect(primitives.undefined(undefined)).to.be.true
      })

      it('Should invalidate a non undefined', () => {
        expect(primitives.undefined('hello')).to.be.false
        expect(primitives.undefined(5)).to.be.false
        expect(primitives.undefined(true)).to.be.false
        expect(primitives.undefined(Symbol('a'))).to.be.false
        expect(primitives.undefined({})).to.be.false
        expect(primitives.undefined(['a'])).to.be.false
        expect(primitives.undefined(BigInt(5))).to.be.false
        expect(primitives.undefined(null)).to.be.false
      })
    })
  })

  describe('Nullable premitive validations', () => {
    describe('When validating string', () => {
      it('Should validate a string', () => {
        expect(primitives.maybeString('')).to.be.true
        expect(primitives.maybeString(undefined)).to.be.true
        expect(maybe(primitives.string, true)(null)).to.be.true
      })

      it('Should invalidate a non string', () => {
        expect(primitives.maybeString(5)).to.be.false
        expect(primitives.maybeString(true)).to.be.false
        expect(primitives.maybeString(Symbol('sym'))).to.be.false
        expect(primitives.maybeString(BigInt(5))).to.be.false
        expect(primitives.maybeString({})).to.be.false
        expect(primitives.maybeString(['a'])).to.be.false
        expect(primitives.maybeString(null)).to.be.false
      })
    })

    describe('When validating number', () => {
      it('Should validate a number', () => {
        expect(primitives.maybeNumber(5)).to.be.true
        expect(primitives.maybeNumber(NaN)).to.be.true
        expect(primitives.maybeNumber(Infinity)).to.be.true
        expect(primitives.maybeNumber(-0)).to.be.true
        expect(primitives.maybeNumber(0)).to.be.true
        expect(primitives.maybeNumber(undefined)).to.be.true
        expect(maybe(primitives.number, true)(null)).to.be.true
      })

      it('Should invalidate a non number', () => {
        expect(primitives.maybeNumber('hello')).to.be.false
        expect(primitives.maybeNumber(true)).to.be.false
        expect(primitives.maybeNumber(Symbol('sym'))).to.be.false
        expect(primitives.maybeNumber(BigInt(5))).to.be.false
        expect(primitives.maybeNumber({})).to.be.false
        expect(primitives.maybeNumber(['a'])).to.be.false
        expect(primitives.maybeNumber(null)).to.be.false
      })
    })

    describe('When validating boolean', () => {
      it('Should validate a boolean', () => {
        expect(primitives.maybeBoolean(true)).to.be.true
        expect(primitives.maybeBoolean(false)).to.be.true
        expect(primitives.maybeBoolean(undefined)).to.be.true
        expect(maybe(primitives.boolean, true)(null)).to.be.true
      })

      it('Should invalidate a non boolean', () => {
        expect(primitives.maybeBoolean('hello')).to.be.false
        expect(primitives.maybeBoolean(5)).to.be.false
        expect(primitives.maybeBoolean(Symbol('sym'))).to.be.false
        expect(primitives.maybeBoolean(BigInt(5))).to.be.false
        expect(primitives.maybeBoolean({})).to.be.false
        expect(primitives.maybeBoolean(['a'])).to.be.false
        expect(primitives.maybeBoolean(null)).to.be.false
      })
    })

    describe('When validating symbol', () => {
      it('Should validate a symbol', () => {
        expect(primitives.maybeSymbol(Symbol('sym'))).to.be.true
        expect(primitives.maybeSymbol(Symbol.iterator)).to.be.true
        expect(primitives.maybeSymbol(Symbol.for('a-sym'))).to.be.true
        expect(primitives.maybeSymbol(undefined)).to.be.true
        expect(maybe(primitives.symbol, true)(null)).to.be.true
      })

      it('Should invalidate a non symbol', () => {
        expect(primitives.maybeSymbol('hello')).to.be.false
        expect(primitives.maybeSymbol(5)).to.be.false
        expect(primitives.maybeSymbol(true)).to.be.false
        expect(primitives.maybeSymbol(BigInt(5))).to.be.false
        expect(primitives.maybeSymbol([])).to.be.false
        expect(primitives.maybeSymbol(['a'])).to.be.false
        expect(primitives.maybeSymbol(null)).to.be.false
      })
    })

    describe('When validating bigint', () => {
      it('Should validate a bigint', () => {
        expect(primitives.maybeBigint(BigInt(5))).to.be.true
        expect(primitives.maybeBigint(BigInt(0))).to.be.true
        expect(primitives.maybeBigint(BigInt(-5))).to.be.true
        expect(primitives.maybeBigint(BigInt('456532424324233654645746546346344635352324324234'))).to.be.true
        expect(primitives.maybeBigint(undefined)).to.be.true
        expect(maybe(primitives.bigint, true)(null)).to.be.true
      })

      it('Should invalidate a non bigint', () => {
        expect(primitives.maybeBigint('hello')).to.be.false
        expect(primitives.maybeBigint(5)).to.be.false
        expect(primitives.maybeBigint(true)).to.be.false
        expect(primitives.maybeBigint(Symbol('a'))).to.be.false
        expect(primitives.maybeBigint({})).to.be.false
        expect(primitives.maybeBigint(['a'])).to.be.false
        expect(primitives.maybeBigint(null)).to.be.false
      })
    })

    describe('When validating null', () => {
      it('Should validate a null', () => {
        expect(primitives.nullOrUndefined(null)).to.be.true
        expect(primitives.nullOrUndefined(undefined)).to.be.true
      })

      it('Should invalidate a non null', () => {
        expect(primitives.nullOrUndefined('hello')).to.be.false
        expect(primitives.nullOrUndefined(5)).to.be.false
        expect(primitives.nullOrUndefined(true)).to.be.false
        expect(primitives.nullOrUndefined(Symbol('a'))).to.be.false
        expect(primitives.nullOrUndefined({})).to.be.false
        expect(primitives.nullOrUndefined(['a'])).to.be.false
        expect(primitives.nullOrUndefined(BigInt(5))).to.be.false
      })
    })
  })

  describe('When validating with combined validator', () => {
    describe('When validating with unified validator', () => {
      const nullOrUndefined = anyOf(primitives.null, primitives.undefined)

      it('Should validate a undefined', () => {
        expect(nullOrUndefined(undefined)).to.be.true
      })

      it('Should validate a null', () => {
        expect(nullOrUndefined(null)).to.be.true
      })

      it('Should invalidate anything else', () => {
        expect(nullOrUndefined('hello')).to.be.false
        expect(nullOrUndefined(5)).to.be.false
        expect(nullOrUndefined(true)).to.be.false
        expect(nullOrUndefined(Symbol('a'))).to.be.false
        expect(nullOrUndefined({})).to.be.false
        expect(nullOrUndefined(['a'])).to.be.false
        expect(nullOrUndefined(BigInt(5))).to.be.false
      })
    })

    describe('When validating intersected validator', () => {
      const arrayAndObject = allOf(Array.isArray, isObject)

      it('Should validate an array', () => {
        expect(arrayAndObject([5])).to.be.true
      })

      it('Should invalidate anything else', () => {
        expect(arrayAndObject('hello')).to.be.false
        expect(arrayAndObject(5)).to.be.false
        expect(arrayAndObject(true)).to.be.false
        expect(arrayAndObject(Symbol('a'))).to.be.false
        expect(arrayAndObject({})).to.be.false
        expect(arrayAndObject(BigInt(5))).to.be.false
        expect(arrayAndObject(null)).to.be.false
      })
    })
  })

  describe('When validating an object type', () => {
    describe('When validating an array of something', () => {
      const isNumbersArray = arrayOf(primitives.number)

      it('Should validate an array of defined types', () => {
        expect(isNumbersArray([1, 2, 3])).to.be.true
        expect(isNumbersArray([])).to.be.true
      })

      it('Should invalidate arrays of other values', () => {
        expect(isNumbersArray([1, 2, '3'])).to.be.false
        expect(isNumbersArray([null])).to.be.false

      })

      it('Should invalidate anything else', () => {
        expect(isNumbersArray('hello')).to.be.false
        expect(isNumbersArray(5)).to.be.false
        expect(isNumbersArray(true)).to.be.false
        expect(isNumbersArray(Symbol('a'))).to.be.false
        expect(isNumbersArray({})).to.be.false
        expect(isNumbersArray(BigInt(5))).to.be.false
        expect(isNumbersArray(null)).to.be.false
      })
    })

    describe('When validating a record of something', () => {
      const isNumbersRecord = recordOf(primitives.number)

      it('Should validate a record of defined types', () => {
        expect(isNumbersRecord({ a: 1, b: 2, 5: 3 })).to.be.true
        expect(isNumbersRecord({})).to.be.true
      })

      it('Should invalidate records of other values', () => {
        expect(isNumbersRecord({ a: 1, 2: 'b' })).to.be.false
        expect(isNumbersRecord({ k: null })).to.be.false

      })

      it('Should invalidate anything else', () => {
        expect(isNumbersRecord('hello')).to.be.false
        expect(isNumbersRecord(5)).to.be.false
        expect(isNumbersRecord(true)).to.be.false
        expect(isNumbersRecord(Symbol('a'))).to.be.false
        expect(isNumbersRecord(BigInt(5))).to.be.false
        expect(isNumbersRecord(null)).to.be.false
      })
    })

    describe('When validating an object', () => {
      interface TestObj {
        str: string
        num: number
        bool: boolean
        sym: Symbol
      }

      const nonStrickTestValidator = objectOf<TestObj>({
        str: primitives.string,
        num: primitives.number,
        bool: primitives.boolean,
        sym: primitives.symbol,
      }, {
        strict: false
      })
      const strickTestValidator = objectOf<TestObj>({
        str: primitives.string,
        num: primitives.number,
        bool: primitives.boolean,
        sym: primitives.symbol,
      }, {
        strict: true
      })

      it('Should validate an object of the correct shape', () => {
        const obj: TestObj = {
          str: 'str',
          num: 5,
          bool: true,
          sym: Symbol.iterator,
        }

        expect(nonStrickTestValidator(obj)).to.be.true
        expect(strickTestValidator(obj)).to.be.true
        expect(nonStrickTestValidator({
          ...obj,
          extraKey: true,
        })).to.be.true
      })

      it('Should invalidate an object of an incorrect shape', () => {
        expect(strickTestValidator({
          str: 'str',
          num: 5,
          bool: true,
          sym: Symbol.iterator,
          extraKey: true,
        })).to.be.false

        expect(nonStrickTestValidator({
          str: 5,
          num: 'str',
          bool: true,
          sym: Symbol.iterator,
        })).to.be.false

        expect(nonStrickTestValidator({
          num: 5,
          bool: true,
          sym: Symbol.iterator,
        })).to.be.false
      })

      it('Should invalidate anything else', () => {
        expect(primitives.undefined('hello')).to.be.false
        expect(primitives.undefined(5)).to.be.false
        expect(primitives.undefined(true)).to.be.false
        expect(primitives.undefined(Symbol('a'))).to.be.false
        expect(primitives.undefined({})).to.be.false
        expect(primitives.undefined(['a'])).to.be.false
        expect(primitives.undefined(BigInt(5))).to.be.false
        expect(primitives.undefined(null)).to.be.false
      })
    })
  })
})
