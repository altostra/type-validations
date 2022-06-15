import { expect } from 'chai'
import anyOf from './anyOf'
import { number, string } from './primitives'
import recordOf from './recordOf'
import type { ValidationRejection } from './RejectionReasons'
import type { WithRecursionOptions } from './withRecursion'
import { withRecursion } from './withRecursion'

describe('With recursion type-validation', () => {
	describe('And options are invalid', () => {
		describe('because of non-numeric key', () => {
			it('Should throw on `maxDepth`', () => {
				expect(() => withRecursion(() => () => true, { maxDepth: '20' as any })).to.throw
			})

			it('Should throw on `skipDepth`', () => {
				expect(() => withRecursion(() => () => true, { skipDepth: true as any })).to.throw
			})
		})

		describe('because of negative key', () => {
			it('Should throw on `maxDepth`', () => {
				expect(() => withRecursion(() => () => true, { maxDepth: -5 })).to.throw
			})

			it('Should throw on `skipDepth`', () => {
				expect(() => withRecursion(() => () => true, { skipDepth: -3 })).to.throw
			})
		})

		describe('because of non-integral key', () => {
			it('Should throw on `maxDepth`', () => {
				expect(() => withRecursion(() => () => true, { maxDepth: 1.5 })).to.throw
			})

			it('Should throw on `skipDepth`', () => {
				expect(() => withRecursion(() => () => true, { skipDepth: 3.8 })).to.throw
			})
		})

		describe('because of max depth is defined with skip', () => {
			it('Should throw on non-global depth', () => {
				expect(() => withRecursion(() => () => true, {
					maxDepth: 20 as any,
					skipDepth: 10,
				})).to.throw
			})
		})
	})

	describe('And options are valid', () => {
		describe('And having only one recursive validation run at a time', () => {
			interface Recursive {
				[key: string]: Recursive | string
			}

			const depth1: Recursive = {
				key: 'string',
			}
			const depth3: Recursive = {
				key1: {
					key2: {
						key3: 'string',
					},
				},
			}
			const invalid1 = {
				key: 5,
			}
			const invalid3 = {
				key1: {
					key2: {
						key3: 5,
					},
				},
			}

			function getValidation(options?: WithRecursionOptions) {
				return withRecursion<Recursive>(
					recursedType => recordOf(anyOf(string, recursedType)),
					options,
				)
			}

			describe('with no depth limitation', () => {
				const isRecursive = getValidation()

				it('Should validate valid values', () => {
					expect(isRecursive(depth1), 'depth1').to.be.true
					expect(isRecursive(depth3), 'depth3').to.be.true
				})

				it('Should reject invalid values', () => {
					const rejections1: ValidationRejection[] = []
					const rejections3: ValidationRejection[] = []

					expect(isRecursive(invalid1, rej => rejections1.push(rej)), 'depth1').to.be.false
					expect(rejections1).to.deep.equal([{
						path: ['key'],
						propertyType: 'string',
						reason: 'Value <5> is not a string',
					}, {
						path: ['key'],
						propertyType: '{ [*]: string | ↻(Recursive) }',
						reason: 'Value <5> is not an object',
					}])

					expect(isRecursive(invalid3, rej => rejections3.push(rej)), 'depth3').to.be.false
					expect(rejections3).to.deep.equal([{
						path: [
							'key3',
							'key2',
							'key1',
						],
						propertyType: 'string',
						reason: 'Value <5> is not a string',
					},
					{
						path: [
							'key3',
							'key2',
							'key1',
						],
						propertyType: '{ [*]: string | ↻(Recursive) }',
						reason: 'Value <5> is not an object',
					},
					{
						path: [
							'key2',
							'key1',
						],
						propertyType: 'string',
						reason: 'Value <{ key3: 5 }> is not a string',
					},
					{
						path: [
							'key1',
						],
						propertyType: 'string',
						reason: 'Value <{ key2: { key3: 5 } }> is not a string',
					}])
				})
			})

			describe('when skipping at depth of 2', () => {
				const isRecursive = getValidation({ skipDepth: 2 })

				it('Should validate valid values', () => {
					expect(isRecursive(depth1), 'depth1').to.be.true
					expect(isRecursive(depth3), 'depth3').to.be.true
				})

				it('Should accept a deep value regardless of validity', () => {
					expect(isRecursive(depth3), 'depth3').to.be.true
					expect(isRecursive(invalid3), 'invalid3').to.be.true
				})

				it('Should reject invalid values', () => {
					const rejections1: ValidationRejection[] = []

					expect(isRecursive(invalid1, rej => rejections1.push(rej)), 'depth1').to.be.false
					expect(rejections1).to.deep.equal([{
						path: ['key'],
						propertyType: 'string',
						reason: 'Value <5> is not a string',
					}, {
						path: ['key'],
						propertyType: '{ [*]: string | ↻(Recursive) }',
						reason: 'Value <5> is not an object',
					}])
				})
			})

			describe('when rejecting at depth of 2', () => {
				const isRecursive = getValidation({ maxDepth: 2 })

				it('Should validate valid values', () => {
					expect(isRecursive(depth1), 'depth1').to.be.true
				})

				it('Should reject a deep value regardless of validity', () => {
					const invalidRejections: ValidationRejection[] = []
					expect(isRecursive(invalid3, rej => invalidRejections.push(rej)), 'invalid3').to.be.false
					expect(invalidRejections).to.deep.equal([{
						path: [
							'key2',
							'key1',
						],
						propertyType: 'string',
						reason: 'Value <{ key3: 5 }> is not a string',
					},
					{
						path: [
							'key2',
							'key1',
						],
						propertyType: '↻({ [*]: string | ↻(Recursive) })',
						reason: 'Recursion max depth has reached at 2',
					},
					{
						path: [
							'key1',
						],
						propertyType: 'string',
						reason: 'Value <{ key2: { key3: 5 } }> is not a string',
					}])

					const validRejections: ValidationRejection[] = []
					expect(isRecursive(depth3, rej => validRejections.push(rej)), 'depth3').to.be.false
					expect(validRejections).to.deep.equal([{
						path: [
							'key2',
							'key1',
						],
						propertyType: 'string',
						reason: "Value <{ key3: 'string' }> is not a string",
					},
					{
						path: [
							'key2',
							'key1',
						],
						propertyType: '↻({ [*]: string | ↻(Recursive) })',
						reason: 'Recursion max depth has reached at 2',
					},
					{
						path: [
							'key1',
						],
						propertyType: 'string',
						reason: "Value <{ key2: { key3: 'string' } }> is not a string",
					}])
				})

				it('Should reject invalid values', () => {
					const rejections1: ValidationRejection[] = []

					expect(isRecursive(invalid1, rej => rejections1.push(rej)), 'depth1').to.be.false
					expect(rejections1).to.deep.equal([{
						path: ['key'],
						propertyType: 'string',
						reason: 'Value <5> is not a string',
					}, {
						path: ['key'],
						propertyType: '{ [*]: string | ↻(Recursive) }',
						reason: 'Value <5> is not an object',
					}])
				})
			})
		})

		describe('And having more than one recursive validation run at a time', () => {
			interface RecursiveA {
				[key: string]: RecursiveB | string
			}

			interface RecursiveB {
				[key: string]: RecursiveA | number
			}

			const depth1: RecursiveA = {
				key: 'string',
			}
			const depth3: RecursiveA = {
				key1: 'string',
				b1: {
					key1: 5,
					a2: {
						key2: 'string',
						b2: {
							key2: 2,
							a3: {
								key3: 'string',
								b3: {
									key3: 3,
								},
							},
						},
					},
				},
			}

			const invalid1 = {
				key: 5,
			}
			const invalid3 = {
				key1: 'string',
				b1: {
					key1: 5,
					a2: {
						key2: 'string',
						b2: {
							key2: 2,
							a3: {
								key3: 3,
								b3: {
									key3: 3,
								},
							},
						},
					},
				},
			}

			function getValidation(options?: WithRecursionOptions) {
				return withRecursion<RecursiveA>(
					recursedA => recordOf(anyOf(string,
						withRecursion<RecursiveB>(() => recordOf(anyOf(number, recursedA)), options),
					)),
					options,
				)
			}

			describe('with no depth limitation', () => {
				const isRecursive = getValidation()

				it('Should validate valid values', () => {
					expect(isRecursive(depth1), 'depth1').to.be.true
					expect(isRecursive(depth3), 'depth3').to.be.true
				})

				it('Should reject invalid values', () => {
					const rejections1: ValidationRejection[] = []
					const rejections3: ValidationRejection[] = []

					expect(isRecursive(invalid1, rej => rejections1.push(rej)), 'depth1').to.be.false
					expect(rejections1).to.deep.equal([{
						path: [
							'key',
						],
						propertyType: 'string',
						reason: 'Value <5> is not a string',
					},
					{
						path: [
							'key',
						],
						propertyType: '{ [*]: number | ↻(Recursive) }',
						reason: 'Value <5> is not an object',
					}])

					expect(isRecursive(invalid3, rej => rejections3.push(rej)), 'depth3').to.be.false
					expect(rejections3).to.deep.equal([{
						path: [
							'key3',
							'a3',
							'b2',
							'a2',
							'b1',
						],
						propertyType: 'string',
						reason: 'Value <3> is not a string',
					},
					{
						path: [
							'key3',
							'a3',
							'b2',
							'a2',
							'b1',
						],
						propertyType: '{ [*]: number | ↻(Recursive) }',
						reason: 'Value <3> is not an object',
					},
					{
						path: [
							'a3',
							'b2',
							'a2',
							'b1',
						],
						propertyType: 'number',
						reason: 'Value <{ key3: 3, b3: { key3: 3 } }> is not a number',
					},
					{
						path: [
							'b2',
							'a2',
							'b1',
						],
						propertyType: 'string',
						reason: 'Value <{ key2: 2, a3: { key3: 3, b3: [Object] } }> is not a string',
					},
					{
						path: [
							'a2',
							'b1',
						],
						propertyType: 'number',
						reason: "Value <{ key2: 'string', b2: { key2: 2, a3: [Object] } }> is not a number",
					},
					{
						path: [
							'b1',
						],
						propertyType: 'string',
						reason: "Value <{ key1: 5, a2: { key2: 'string', b2: [Object] } }> is not a string",
					}])
				})
			})

			describe('when skipping at depth of 2', () => {
				const isRecursive = getValidation({ skipDepth: 2 })

				it('Should validate valid values', () => {
					expect(isRecursive(depth1), 'depth1').to.be.true
					expect(isRecursive(depth3), 'depth3').to.be.true
				})

				it('Should accept a deep value regardless of validity', () => {
					expect(isRecursive(depth3), 'depth3').to.be.true
					expect(isRecursive(invalid3), 'invalid3').to.be.true
				})

				it('Should reject invalid values', () => {
					const rejections1: ValidationRejection[] = []

					expect(isRecursive(invalid1, rej => rejections1.push(rej)), 'depth1').to.be.false
					expect(rejections1).to.deep.equal([{
						path: [
							'key',
						],
						propertyType: 'string',
						reason: 'Value <5> is not a string',
					},
					{
						path: [
							'key',
						],
						propertyType: '{ [*]: number | ↻(Recursive) }',
						reason: 'Value <5> is not an object',
					}])
				})
			})

			describe('when rejecting at depth of 2', () => {
				const isRecursive = getValidation({ maxDepth: 2 })

				it('Should validate valid values', () => {
					expect(isRecursive(depth1), 'depth1').to.be.true
				})

				it('Should reject a deep value regardless of validity', () => {
					const invalidRejections: ValidationRejection[] = []
					expect(isRecursive(invalid3, rej => invalidRejections.push(rej)), 'invalid3').to.be.false
					expect(invalidRejections).to.deep.equal([{
						path: [
							'a3',
							'b2',
							'a2',
							'b1',
						],
						propertyType: 'number',
						reason: 'Value <{ key3: 3, b3: { key3: 3 } }> is not a number',
					},
					{
						path: [
							'a3',
							'b2',
							'a2',
							'b1',
						],
						propertyType: '↻({ [*]: string | { [*]: number | ↻(Recursive) } })',
						reason: 'Recursion max depth has reached at 2',
					},
					{
						path: [
							'b2',
							'a2',
							'b1',
						],
						propertyType: 'string',
						reason: 'Value <{ key2: 2, a3: { key3: 3, b3: [Object] } }> is not a string',
					},
					{
						path: [
							'a2',
							'b1',
						],
						propertyType: 'number',
						reason: "Value <{ key2: 'string', b2: { key2: 2, a3: [Object] } }> is not a number",
					},
					{
						path: [
							'b1',
						],
						propertyType: 'string',
						reason: "Value <{ key1: 5, a2: { key2: 'string', b2: [Object] } }> is not a string",
					}])

					const validRejections: ValidationRejection[] = []
					expect(isRecursive(depth3, rej => validRejections.push(rej)), 'depth3').to.be.false
					expect(validRejections).to.deep.equal([{
						path: [
							'a3',
							'b2',
							'a2',
							'b1',
						],
						propertyType: 'number',
						reason: "Value <{ key3: 'string', b3: { key3: 3 } }> is not a number",
					},
					{
						path: [
							'a3',
							'b2',
							'a2',
							'b1',
						],
						propertyType: '↻({ [*]: string | { [*]: number | ↻(Recursive) } })',
						reason: 'Recursion max depth has reached at 2',
					},
					{
						path: [
							'b2',
							'a2',
							'b1',
						],
						propertyType: 'string',
						reason: "Value <{ key2: 2, a3: { key3: 'string', b3: [Object] } }> is not a string",
					},
					{
						path: [
							'a2',
							'b1',
						],
						propertyType: 'number',
						reason: "Value <{ key2: 'string', b2: { key2: 2, a3: [Object] } }> is not a number",
					},
					{
						path: [
							'b1',
						],
						propertyType: 'string',
						reason: "Value <{ key1: 5, a2: { key2: 'string', b2: [Object] } }> is not a string",
					}])
				})

				it('Should reject invalid values', () => {
					const rejections1: ValidationRejection[] = []

					expect(isRecursive(invalid1, rej => rejections1.push(rej)), 'depth1').to.be.false
					expect(rejections1).to.deep.equal([{
						path: [
							'key',
						],
						propertyType: 'string',
						reason: 'Value <5> is not a string',
					},
					{
						path: [
							'key',
						],
						propertyType: '{ [*]: number | ↻(Recursive) }',
						reason: 'Value <5> is not an object',
					}])
				})
			})
		})
	})
})
