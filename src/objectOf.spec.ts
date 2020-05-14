import { objectOf, ObjectValidations, TupleValidations } from './objectOf'
import {
  bigint,
  boolean,
  nullValidation,
  number,
  string,
  symbol
  } from './primitives'
import { typeValidatorType } from './RejectionReasons'
import { invalidPrimitives, primitivesChecks } from './TypeValidations.spec'
import { expect } from 'chai'
import sinon from 'sinon'

describe('objectOf type-validation', () => {
  const strict = objectOf({
    num: number,
    str: string,
  }, { strict: true })
  const nonStrict = objectOf({
    num: number,
    str: string,
  }, { strict: false })
  const strictObj = {
    num: 5,
    str: 'a-string',
  }
  const nonStrictObj = {
    ...strictObj,
    other: true,
  }
  const strictTuple = objectOf([number, string] as const, { strict: true })
  const nonStrictTuple = objectOf([number, string], { strict: false })
  const strictTupleArr = [5, 'a-string']
  const nonStrictTupleArr = Object.assign([], strictTupleArr, { other: true })

  describe('When no reasons are expected', () => {
    it('Should validate only values of the correct type', () => {
      expect(strict(strictObj)).to.be.true
      expect(strict(nonStrictObj)).to.be.false
      expect(nonStrict(strictObj)).to.be.true
      expect(nonStrict(nonStrictObj)).to.be.true

      expect(strictTuple(strictTupleArr)).to.be.true
      expect(strictTuple(nonStrictTupleArr)).to.be.false
      expect(nonStrictTuple(strictTupleArr)).to.be.true
      expect(nonStrictTuple(nonStrictTupleArr)).to.be.true

      primitivesChecks(strict, invalidPrimitives)
      primitivesChecks(nonStrict, invalidPrimitives)
      primitivesChecks(strictTuple, invalidPrimitives)
      primitivesChecks(nonStrictTuple, invalidPrimitives)
    })
  })

  describe('When reasons are expected', () => {
    const callback = sinon.spy()

    beforeEach(() => {
      callback.resetHistory()
    })

    describe('When validator has type', () => {
      it('Should have the correct type', () => {
        expect(strict[typeValidatorType]).to
          .equal(`{
  num: number,
  str: string
}`)

        expect(nonStrict[typeValidatorType]).to
          .equal(`{
  num: number,
  str: string,
  [*]: *
}`)

        expect(strictTuple[typeValidatorType]).to
          .equal(`[
  number,
  string
]`)

        expect(nonStrictTuple[typeValidatorType]).to
          .equal(`[
  number,
  string,
  ...*[]
]`)
      })

      it('Should have shortened type when object type has a lot of peroperties', () => {
        interface ValidatedType {
          s: string
          n: number
          b: boolean
          bi: bigint
          sy: symbol
          nil: null
        }
        type ValidatedTuple = [
          string,
          number,
          boolean,
          bigint,
          symbol,
          null,
        ]
        const validations: ObjectValidations<ValidatedType> = {
          s: string,
          n: number,
          b: boolean,
          bi: bigint,
          sy: symbol,
          nil: nullValidation,
        }
        const tupleValidations: TupleValidations<ValidatedTuple> = [
          string,
          number,
          boolean,
          bigint,
          symbol,
          nullValidation,
        ]

        const strictLong = objectOf(validations, { strict: true })
        const nonStrictLong = objectOf(validations, { strict: false })
        const strictLongTuple = objectOf(tupleValidations, { strict: true })
        const nonStrictLongTuple = objectOf(tupleValidations, { strict: false })

        expect(strictLong[typeValidatorType]).to
          .equal(`{
  s: string,
  n: number,
  ...,
  sy: symbol,
  nil: null
}`)

        expect(nonStrictLong[typeValidatorType]).to
          .equal(`{
  s: string,
  n: number,
  ...,
  sy: symbol,
  nil: null,
  [*]: *
}`)

        expect(strictLongTuple[typeValidatorType]).to
          .equal(`[
  string,
  number,
  ...,
  symbol,
  null
]`)

        expect(nonStrictLongTuple[typeValidatorType]).to
          .equal(`[
  string,
  number,
  ...,
  symbol,
  null,
  ...*[]
]`)
      })
    })

    describe('When value validates successfuly', () => {
      it('Shoud not call callback', () => {
        strict(strictObj, callback)
        nonStrict(strictObj, callback)
        strictTuple(strictTupleArr, callback)
        nonStrictTuple(strictTupleArr, callback)

        expect(callback.callCount).to.be.equal(0)
      })
    })

    describe('When value validates unsuccessfuly', () => {
      it('Shoud call callback once if value is not an object', () => {
        strict('str', callback)
        expect(callback.callCount).to.be.equal(1)

        callback.resetHistory()

        nonStrict('str', callback)
        expect(callback.callCount).to.be.equal(1)

        callback.resetHistory()

        strictTuple('str', callback)
        expect(callback.callCount).to.be.equal(1)

        callback.resetHistory()

        nonStrictTuple('str', callback)
        expect(callback.callCount).to.be.equal(1)
      })

      it('Shoud call callback once if tuple value is not an array', () => {
        strictTuple({ 0: 5, 1: 'str', length: 2 }, callback)
        expect(callback.callCount).to.be.equal(1)

        callback.resetHistory()

        nonStrictTuple({ 0: 5, 1: 'str', length: 2 }, callback)
        expect(callback.callCount).to.be.equal(1)
      })

      it('Shoud call callback once', () => {
        strict({ num: 'str', str: 'a' }, callback)
        expect(callback.callCount).to.be.equal(1)

        callback.resetHistory()

        nonStrict({ num: 'str', str: 'a' }, callback)
        expect(callback.callCount).to.be.equal(1)

        callback.resetHistory()

        strictTuple(['str', 5], callback)
        expect(callback.callCount).to.be.equal(1)

        callback.resetHistory()

        nonStrictTuple(['str', 5], callback)
        expect(callback.callCount).to.be.equal(1)
      })

      it('Shoud call callback once value fails many validations', () => {
        strict({ num: 'str', str: 5 }, callback)
        expect(callback.callCount).to.be.equal(1)

        callback.resetHistory()

        nonStrict({ num: 'str', str: 5 }, callback)
        expect(callback.callCount).to.be.equal(1)

        callback.resetHistory()

        strictTuple(['str', 5], callback)
        expect(callback.callCount).to.be.equal(1)

        callback.resetHistory()

        nonStrictTuple(['str', 5], callback)
        expect(callback.callCount).to.be.equal(1)
      })

      it('Shoud set correct path for validations', () => {
        strict({ num: 4, str: 'ab', other: true }, callback)
        expect(callback.args[0][0].path).to.be.deep.equal(['other'])

        callback.resetHistory()

        strict({ num: 4, str: 3 }, callback)
        expect(callback.args[0][0].path).to.be.deep.equal(['str'])

        callback.resetHistory()

        nonStrict({ num: '4', str: '3', other: true }, callback)
        expect(callback.args[0][0].path).to.be.deep.equal(['num'])

        callback.resetHistory()

        strictTuple(['str', 'str'], callback)
        expect(callback.args[0][0].path).to.be.deep.equal([0])

        callback.resetHistory()

        strictTuple([4, 3], callback)
        expect(callback.args[0][0].path).to.be.deep.equal([1])

        callback.resetHistory()
      })
    })
  })
})
