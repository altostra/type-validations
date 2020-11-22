import allOf from './allOf'
import anyOf from './anyOf'
import arrayOf from './arrayOf'
import enumOf from './enumOf'
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

describe('enumOf type-validation', () => {
  const value1 = 1
  const value2 = 'str'
  const value3 = '2'
  const enumOfTest = enumOf(...[value1, value2, value3] as const)

  describe('When no reasons are expected', () => {
    it('Should validate only values of the correct type', () => {
      expect(enumOfTest(1)).to.be.true
      expect(enumOfTest('str')).to.be.true
      expect(enumOfTest('2')).to.be.true
      expect(enumOfTest('1')).to.be.false
      expect(enumOfTest(2)).to.be.false
      expect(enumOfTest('str2')).to.be.false

      primitivesChecks(enumOfTest, {
        ...invalidPrimitives,
        number: undefined,
        string: undefined,
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
        expect(enumOfTest[typeValidatorType]).to
          .equal(`1 | 'str' | '2'`)
      })

      it('Should have short type of build from multiple validations', () => {
        const multiValidatorsAllOf = enumOf(1, 2, 3, 4, 5, 6)

        expect(multiValidatorsAllOf[typeValidatorType]).to
          .equal(`1 | 2 | ... | 5 | 6`)
      })
    })

    it('Shoud not call callback if value validates successfuly', () => {
      enumOfTest(1, callback)

      expect(callback.callCount).to.be.equal(0)
    })

    it('Shoud call callback for all failure if values fails', () => {
      enumOfTest(true, callback)

      expect(callback.callCount).to.be.equal(1)
    })
  })
})
