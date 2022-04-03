import anyOf from './anyOf'
import { any, number, string } from './primitives'
import recordOf from './recordOf'
import { ValidationRejection } from './RejectionReasons'
import { withRecursion, WithRecursionOptions } from './withRecusion'
import { expect } from 'chai'

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
        [key: string]: string | Recursive
      }


      const depth1: Recursive = {
        key: 'string',
      }
      const depth3: Recursive = {
        key1: {
          key2: {
            key3: 'string',
          }
        }
      }
      const invalid1 = {
        key: 5,
      }
      const invalid3 = {
        key1: {
          key2: {
            key3: 5,
          }
        }
      }

      function getValidation(options?: WithRecursionOptions) {
        return withRecursion<Recursive>(
          recursedType => recordOf(anyOf(string, recursedType)),
          options
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
          }])

          expect(isRecursive(invalid3, rej => rejections3.push(rej)), 'depth3').to.be.false
          expect(rejections3).to.deep.equal([{
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
          expect(isRecursive(invalid3), 'depth3').to.be.true
        })

        it('Should reject invalid values', () => {
          const rejections1: ValidationRejection[] = []

          expect(isRecursive(invalid1, rej => rejections1.push(rej)), 'depth1').to.be.false
          expect(rejections1).to.deep.equal([{
          }])
        })
      })

      describe('when rejecting at depth of 2', () => {
        const isRecursive = getValidation({ maxDepth: 2 })

        it('Should validate valid values', () => {
          expect(isRecursive(depth1), 'depth1').to.be.true
        })

        it('Should reject a deep value regardless of validity', () => {
          const rejections: ValidationRejection[] = []
          expect(isRecursive(invalid3, rej => rejections.push(rej)), 'depth3').to.be.false
          expect(rejections).to.deep.equal([{
          }])
        })

        it('Should reject invalid values', () => {
          const rejections1: ValidationRejection[] = []

          expect(isRecursive(invalid1, rej => rejections1.push(rej)), 'depth1').to.be.false
          expect(rejections1).to.deep.equal([{
          }])
        })
      })
    })

    describe('And having more than one recursive validation run at a time', () => {
      interface RecursiveA {
        [key: string]: string | RecursiveB
      }
      interface RecursiveB {
        [key: string]: number | RecursiveA
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
                }
              }
            }
          }
        }
      }

      const invalid1 = {
        key: 5
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
                }
              }
            }
          }
        }
      }

      function getValidation(options?: WithRecursionOptions) {
        return withRecursion<RecursiveA>(
          recursedA => recordOf(anyOf(string,
            withRecursion<RecursiveB>(() => recordOf(anyOf(number, recursedA)), options)
          )),
          options
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
          }])

          expect(isRecursive(invalid3, rej => rejections3.push(rej)), 'depth3').to.be.false
          expect(rejections3).to.deep.equal([{
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
          expect(isRecursive(invalid3), 'depth3').to.be.true
        })

        it('Should reject invalid values', () => {
          const rejections1: ValidationRejection[] = []

          expect(isRecursive(invalid1, rej => rejections1.push(rej)), 'depth1').to.be.false
          expect(rejections1).to.deep.equal([{
          }])
        })
      })

      describe('when rejecting at depth of 2', () => {
        const isRecursive = getValidation({ maxDepth: 2 })

        it('Should validate valid values', () => {
          expect(isRecursive(depth1), 'depth1').to.be.true
        })

        it('Should reject a deep value regardless of validity', () => {
          const rejections: ValidationRejection[] = []
          expect(isRecursive(invalid3, rej => rejections.push(rej)), 'depth3').to.be.false
          expect(rejections).to.deep.equal([{
          }])
        })

        it('Should reject invalid values', () => {
          const rejections1: ValidationRejection[] = []

          expect(isRecursive(invalid1, rej => rejections1.push(rej)), 'depth1').to.be.false
          expect(rejections1).to.deep.equal([{
          }])
        })
      })
    })
  })
})
