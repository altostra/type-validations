import allOf from './allOf'
import arrayOf from './arrayOf'
import is from './is'
import { objectOf } from './objectOf'
import {
  bigint,
  boolean,
  number,
  string,
  symbol,
  undefinedValidation
} from './primitives'
import { typeValidatorType } from './RejectionReasons'
import { invalidPrimitives, primitivesChecks } from './TypeValidations.spec'
import { expect } from 'chai'
import sinon from 'sinon'

describe('allOf type-validation', () => {
  const type1 = arrayOf(string)
  const type2 = objectOf({
    length: is<2>(2),
  }, { strict: false })
  const allOfTest = allOf(type1, type2)

  describe('When no reasons are expected', () => {
    it('Should validate only values of the correct type', () => {
      expect(allOfTest(['str', 'str'])).to.be.true

      primitivesChecks(allOfTest, invalidPrimitives)
    })
  })

  describe('When reasons are expected', () => {
    const callback = sinon.spy()

    beforeEach(() => {
      callback.resetHistory()
    })

    describe('When validator has type', () => {
      it('Should have the correct type', () => {
        expect(allOfTest[typeValidatorType]).to
          .equal(`ArrayOf(string) & {
  length: 2,
  [*]: *
}`)


      })

      it('Should have short type of build from multiple validations', () => {
        const multiValidatorsAllOf = allOf(
          string,
          number,
          undefinedValidation,
          symbol,
          boolean,
          bigint
        )

        expect(multiValidatorsAllOf[typeValidatorType]).to
          .equal(`string & number & ... & boolean & bigint`)
      })
    })

    it('Shoud not call callback if value validates successfuly', () => {
      allOfTest(['str1', 'str2'], callback)

      expect(callback.callCount).to.be.equal(0)
    })

    it('Shoud call callback once value fails some validations', () => {
      allOfTest(['str'], callback)

      expect(callback.callCount).to.be.equal(1)
    })

    it('Shoud call callback once value fails many validations', () => {
      allOfTest(5, callback)

      expect(callback.callCount).to.be.equal(1)
    })
  })
})
