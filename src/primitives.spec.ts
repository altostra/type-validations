import {
  bigint,
  boolean,
  maybeBigint,
  maybeBoolean,
  maybeNumber,
  maybeString,
  maybeSymbol,
  nullOrUndefined,
  nullValidation,
  number,
  string,
  symbol,
  undefinedValidation
  } from './primitives'
import { typeValidatorType } from './RejectionReasons'
import { invalidPrimitives, primitivesChecks } from './TypeValidations.spec'
import { expect } from 'chai'
import sinon from 'sinon'

describe('primitive types validations', () => {
  describe('Given string type-validation', () => {

    const stringTest = string
    const maybeStringTest = maybeString

    describe('When no reasons are expected', () => {
      it('Should validate only values of the correct type', () => {
        primitivesChecks(stringTest, {
          ...invalidPrimitives,
          string: true,
        })

        primitivesChecks(maybeStringTest, {
          ...invalidPrimitives,
          string: true,
          undefinedValidation: true,
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
          expect(stringTest[typeValidatorType]).to
            .equal('string')

          expect(maybeStringTest[typeValidatorType]).to
            .equal('?(string)')
        })
      })

      describe('When value validates successfully', () => {
        it('Should not call callback', () => {
          stringTest('str', callback)
          maybeStringTest('str', callback)
          maybeStringTest(undefined, callback)

          expect(callback.callCount).to.be.equal(0)
        })
      })

      describe('When value fails validation', () => {
        it('Should call callback once', () => {
          stringTest(['str'], callback)
          expect(callback.callCount).to.be.equal(1)

          callback.resetHistory()

          maybeStringTest(['str'], callback)
          expect(callback.callCount).to.be.equal(2)
        })

        it('Should set correct type for validations', () => {
          stringTest(true, callback)
          expect(callback.args[0][0].propertyType).to.be.equal(stringTest[typeValidatorType])

          callback.resetHistory()

          maybeStringTest(true, callback)
          expect(callback.args[0][0].propertyType).to.be.equal(maybeStringTest[typeValidatorType])
        })
      })
    })
  })

  describe('Given number type-validation', () => {

    const numberTest = number
    const maybeNumberTest = maybeNumber

    describe('When no reasons are expected', () => {
      it('Should validate only values of the correct type', () => {
        primitivesChecks(numberTest, {
          ...invalidPrimitives,
          number: true,
        })

        primitivesChecks(maybeNumberTest, {
          ...invalidPrimitives,
          number: true,
          undefinedValidation: true,
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
          expect(numberTest[typeValidatorType]).to
            .equal('number')

          expect(maybeNumberTest[typeValidatorType]).to
            .equal('?(number)')
        })
      })

      describe('When value validates successfully', () => {
        it('Should not call callback', () => {
          numberTest(4, callback)
          maybeNumberTest(4, callback)
          maybeNumberTest(undefined, callback)

          expect(callback.callCount).to.be.equal(0)
        })
      })

      describe('When value fails validation', () => {
        it('Should call callback once', () => {
          numberTest(['str'], callback)
          expect(callback.callCount).to.be.equal(1)

          callback.resetHistory()

          maybeNumberTest(['str'], callback)
          expect(callback.callCount).to.be.equal(2)
        })

        it('Should set correct type for validations', () => {
          numberTest(true, callback)
          expect(callback.args[0][0].propertyType).to.be.equal(numberTest[typeValidatorType])

          callback.resetHistory()

          maybeNumberTest(true, callback)
          expect(callback.args[0][0].propertyType).to.be.equal(maybeNumberTest[typeValidatorType])
        })
      })
    })
  })

  describe('Given boolean type-validation', () => {

    const boolTest = boolean
    const maybeBoolTest = maybeBoolean

    describe('When no reasons are expected', () => {
      it('Should validate only values of the correct type', () => {
        primitivesChecks(boolTest, {
          ...invalidPrimitives,
          boolean: true,
        })

        primitivesChecks(maybeBoolTest, {
          ...invalidPrimitives,
          boolean: true,
          undefinedValidation: true,
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
          expect(boolTest[typeValidatorType]).to
            .equal('boolean')

          expect(maybeBoolTest[typeValidatorType]).to
            .equal('?(boolean)')
        })
      })

      describe('When value validates successfully', () => {
        it('Should not call callback', () => {
          boolTest(false, callback)
          maybeBoolTest(false, callback)
          maybeBoolTest(undefined, callback)

          expect(callback.callCount).to.be.equal(0)
        })
      })

      describe('When value fails validation', () => {
        it('Should call callback once', () => {
          boolTest(['str'], callback)
          expect(callback.callCount).to.be.equal(1)

          callback.resetHistory()

          maybeBoolTest(['str'], callback)
          expect(callback.callCount).to.be.equal(2)
        })

        it('Should set correct type for validations', () => {
          boolTest(3, callback)
          expect(callback.args[0][0].propertyType).to.be.equal(boolTest[typeValidatorType])

          callback.resetHistory()

          maybeBoolTest(3, callback)
          expect(callback.args[0][0].propertyType).to.be.equal(maybeBoolTest[typeValidatorType])
        })
      })
    })
  })

  describe('Given null type-validation', () => {

    const nullTest = nullValidation
    const maybeNullTest = nullOrUndefined

    describe('When no reasons are expected', () => {
      it('Should validate only values of the correct type', () => {
        primitivesChecks(nullTest, {
          ...invalidPrimitives,
          null: true,
        })

        primitivesChecks(maybeNullTest, {
          ...invalidPrimitives,
          null: true,
          undefinedValidation: true,
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
          expect(nullTest[typeValidatorType]).to
            .equal('null')

          expect(maybeNullTest[typeValidatorType]).to
            .equal('?(null)')
        })
      })

      describe('When value validates successfully', () => {
        it('Should not call callback', () => {
          nullTest(null, callback)
          maybeNullTest(null, callback)
          maybeNullTest(undefined, callback)

          expect(callback.callCount).to.be.equal(0)
        })
      })

      describe('When value fails validation', () => {
        it('Should call callback once', () => {
          nullTest(['str'], callback)
          expect(callback.callCount).to.be.equal(1)

          callback.resetHistory()

          maybeNullTest(['str'], callback)
          expect(callback.callCount).to.be.equal(2)
        })

        it('Should set correct type for validations', () => {
          nullTest(3, callback)
          expect(callback.args[0][0].propertyType).to.be.equal(nullTest[typeValidatorType])

          callback.resetHistory()

          maybeNullTest(3, callback)
          expect(callback.args[0][0].propertyType).to.be.equal(maybeNullTest[typeValidatorType])
        })
      })
    })
  })

  describe('Given undefined type-validation', () => {

    const undefinedTest = undefinedValidation

    describe('When no reasons are expected', () => {
      it('Should validate only values of the correct type', () => {
        primitivesChecks(undefinedTest, {
          ...invalidPrimitives,
          undefinedValidation: true,
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
          expect(undefinedTest[typeValidatorType]).to
            .equal('undefined')
        })
      })

      describe('When value validates successfully', () => {
        it('Should not call callback', () => {
          undefinedTest(undefined, callback)

          expect(callback.callCount).to.be.equal(0)
        })
      })

      describe('When value fails validation', () => {
        it('Should call callback once', () => {
          undefinedTest(['str'], callback)
          expect(callback.callCount).to.be.equal(1)
        })

        it('Should set correct type for validations', () => {
          undefinedTest(3, callback)
          expect(callback.args[0][0].propertyType).to.be.equal(undefinedTest[typeValidatorType])
        })
      })
    })
  })

  describe('Given symbol type-validation', () => {

    const symbolTest = symbol
    const maybeSymbolTest = maybeSymbol

    describe('When no reasons are expected', () => {
      it('Should validate only values of the correct type', () => {
        primitivesChecks(symbolTest, {
          ...invalidPrimitives,
          symbol: true,
        })

        primitivesChecks(maybeSymbolTest, {
          ...invalidPrimitives,
          symbol: true,
          undefinedValidation: true,
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
          expect(symbolTest[typeValidatorType]).to
            .equal('symbol')

          expect(maybeSymbolTest[typeValidatorType]).to
            .equal('?(symbol)')
        })
      })

      describe('When value validates successfully', () => {
        const sym = Symbol('sym')
        it('Should not call callback', () => {
          symbolTest(sym, callback)
          maybeSymbolTest(sym, callback)
          maybeSymbolTest(undefined, callback)

          expect(callback.callCount).to.be.equal(0)
        })
      })

      describe('When value fails validation', () => {
        it('Should call callback once', () => {
          symbolTest(['str'], callback)
          expect(callback.callCount).to.be.equal(1)

          callback.resetHistory()

          maybeSymbolTest(['str'], callback)
          expect(callback.callCount).to.be.equal(2)
        })

        it('Should set correct type for validations', () => {
          symbolTest(3, callback)
          expect(callback.args[0][0].propertyType).to.be.equal(symbolTest[typeValidatorType])

          callback.resetHistory()

          maybeSymbolTest(3, callback)
          expect(callback.args[0][0].propertyType).to.be.equal(maybeSymbolTest[typeValidatorType])
        })
      })
    })
  })

  describe('Given bigint type-validation', () => {

    const bigintTest = bigint
    const maybeBigintTest = maybeBigint

    describe('When no reasons are expected', () => {
      it('Should validate only values of the correct type', () => {
        primitivesChecks(bigintTest, {
          ...invalidPrimitives,
          bigint: true,
        })

        primitivesChecks(maybeBigintTest, {
          ...invalidPrimitives,
          bigint: true,
          undefinedValidation: true,
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
          expect(bigintTest[typeValidatorType]).to
            .equal('bigint')

          expect(maybeBigintTest[typeValidatorType]).to
            .equal('?(bigint)')
        })
      })

      describe('When value validates successfully', () => {
        const bi = BigInt(7)

        it('Should not call callback', () => {
          bigintTest(bi, callback)
          maybeBigintTest(bi, callback)
          maybeBigintTest(undefined, callback)

          expect(callback.callCount).to.be.equal(0)
        })
      })

      describe('When value fails validation', () => {
        it('Should call callback once', () => {
          bigintTest(['str'], callback)
          expect(callback.callCount).to.be.equal(1)

          callback.resetHistory()

          maybeBigintTest(['str'], callback)
          expect(callback.callCount).to.be.equal(2)
        })

        it('Should set correct type for validations', () => {
          bigintTest(3, callback)
          expect(callback.args[0][0].propertyType).to.be.equal(bigintTest[typeValidatorType])

          callback.resetHistory()

          maybeBigintTest(3, callback)
          expect(callback.args[0][0].propertyType).to.be.equal(maybeBigintTest[typeValidatorType])
        })
      })
    })
  })
})
