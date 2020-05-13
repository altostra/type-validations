import { is } from './is'
import { typeValidatorType } from './RejectionReasons'
import { invalidPrimitives, primitivesChecks } from './TypeValidations.spec'
import { expect } from 'chai'
import sinon from 'sinon'

describe('`is` type-validation', () => {

  const isTest = is(5 as 5)

  describe('When no reasons are expected', () => {
    it('Should validate only values of the correct type', () => {
      expect(isTest(5)).to.be.true
      expect(isTest(6)).to.be.false

      primitivesChecks(isTest, {
        ...invalidPrimitives,
        number: undefined,
      })
    })
  })

  describe('When reasons are expected', () => {
    const callback = sinon.spy()

    beforeEach(() => {
      callback.resetHistory()
    })

    describe('When validator has boolean type', () => {
      it('Should have the correct type', () => {
        expect(is(true)[typeValidatorType]).to
          .equal('true')
      })
    })

    describe('When validator has symbol type', () => {
      it('Should have the correct type', () => {
        expect(is(Symbol('sym'))[typeValidatorType]).to
          .equal('Symbol(sym)')
      })
    })

    describe('When validator has undefined type', () => {
      it('Should have the correct type', () => {
        expect(is(void 0)[typeValidatorType]).to
          .equal('undefined')
      })
    })

    describe('When validator has numeric type', () => {
      it('Should have the correct type', () => {
        expect(is(0)[typeValidatorType]).to
          .equal('0')

        expect(is(BigInt(-1))[typeValidatorType]).to
          .equal('-1n')
      })
    })

    describe('When validator has function type', () => {
      it('Should have the correct type', () => {
        expect(is((a: any) => { })[typeValidatorType]).to
          .equal(`is((...args) => *)`)
      })
    })

    describe('When validator has null type', () => {
      it('Should have the correct type', () => {
        expect(is(null)[typeValidatorType]).to
          .equal('null')
      })
    })

    describe('When validator has object type', () => {
      it('Should have the correct type', () => {
        expect(is({})[typeValidatorType]).to
          .equal('is({ ... })')
        expect(is([])[typeValidatorType]).to
          .equal('is([ ... ])')
      })
    })

    describe('When validator has string type', () => {
      it('Should have the correct type', () => {
        expect(is('a`')[typeValidatorType]).to
          .equal(`'a\`'`)
        expect(is('a"')[typeValidatorType]).to
          .equal(`'a"'`)
        expect(is('a')[typeValidatorType]).to
          .equal("'a'")
        expect(is("a'")[typeValidatorType]).to
          .equal(`"a'"`)
        expect(is(`a'"`)[typeValidatorType]).to
          .equal('`a\'"`')
        expect(is(`a'"`)[typeValidatorType]).to
          .equal('`a\'"`')
      })
    })

    describe('When value validates successfuly', () => {
      it('Shoud not call callback', () => {
        isTest(5, callback)
        expect(callback.callCount).to.be.equal(0)
      })
    })

    describe('When value fails validation', () => {
      it('Shoud call callback once', () => {
        isTest(['str'], callback)
        expect(callback.callCount).to.be.equal(1)
      })

      it('Shoud set correct type for validations', () => {
        isTest(true, callback)

        expect(callback.args[0][0].propertyType).to.be.equal(isTest[typeValidatorType])
      })
    })
  })
})
