import { expect } from 'chai'
import sinon from 'sinon'
import { maybe } from './maybe'
import { string } from './primitives'
import { typeValidatorType } from './RejectionReasons'
import { invalidPrimitives, primitivesChecks } from './TypeValidations.spec'

describe('maybe type-validation', () => {
	const maybeTest = maybe(string)
	const maybeNullTest = maybe(string, true)

	describe('When no reasons are expected', () => {
		it('Should validate only values of the correct type', () => {
			primitivesChecks(maybeTest, {
				...invalidPrimitives,
				string: true,
				undefinedValidation: true,
			})

			primitivesChecks(maybeNullTest, {
				...invalidPrimitives,
				string: true,
				undefinedValidation: true,
				null: true,
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
				expect(maybeTest[typeValidatorType]).to
					.equal('?(string)')

				expect(maybeNullTest[typeValidatorType]).to
					.equal('?(string | null)')
			})
		})

		describe('When value is being validated successfully', () => {
			it('Should not call callback', () => {
				maybeTest('str', callback)
				expect(callback.callCount).to.be.equal(0)

				callback.resetHistory()

				maybeNullTest('str', callback)
				expect(callback.callCount).to.be.equal(0)
			})
		})

		describe('When value is not being validated successfully', () => {
			it('Should call callback for all failures', () => {
				maybeTest(true, callback)
				expect(callback.callCount).to.be.equal(2)

				callback.resetHistory()

				maybeNullTest(true, callback)
				expect(callback.callCount).to.be.equal(2)
			})

			it('Should set correct type for validations', () => {
				maybeTest(true, callback)
				expect(callback.args[0][0].propertyType).to.be.equal(maybeTest[typeValidatorType])

				callback.resetHistory()

				maybeNullTest(true, callback)
				expect(callback.args[0][0].propertyType).to.be.equal(maybeNullTest[typeValidatorType])
			})
		})
	})
})
