import { expect } from 'chai'
import sinon from 'sinon'
import { arrayOf } from './arrayOf'
import { string } from './primitives'
import { typeValidatorType } from './RejectionReasons'
import { invalidPrimitives, primitivesChecks } from './TypeValidations.spec'

describe('arrayOf type-validation', () => {
	const arrayOfTest = arrayOf(string)

	describe('When no reasons are expected', () => {
		it('Should validate only values of the correct type', () => {
			expect(arrayOfTest(['str', 'str'])).to.be.true
			expect(arrayOfTest(['str', 2])).to.be.false
			expect(arrayOfTest('str')).to.be.false
			expect(arrayOfTest(2)).to.be.false

			primitivesChecks(arrayOfTest, invalidPrimitives)
		})
	})

	describe('When reasons are expected', () => {
		const callback = sinon.spy()

		beforeEach(() => {
			callback.resetHistory()
		})

		describe('When validator has type', () => {
			it('Should have the correct type', () => {
				expect(arrayOfTest[typeValidatorType]).to
					.equal('ArrayOf(string)')
			})
		})

		describe('When value validates successfully', () => {
			it('Should not call callback', () => {
				arrayOfTest(['str1'], callback)

				expect(callback.callCount).to.be.equal(0)
			})
		})

		describe('When value validates unsuccessfully', () => {
			it('Should call callback once if value is not an array', () => {
				arrayOfTest('str', callback)

				expect(callback.callCount).to.be.equal(1)
			})

			it('Should call callback once', () => {
				arrayOfTest(['str', 2], callback)

				expect(callback.callCount).to.be.equal(1)
			})

			it('Should call callback once value fails many validations', () => {
				arrayOfTest([1, 2], callback)

				expect(callback.callCount).to.be.equal(1)
			})

			it('Should set correct path for validations', () => {
				arrayOfTest(['str1', '2', 3], callback)

				expect(callback.args[0][0].path).to.be.deep.equal([2])
			})
		})
	})
})
