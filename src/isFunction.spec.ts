import isFunction from './isFunction'
import { typeValidatorType } from './RejectionReasons'
import { invalidPrimitives, primitivesChecks } from './TypeValidations.spec'
import { from } from '@reactivex/ix-es2015-cjs/iterable/from'
import { map } from '@reactivex/ix-es2015-cjs/iterable/operators/map'
import { assert, expect } from 'chai'
import sinon from 'sinon'

function assertThrow(fn: () => any, message = 'Expected function to throw') {
  let didThrow = false
  try {
    fn()
  }
  catch {
    didThrow = true
  }

  if (!didThrow) {
    assert.fail('Function returned', 'Function throws', 'Expected function to throw')
  }
}

describe('isFunction type-validation', () => {

  const isFunctionTest = isFunction()
  const argsFuncTests = Array.from({ length: 5 }, (_, i) => isFunction(i + 1))

  const func = () => { }
  const funcs = [
    (arg: any) => { },
    (arg1: any, arg2: any) => { },
    (arg1: any, arg2: any, arg3: any) => { },
    (arg1: any, arg2: any, arg3: any, arg4: any) => { },
    (arg1: any, arg2: any, arg3: any, arg4: any, arg5: any) => { },
  ]

  it('Should fail for validator creation with negative or non integer number', () => {
    assertThrow(() => isFunction(-1))
    assertThrow(() => isFunction(NaN))
    assertThrow(() => isFunction(Infinity))
    assertThrow(() => isFunction(1.2))
  })

  describe('When no reasons are expected', () => {
    it('Should validate only values of the correct type', () => {
      expect(isFunctionTest(func)).to.be.true
      argsFuncTests.forEach((validator, index) => {
        expect(
          validator(func),
          `Failed validation for validator arity 0 with func arity ${index + 1}`
        ).to.be.false
      })
      expect(argsFuncTests.some(validator => validator(func))).to.be.false

      argsFuncTests.forEach((validator, validatorIndex) => {
        expect(
          validator(func),
          `Failed validation for validator arity ${validatorIndex + 1} with func arity 0`
        ).to.be.false

        funcs.forEach((func, funcIndex) => {
          expect(
            validator(func),
            `Failed validation for validator arity ${validatorIndex + 1} with func arity ${funcIndex + 1}`
          ).to.be.equal(validatorIndex === funcIndex)
        })
      })

      primitivesChecks(isFunctionTest, invalidPrimitives)
      argsFuncTests.forEach(isFuncValidator => primitivesChecks(isFuncValidator, invalidPrimitives))
    })
  })

  describe('When reasons are expected', () => {
    const callback = sinon.spy()

    beforeEach(() => {
      callback.resetHistory()
    })

    const allValidators = [
      isFunctionTest,
      ...argsFuncTests,
    ]
    const allFuncs = [
      func,
      ...funcs,
    ]

    describe('When validator has type', () => {
      it('Should have the correct type', () => {
        expect(isFunctionTest[typeValidatorType]).to.equal(`(...args) => *`)
          ;
        [
          isFunction(0),
          ...argsFuncTests,
          isFunction(6),
        ].forEach((validator, index) => {
          expect(validator[typeValidatorType]).to.equal(
            `(${funcArgsType(index)}) => *`,
            `Invalid validator type by `
          )
        })

        function funcArgsType(count: number) {
          if (count === 1) {
            return 'arg'
          }

          const allArgs = Array.from({ length: count }, (_, i) => `arg${i + 1}`)
          const args = allArgs.length <= 5
            ? allArgs
            : [
              ...allArgs.slice(0, 2),
              '...',
              ...allArgs.slice(allArgs.length - 2, allArgs.length),
            ]

          return args.join(', ')
        }
      })
    })

    describe('When value validates successfully', () => {
      it('Should not call callback', () => {
        from(allValidators)
          .pipe(
            map((validator, arity) => ({ validator, func: allFuncs[arity] }))
          )
          .forEach(({ validator, func }) => {
            callback.resetHistory()
            validator(func, callback)

            expect(callback.callCount).to.equal(0)
          })
      })
    })

    describe('When value fails validation', () => {
      it('Should call callback once', () => {
        allValidators.forEach(validation => {
          callback.resetHistory()
          validation(0, callback)

          expect(callback.callCount).to.be.equal(1)
        })
      })

      it('Should set correct type for validations', () => {
        allValidators.forEach(validation => {
          callback.resetHistory()
          validation(0, callback)

          expect(callback.args[0][0].propertyType).to.be.equal(validation[typeValidatorType])
        })
      })
    })
  })
})
