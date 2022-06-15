import { expect } from 'chai'
import type { TypeValidation } from './Common'
import { isObject, transformValidation } from './Common'
import is from './is'
import objectOf from './objectOf'
import { boolean, number, string } from './primitives'
import type { ValidationRejection } from './RejectionReasons'
import { createRejectionsCollector, rejectionMessage } from './RejectionReasons'
import taggedUnionOf from './taggedUnionOf'
import { invalidPrimitives, primitivesChecks } from './TypeValidations.spec'

describe('taggedUnionOf type-validation', () => {
	interface A {
		tag: 'a'
		string: string
	}

	interface B {
		tag: 'b'
		num: number
	}

	interface C {
		tag: 'c'
		bool: boolean
	}

	interface D {
		tag: 'd'
		obj: object
	}

	const isABByObj = taggedUnionOf('tag', {
		a: objectOf<A>({
			tag: is('a'),
			string,
		}) as TypeValidation<A | B>,
		b: objectOf<B>({
			tag: is('b'),
			num: number,
		}),
	})
	const isCDByMap = taggedUnionOf('tag', new Map([
		['c', objectOf<C>({
			tag: is('c'),
			bool: boolean,
		}) as TypeValidation<C | D>],
		['d', objectOf<D>({
			tag: is('d'),
			obj: isObject,
		})],
	]))
	const isABCDCombined = taggedUnionOf(
		'tag',
		isABByObj.unionSpec(),
		isCDByMap.unionSpec(),
	)
	const isABCDTransformed = isABCDCombined[transformValidation](Symbol('any-transformation'), [])

	describe('When no reasons are expected', () => {
		describe('And the validated value is a primitive', () => {
			describe('While using object spec', () => {
				it('Should be rejected', () => {
					primitivesChecks(isABByObj, invalidPrimitives)
				})
			})

			describe('While using map spec', () => {
				it('Should be rejected', () => {
					primitivesChecks(isCDByMap, invalidPrimitives)
				})
			})

			describe('While using combined spec', () => {
				it('Should be rejected', () => {
					primitivesChecks(isABCDCombined, invalidPrimitives)
				})
			})

			describe('While using transformed spec', () => {
				it('Should be rejected', () => {
					primitivesChecks(isABCDTransformed, invalidPrimitives)
				})
			})
		})

		describe('And the validated value has no tag', () => {
			const value = {
				string: 'abc',
			}

			describe('While using object spec', () => {
				it('Should be rejected', () => {
					expect(isABByObj(value)).to.be.false
				})
			})

			describe('While using map spec', () => {
				it('Should be rejected', () => {
					expect(isCDByMap(value)).to.be.false
				})
			})

			describe('While using combined spec', () => {
				it('Should be rejected', () => {
					expect(isABCDCombined(value)).to.be.false
				})
			})

			describe('While using transformed validator', () => {
				it('Should be rejected', () => {
					expect(isABCDTransformed(value)).to.be.false
				})
			})
		})

		describe('And the validated value has unknown tag', () => {
			const value = {
				tag: 'e',
				string: 'abc',
			}

			describe('While using object spec', () => {
				it('Should be rejected', () => {
					expect(isABByObj(value)).to.be.false
				})
			})

			describe('While using map spec', () => {
				it('Should be rejected', () => {
					expect(isCDByMap(value)).to.be.false
				})
			})

			describe('While using combined spec', () => {
				it('Should be rejected', () => {
					expect(isABCDCombined(value)).to.be.false
				})
			})

			describe('While using transformed validation', () => {
				it('Should be rejected', () => {
					expect(isABCDTransformed(value)).to.be.false
				})
			})
		})

		describe('And the validated value has a known tag with invalid shape', () => {
			const abValue = {
				tag: 'b',
				string: 'abc',
			}
			const cdValue = {
				tag: 'c',
				obj: { myObj: true },
			}

			describe('While using object spec', () => {
				it('Should be rejected', () => {
					expect(isABByObj(abValue)).to.be.false
				})
			})

			describe('While using map spec', () => {
				it('Should be rejected', () => {
					expect(isCDByMap(cdValue)).to.be.false
				})
			})

			describe('While using combined spec', () => {
				it('Should be rejected', () => {
					expect(isABCDCombined(abValue)).to.be.false
					expect(isABCDCombined(cdValue)).to.be.false
				})
			})

			describe('While using transformed validation', () => {
				it('Should be rejected', () => {
					expect(isABCDTransformed(abValue)).to.be.false
					expect(isABCDTransformed(cdValue)).to.be.false
				})
			})
		})

		describe('And the validated value has a known tag and valid shape', () => {
			const abValue = {
				tag: 'a',
				string: 'abc',
			}
			const cdValue = {
				tag: 'd',
				obj: { myObj: true },
			}

			describe('While using object spec', () => {
				it('Should be rejected', () => {
					expect(isABByObj(abValue)).to.be.true
				})
			})

			describe('While using map spec', () => {
				it('Should be rejected', () => {
					expect(isCDByMap(cdValue)).to.be.true
				})
			})

			describe('While using combined spec', () => {
				it('Should be rejected', () => {
					expect(isABCDCombined(abValue)).to.be.true
					expect(isABCDCombined(cdValue)).to.be.true
				})
			})

			describe('While using transformed validation', () => {
				it('Should be rejected', () => {
					expect(isABCDTransformed(abValue)).to.be.true
					expect(isABCDTransformed(cdValue)).to.be.true
				})
			})
		})
	})

	describe('When reasons are expected', () => {
		describe('And the validated value is a primitive', () => {
			const validated = Math.random()

			describe('While using object spec', () => {
				const rejections = createRejectionsCollector()

				// We assume the expected result is a single element tuple, as `taggedUnionOf` suppose to
				// never emit more than one rejection on its own (not emerging from deeper validations)
				const expected: [ValidationRejection] = [{
					reason: rejectionMessage`Value ${validated} is not an object`,
					path: [],
					propertyType: `{
  tag: 'a',
  string: string,
  [*]: *
} | {
  tag: 'b',
  num: number,
  [*]: *
}`,
				}]

				it('Should be rejected', () => {
					isABByObj(validated, rejections)

					expect(rejections.asArray()).to.deep.equal(expected)
				})
			})

			describe('While using map spec', () => {
				const rejections = createRejectionsCollector()

				// We assume the expected result is a single element tuple, as `taggedUnionOf` suppose to
				// never emit more than one rejection on its own (not emerging from deeper validations)
				const expected: [ValidationRejection] = [{
					reason: rejectionMessage`Value ${validated} is not an object`,
					path: [],
					propertyType: `{
  tag: 'c',
  bool: boolean,
  [*]: *
} | {
  tag: 'd',
  obj: * (isObject),
  [*]: *
}`,
				}]

				it('Should be rejected', () => {
					isCDByMap(validated, rejections)

					expect(rejections.asArray()).to.deep.equal(expected)
				})
			})

			describe('While using combined spec', () => {
				const rejections = createRejectionsCollector()

				// We assume the expected result is a single element tuple, as `taggedUnionOf` suppose to
				// never emit more than one rejection on its own (not emerging from deeper validations)
				const expected: [ValidationRejection] = [{
					reason: rejectionMessage`Value ${validated} is not an object`,
					path: [],
					propertyType: `{
  tag: 'a',
  string: string,
  [*]: *
} | {
  tag: 'b',
  num: number,
  [*]: *
} | {
  tag: 'c',
  bool: boolean,
  [*]: *
} | {
  tag: 'd',
  obj: * (isObject),
  [*]: *
}`,
				}]

				it('Should be rejected', () => {
					isABCDCombined(validated, rejections)

					expect(rejections.asArray()).to.deep.equal(expected)
				})
			})

			describe('While using transformed validation', () => {
				const rejections = createRejectionsCollector()

				// We assume the expected result is a single element tuple, as `taggedUnionOf` suppose to
				// never emit more than one rejection on its own (not emerging from deeper validations)
				const expected: [ValidationRejection] = [{
					reason: rejectionMessage`Value ${validated} is not an object`,
					path: [],
					propertyType: `{
  tag: 'a',
  string: string,
  [*]: *
} | {
  tag: 'b',
  num: number,
  [*]: *
} | {
  tag: 'c',
  bool: boolean,
  [*]: *
} | {
  tag: 'd',
  obj: * (isObject),
  [*]: *
}`,
				}]

				it('Should be rejected', () => {
					isABCDTransformed(validated, rejections)

					expect(rejections.asArray()).to.deep.equal(expected)
				})
			})
		})

		describe('And the validated value has no tag', () => {
			const validated = {
				string: 'abc',
			}

			describe('While using object spec', () => {
				const rejections = createRejectionsCollector()

				// We assume the expected result is a single element tuple, as `taggedUnionOf` suppose to
				// never emit more than one rejection on its own (not emerging from deeper validations)
				const expected: [ValidationRejection] = [{
					reason: rejectionMessage`Value ${validated} has an invalid tag ${undefined}`,
					path: [],
					propertyType: `{
  tag: 'a',
  string: string,
  [*]: *
} | {
  tag: 'b',
  num: number,
  [*]: *
}`,
				}]

				it('Should be rejected', () => {
					isABByObj(validated, rejections)

					expect(rejections.asArray()).to.deep.equal(expected)
				})
			})

			describe('While using map spec', () => {
				const rejections = createRejectionsCollector()

				// We assume the expected result is a single element tuple, as `taggedUnionOf` suppose to
				// never emit more than one rejection on its own (not emerging from deeper validations)
				const expected: [ValidationRejection] = [{
					reason: rejectionMessage`Value ${validated} has an invalid tag ${undefined}`,
					path: [],
					propertyType: `{
  tag: 'c',
  bool: boolean,
  [*]: *
} | {
  tag: 'd',
  obj: * (isObject),
  [*]: *
}`,
				}]

				it('Should be rejected', () => {
					isCDByMap(validated, rejections)

					expect(rejections.asArray()).to.deep.equal(expected)
				})
			})

			describe('While using combined spec', () => {
				const rejections = createRejectionsCollector()

				// We assume the expected result is a single element tuple, as `taggedUnionOf` suppose to
				// never emit more than one rejection on its own (not emerging from deeper validations)
				const expected: [ValidationRejection] = [{
					reason: rejectionMessage`Value ${validated} has an invalid tag ${undefined}`,
					path: [],
					propertyType: `{
  tag: 'a',
  string: string,
  [*]: *
} | {
  tag: 'b',
  num: number,
  [*]: *
} | {
  tag: 'c',
  bool: boolean,
  [*]: *
} | {
  tag: 'd',
  obj: * (isObject),
  [*]: *
}`,
				}]

				it('Should be rejected', () => {
					isABCDCombined(validated, rejections)

					expect(rejections.asArray()).to.deep.equal(expected)
				})
			})

			describe('While using transformed validation', () => {
				const rejections = createRejectionsCollector()

				// We assume the expected result is a single element tuple, as `taggedUnionOf` suppose to
				// never emit more than one rejection on its own (not emerging from deeper validations)
				const expected: [ValidationRejection] = [{
					reason: rejectionMessage`Value ${validated} has an invalid tag ${undefined}`,
					path: [],
					propertyType: `{
  tag: 'a',
  string: string,
  [*]: *
} | {
  tag: 'b',
  num: number,
  [*]: *
} | {
  tag: 'c',
  bool: boolean,
  [*]: *
} | {
  tag: 'd',
  obj: * (isObject),
  [*]: *
}`,
				}]

				it('Should be rejected', () => {
					isABCDTransformed(validated, rejections)

					expect(rejections.asArray()).to.deep.equal(expected)
				})
			})
		})

		describe('And the validated value has unknown tag', () => {
			const validated = {
				tag: 'e',
				string: 'abc',
			}

			describe('While using object spec', () => {
				const rejections = createRejectionsCollector()

				// We assume the expected result is a single element tuple, as `taggedUnionOf` suppose to
				// never emit more than one rejection on its own (not emerging from deeper validations)
				const expected: [ValidationRejection] = [{
					reason: rejectionMessage`Value ${validated} has an invalid tag ${'e'}`,
					path: [],
					propertyType: `{
  tag: 'a',
  string: string,
  [*]: *
} | {
  tag: 'b',
  num: number,
  [*]: *
}`,
				}]

				it('Should be rejected', () => {
					isABByObj(validated, rejections)

					expect(rejections.asArray()).to.deep.equal(expected)
				})
			})

			describe('While using map spec', () => {
				const rejections = createRejectionsCollector()

				// We assume the expected result is a single element tuple, as `taggedUnionOf` suppose to
				// never emit more than one rejection on its own (not emerging from deeper validations)
				const expected: [ValidationRejection] = [{
					reason: rejectionMessage`Value ${validated} has an invalid tag ${'e'}`,
					path: [],
					propertyType: `{
  tag: 'c',
  bool: boolean,
  [*]: *
} | {
  tag: 'd',
  obj: * (isObject),
  [*]: *
}`,
				}]

				it('Should be rejected', () => {
					isCDByMap(validated, rejections)

					expect(rejections.asArray()).to.deep.equal(expected)
				})
			})

			describe('While using combined spec', () => {
				const rejections = createRejectionsCollector()

				// We assume the expected result is a single element tuple, as `taggedUnionOf` suppose to
				// never emit more than one rejection on its own (not emerging from deeper validations)
				const expected: [ValidationRejection] = [{
					reason: rejectionMessage`Value ${validated} has an invalid tag ${'e'}`,
					path: [],
					propertyType: `{
  tag: 'a',
  string: string,
  [*]: *
} | {
  tag: 'b',
  num: number,
  [*]: *
} | {
  tag: 'c',
  bool: boolean,
  [*]: *
} | {
  tag: 'd',
  obj: * (isObject),
  [*]: *
}`,
				}]

				it('Should be rejected', () => {
					isABCDCombined(validated, rejections)

					expect(rejections.asArray()).to.deep.equal(expected)
				})
			})

			describe('While using transformed validation', () => {
				const rejections = createRejectionsCollector()

				// We assume the expected result is a single element tuple, as `taggedUnionOf` suppose to
				// never emit more than one rejection on its own (not emerging from deeper validations)
				const expected: [ValidationRejection] = [{
					reason: rejectionMessage`Value ${validated} has an invalid tag ${'e'}`,
					path: [],
					propertyType: `{
  tag: 'a',
  string: string,
  [*]: *
} | {
  tag: 'b',
  num: number,
  [*]: *
} | {
  tag: 'c',
  bool: boolean,
  [*]: *
} | {
  tag: 'd',
  obj: * (isObject),
  [*]: *
}`,
				}]

				it('Should be rejected', () => {
					isABCDTransformed(validated, rejections)

					expect(rejections.asArray()).to.deep.equal(expected)
				})
			})
		})

		describe('And the validated value has a known tag with a valid shape', () => {
			const abValidated = {
				tag: 'b',
				string: 'abc',
			}
			const cdValidated = {
				tag: 'c',
				obj: { myObj: true },
			}
			// We assume the expected result is a single element tuple, as `taggedUnionOf` suppose to
			// never emit more than one rejection on its own (not emerging from deeper validations)
			const abExpected: [ValidationRejection] = [{
				reason: rejectionMessage`Validation for tag ${'b'} failed:
Value ${undefined} is not a number`,
				path: ['num'],
				propertyType: 'number',
			}]
			const cdExpected: [ValidationRejection] = [{
				reason: rejectionMessage`Validation for tag ${'c'} failed:
Value ${undefined} is not a boolean`,
				path: ['bool'],
				propertyType: 'boolean',
			}]

			describe('While using object spec', () => {
				const rejections = createRejectionsCollector()

				it('Should be rejected', () => {
					isABByObj(abValidated, rejections)

					expect(rejections.asArray()).to.deep.equal(abExpected)
				})
			})

			describe('While using map spec', () => {
				const rejections = createRejectionsCollector()

				it('Should be rejected', () => {
					isCDByMap(cdValidated, rejections)

					expect(rejections.asArray()).to.deep.equal(cdExpected)
				})
			})

			describe('While using combined spec', () => {
				const abRejections = createRejectionsCollector()
				const cdRejections = createRejectionsCollector()

				it('Should be rejected', () => {
					isABCDCombined(abValidated, abRejections)
					isABCDCombined(cdValidated, cdRejections)

					expect(abRejections.asArray()).to.deep.equal(abExpected)
					expect(cdRejections.asArray()).to.deep.equal(cdExpected)
				})
			})

			describe('While using transformed validation', () => {
				const abRejections = createRejectionsCollector()
				const cdRejections = createRejectionsCollector()

				it('Should be rejected', () => {
					isABCDTransformed(abValidated, abRejections)
					isABCDTransformed(cdValidated, cdRejections)

					expect(abRejections.asArray()).to.deep.equal(abExpected)
					expect(cdRejections.asArray()).to.deep.equal(cdExpected)
				})
			})
		})

		describe('And the validated value has a known tag and valid shape', () => {
			const abValidated = {
				tag: 'a',
				string: 'abc',
			}
			const cdValidated = {
				tag: 'd',
				obj: { myObj: true },
			}
			// We assume the expected result is an empty array
			const expected: readonly [] = []

			describe('While using object spec', () => {
				const rejections = createRejectionsCollector()

				it('Should be rejected', () => {
					isABByObj(abValidated, rejections)

					expect(rejections.asArray()).to.deep.equal(expected)
				})
			})

			describe('While using map spec', () => {
				const rejections = createRejectionsCollector()

				it('Should be rejected', () => {
					isCDByMap(cdValidated, rejections)

					expect(rejections.asArray()).to.deep.equal(expected)
				})
			})

			describe('While using combined spec', () => {
				const abRejections = createRejectionsCollector()
				const cdRejections = createRejectionsCollector()

				it('Should be rejected', () => {
					isABCDCombined(abValidated, abRejections)
					isABCDCombined(cdValidated, cdRejections)

					expect(abRejections.asArray()).to.deep.equal(expected)
					expect(cdRejections.asArray()).to.deep.equal(expected)
				})
			})

			describe('While using transformed validation', () => {
				const abRejections = createRejectionsCollector()
				const cdRejections = createRejectionsCollector()

				it('Should be rejected', () => {
					isABCDTransformed(abValidated, abRejections)
					isABCDTransformed(cdValidated, cdRejections)

					expect(abRejections.asArray()).to.deep.equal(expected)
					expect(cdRejections.asArray()).to.deep.equal(expected)
				})
			})
		})
	})
})
