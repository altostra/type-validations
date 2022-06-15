import { expect } from 'chai'
import sinon from 'sinon'
import anyOf from './anyOf'
import {
	bigint,
	boolean,
	number,
	string,
	symbol,
	undefinedValidation,
} from './primitives'
import { typeValidatorType } from './RejectionReasons'
import { invalidPrimitives, primitivesChecks } from './TypeValidations.spec'

describe('anyOf type-validation', () => {
	const type1 = string
	const type2 = number
	const anyOfTest = anyOf(type1, type2)

	describe('When no reasons are expected', () => {
		it('Should validate only values of the correct type', () => {
			primitivesChecks(anyOfTest, {
				...invalidPrimitives,
				string: true,
				number: true,
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
				expect(anyOfTest[typeValidatorType]).to
					.equal('string | number')
			})

			it('Should have short type of build from multiple validations', () => {
				const multiValidatorsAllOf = anyOf(
					string,
					number,
					undefinedValidation,
					symbol,
					boolean,
					bigint,
				)

				expect(multiValidatorsAllOf[typeValidatorType]).to
					.equal('string | number | ... | boolean | bigint')
			})
		})

		describe('When value is being validated successfully', () => {
			it('Should not call callback', () => {
				anyOfTest(5, callback)

				expect(callback.callCount).to.be.equal(0)
			})
		})

		describe('When value is not being validated successfully', () => {
			it('Should call callback for all failure', () => {
				anyOfTest(true, callback)

				expect(callback.callCount).to.be.equal(2)
			})
		})
	})
})
