import { isEmptyObject } from './isEmptyObject'
import { typeValidatorType } from './RejectionReasons'
import { invalidPrimitives, primitivesChecks } from './TypeValidations.spec'
import { expect } from 'chai'
import sinon from 'sinon'

describe('isEmptyObject type-validation', () => {

  const isEmptyObjectTest = isEmptyObject

  describe('When no reasons are expected', () => {
    it('Should validate only values of the correct type', () => {
      expect(isEmptyObjectTest({})).to.be.true
      expect(isEmptyObjectTest({ a: 5 })).to.be.false
      expect(isEmptyObjectTest([])).to.be.true

      primitivesChecks(isEmptyObjectTest, invalidPrimitives)
    })
  })

  describe('When reasons are expected', () => {
    const callback = sinon.spy()

    beforeEach(() => {
      callback.resetHistory()
    })

    describe('When validator has type', () => {
      it('Should have the correct type', () => {
        expect(isEmptyObjectTest[typeValidatorType]).to
          .equal('{}')
      })
    })

    describe('When value validates successfuly', () => {
      it('Shoud not call callback', () => {
        isEmptyObjectTest([], callback)
        expect(callback.callCount).to.be.equal(0)
      })
    })

    describe('When value fails validation', () => {
      it('Shoud call callback once', () => {
        isEmptyObjectTest(['str'], callback)
        expect(callback.callCount).to.be.equal(1)
      })

      it('Shoud set correct type for validations', () => {
        isEmptyObjectTest(true, callback)

        expect(callback.args[0][0].propertyType).to.be.equal(isEmptyObjectTest[typeValidatorType])
      })
    })
  })
})
