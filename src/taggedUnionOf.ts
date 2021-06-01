import { anyOfType } from './anyOf'
import {
  AnyTypeValidation,
  isObject,
  NotEmptyArray,
  TypeValidation
  } from './Common'
import {
  asRejectingValidator,
  createRejection,
  registerRejectingValidator,
  rejectionMessage
  } from './RejectionReasons'
import { from } from '@reactivex/ix-es2015-cjs/iterable/from'
import { flatMap } from '@reactivex/ix-es2015-cjs/iterable/operators/flatmap'
import { map } from '@reactivex/ix-es2015-cjs/iterable/operators/map'

export type TaggedUnion<TKey extends string, TTags> = {
  [k in TKey]: TTags
}

export type TaggedUnionSpecMap<
  TKey extends string,
  TTag,
  TUnion extends TaggedUnion<TKey, TTag>
  > = Map<TTag, AnyTypeValidation<TUnion>>
export type TaggedUnionSpecObject<
  TKey extends string,
  TTag extends keyof any,
  TUnion extends TaggedUnion<TKey, TTag>
  > = {
    [K in TTag]: AnyTypeValidation<TUnion>
  }

export type TaggedUnionSpec<
  TKey extends string,
  TTag extends keyof any,
  TUnion extends TaggedUnion<TKey, TTag>
  > =
  | TaggedUnionSpecMap<TKey, TTag, TUnion>
  | TaggedUnionSpecObject<TKey, TTag, TUnion>

export type MapOrObjectSpec<
  TKey extends string,
  TTag,
  TUnion extends TaggedUnion<TKey, TTag>
  > = TTag extends keyof any
  ? TaggedUnionSpec<TKey, TTag, TUnion>
  : TaggedUnionSpecMap<TKey, TTag, TUnion>

export default function taggedUnionOf<
  TKey extends string,
  TTag,
  TUnion extends TaggedUnion<TKey, TTag>
>(
  tagKey: TKey,
  ...specs: NotEmptyArray<MapOrObjectSpec<TKey, TTag, TUnion>>
): TypeValidation<TUnion> {
  const specMap = specAsMap(specs)
  const type = anyOfType([...specMap.values()])

  const result = registerRejectingValidator(
    (val, rejections): val is TUnion => {
      if (!isObject(val)) {
        rejections?.(createRejection(
          rejectionMessage`Value ${val} is not an object`,
          type
        ))

        return false
      }

      const tag = val[tagKey]

      if (!specMap.has(tag as any)) {
        rejections?.(createRejection(
          rejectionMessage`Value ${val} has an invalid tag ${tag}`,
          type
        ))

        return false
      }

      const validation = specMap.get(tag as any)!

      return validation(val, rejections)
    },
    type
  ) as TaggedUnionValidation<TKey, TTag, TUnion>

  result.unionSpec = () => specMap

  return result
}

type ResolvedTaggedUnionSpecMap<
  TKey extends string,
  TTag,
  TUnion extends TaggedUnion<TKey, TTag>
  > = Map<TTag, TypeValidation<TUnion>>

function specAsMap<
  TKey extends string,
  TTag,
  TUnion extends TaggedUnion<TKey, TTag>
>(
  specs: NotEmptyArray<MapOrObjectSpec<TKey, TTag, TUnion>>
): ResolvedTaggedUnionSpecMap<TKey, TTag, TUnion> {
  return new Map(from(specs).pipe(
    flatMap(singleSpecEntries)
  ))

  function singleSpecEntries(
    spec: MapOrObjectSpec<TKey, TTag, TUnion>
  ): Iterable<[TTag, TypeValidation<TUnion>]> {
    return from((spec instanceof Map
      ? spec.entries()
      : Object.entries(spec)) as Iterable<[TTag, AnyTypeValidation<TUnion>]>).pipe(
        map(([tag, validation]) => [tag, asRejectingValidator(validation)])
      )
  }
}

export interface TaggedUnionValidation<
  TKey extends string,
  TTag,
  TUnion extends TaggedUnion<TKey, TTag>
  > extends TypeValidation<TUnion> {
  unionSpec(): TaggedUnionSpecMap<TKey, TTag, TUnion>
}
