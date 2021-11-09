import { string } from './primitives'
import { recordOf } from './recordOf'
import { typeValidatorType } from './RejectionReasons'
import { invalidPrimitives, primitivesChecks } from './TypeValidations.spec'
import { expect } from 'chai'
import sinon from 'sinon'

describe('recordOf type-validation', () => {
  const isSingleLetterKey = (x: unknown) => typeof x === 'string' &&
    x.length === 1

  const recordOfTest = recordOf(string)
  const recordOfKeyTest = recordOf({
    key: isSingleLetterKey,
    value: string,
  })

  describe('When no reasons are expected', () => {
    it('Should validate only values of the correct type', () => {
      expect(recordOfTest({ a: 'str', b: '1' })).to.be.true
      expect(recordOfTest(['str', 'str'])).to.be.true
      expect(recordOfKeyTest({ a: 'str', b: '1' })).to.be.true
      expect(recordOfKeyTest(['str', 'str'])).to.be.true
      expect(recordOfTest({ a: 'str', b: 2 })).to.be.false
      expect(recordOfTest('str')).to.be.false
      expect(recordOfTest(2)).to.be.false
      expect(recordOfKeyTest({ a: 'str', b: 2 })).to.be.false
      expect(recordOfKeyTest({ a2: 'str' })).to.be.false
      expect(recordOfKeyTest('str')).to.be.false
      expect(recordOfKeyTest(2)).to.be.false

      primitivesChecks(recordOfTest, invalidPrimitives)
      primitivesChecks(recordOfKeyTest, invalidPrimitives)
    })
  })

  describe('When reasons are expected', () => {
    const callback = sinon.spy()

    beforeEach(() => {
      callback.resetHistory()
    })

    describe('When validator has type', () => {
      it('Should have the correct type', () => {
        expect(recordOfTest[typeValidatorType]).to
          .equal(`{ [*]: string }`)
        expect(recordOfKeyTest[typeValidatorType]).to
          .equal(`{ [* (isSingleLetterKey)]: string }`)
      })
    })

    describe('When value validates successfully', () => {
      it('Should not call callback', () => {
        recordOfTest({ prop: 'str1' }, callback)
        recordOfKeyTest({ p: 'str1' }, callback)

        expect(callback.callCount).to.be.equal(0)
      })
    })

    describe('When value validates unsuccessfully', () => {
      it('Should call callback once if value is not an object', () => {
        recordOfTest('str', callback)
        expect(callback.callCount).to.be.equal(1)

        callback.resetHistory()

        recordOfKeyTest('str', callback)
        expect(callback.callCount).to.be.equal(1)
      })

      it('Should call callback once', () => {
        recordOfTest({ a: 'str', b: !'str' }, callback)
        expect(callback.callCount).to.be.equal(1)

        callback.resetHistory()

        recordOfKeyTest({ aa: 'str', b: 'str' }, callback)
        expect(callback.callCount).to.be.equal(1)
      })

      it('Should call callback once value fails many validations', () => {
        recordOfTest({ a: 1, b: 2 }, callback)
        expect(callback.callCount).to.be.equal(1)

        callback.resetHistory()

        recordOfKeyTest({ a: 1, bb: '2' }, callback)
        expect(callback.callCount).to.be.equal(1)
      })

      it('Should set correct path for validations', () => {
        recordOfTest({ a: 'str', b: !'str' }, callback)
        expect(callback.args[0][0].path).to.be.deep.equal(['b'])

        callback.resetHistory()

        recordOfKeyTest({ aa: 'str', b: 'str' }, callback)
        expect(callback.args[0][0].path).to.be.deep.equal([])
      })
    })
  })
})
