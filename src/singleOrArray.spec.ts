import { string } from './primitives'
import { typeValidatorType } from './RejectionReasons'
import { singleOrArray } from './singleOrArray'
import { invalidPrimitives, primitivesChecks } from './TypeValidations.spec'
import { expect } from 'chai'
import sinon from 'sinon'

describe('singleOrArray type-validation', () => {
  const singleOrArrayTest = singleOrArray(string)

  describe('When no reasons are expected', () => {
    it('Should validate only values of the correct type', () => {
      expect(singleOrArrayTest(['str1', 'str2'])).to.be.true
      expect(singleOrArrayTest(['str1', 2])).to.be.false
      expect(singleOrArrayTest([])).to.be.true
      expect(singleOrArrayTest({ 0: 'str1', 1: 2 })).to.be.false

      primitivesChecks(singleOrArrayTest, {
        ...invalidPrimitives,
        string: true,
      })
    })
  })

  describe('When reasons are expected', () => {
    const callback = sinon.spy()

    beforeEach(() => {
      callback.resetHistory()
    })

    describe('When validator has type', () => {
      it('Should have the correct type', () => {
        expect(singleOrArrayTest[typeValidatorType]).to
          .equal(`string | ArrayOf(string)`)
      })
    })

    describe('When value is being validated successfuly', () => {
      it('Shoud not call callback', () => {
        singleOrArrayTest('str', callback)
        singleOrArrayTest(['str'], callback)

        expect(callback.callCount).to.be.equal(0)
      })
    })

    describe('When value is not being validated successfuly', () => {
      it('Shoud call callback for all failure', () => {
        singleOrArrayTest(true, callback)
        expect(callback.callCount).to.be.equal(2)
      })
    })
  })
})
