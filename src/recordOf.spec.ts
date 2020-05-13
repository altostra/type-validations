import { string } from './primitives'
import { recordOf } from './recordOf'
import { typeValidatorType } from './RejectionReasons'
import { invalidPrimitives, primitivesChecks } from './TypeValidations.spec'
import { expect } from 'chai'
import sinon from 'sinon'

describe('recordOf type-validation', () => {
  const recordOfTest = recordOf(string)

  describe('When no reasons are expected', () => {
    it('Should validate only values of the correct type', () => {
      expect(recordOfTest({ a: 'str', b: '1' })).to.be.true
      expect(recordOfTest(['str', 'str'])).to.be.true
      expect(recordOfTest({ a: 'str', b: 2 })).to.be.false
      expect(recordOfTest('str')).to.be.false
      expect(recordOfTest(2)).to.be.false

      primitivesChecks(recordOfTest, invalidPrimitives)
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
      })
    })

    describe('When value validates successfuly', () => {
      it('Shoud not call callback', () => {
        recordOfTest({ prop: 'str1' }, callback)

        expect(callback.callCount).to.be.equal(0)
      })
    })

    describe('When value validates unsuccessfuly', () => {
      it('Shoud call callback once if value is not an object', () => {
        recordOfTest('str', callback)

        expect(callback.callCount).to.be.equal(1)
      })

      it('Shoud call callback once', () => {
        recordOfTest({ a: 'str', b: !'str' }, callback)

        expect(callback.callCount).to.be.equal(1)
      })

      it('Shoud call callback once value fails many validations', () => {
        recordOfTest({ a: 1, b: 2 }, callback)

        expect(callback.callCount).to.be.equal(1)
      })

      it('Shoud set correct path for validations', () => {
        recordOfTest({ a: 'str', b: !'str' }, callback)

        expect(callback.args[0][0].path).to.be.deep.equal(['b'])
      })
    })
  })
})
