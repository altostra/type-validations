import { isEmptyArray } from './isEmptyArray'
import { typeValidatorType } from './RejectionReasons'
import { invalidPrimitives, primitivesChecks } from './TypeValidations.spec'
import { expect } from 'chai'
import sinon from 'sinon'

describe('isEmptyArray type-validation', () => {

  const isEmptyArrayTest = isEmptyArray

  describe('When no reasons are expected', () => {
    it('Should validate only values of the correct type', () => {
      expect(isEmptyArrayTest([])).to.be.true
      expect(isEmptyArrayTest([5])).to.be.false
      expect(isEmptyArrayTest({})).to.be.false

      primitivesChecks(isEmptyArrayTest, invalidPrimitives)
    })
  })

  describe('When reasons are expected', () => {
    const callback = sinon.spy()

    beforeEach(() => {
      callback.resetHistory()
    })

    describe('When validator has type', () => {
      it('Should have the correct type', () => {
        expect(isEmptyArrayTest[typeValidatorType]).to
          .equal('[]')
      })
    })

    describe('When value validates successfuly', () => {
      it('Shoud not call callback', () => {
        isEmptyArrayTest([], callback)
        expect(callback.callCount).to.be.equal(0)
      })
    })

    describe('When value fails validation', () => {
      it('Shoud call callback once', () => {
        isEmptyArrayTest(['str'], callback)
        expect(callback.callCount).to.be.equal(1)
      })

      it('Shoud set correct type for validations', () => {
        isEmptyArrayTest(true, callback)

        expect(callback.args[0][0].propertyType).to.be.equal(isEmptyArrayTest[typeValidatorType])
      })
    })
  })
})
