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
  literal,
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
  TUnion extends TaggedUnion<TKey, TTag>,
  TKey extends string,
  TTag,
  > = Map<TTag, AnyTypeValidation<TUnion>>
export type TaggedUnionSpecObject<
  TUnion extends TaggedUnion<TKey, TTag>,
  TKey extends string,
  TTag extends keyof any,
  > = {
    [K in TTag]: AnyTypeValidation<TUnion>
  }

export type TaggedUnionSpec<
  TUnion extends TaggedUnion<TKey, TTag>,
  TKey extends string,
  TTag extends keyof any,
  > =
  | TaggedUnionSpecMap<TUnion, TKey, TTag>
  | TaggedUnionSpecObject<TUnion, TKey, TTag>

export type MapOrObjectSpec<
  TUnion extends TaggedUnion<TKey, TTag>,
  TKey extends string,
  TTag,
  > = TTag extends keyof any
  ? TaggedUnionSpec<TUnion, TKey, TTag>
  : TaggedUnionSpecMap<TUnion, TKey, TTag>

export type SpecUnion<T> = T extends TaggedUnionSpec<infer TUnion, any, any>
  ? TUnion
  : never
export type SpecTags<T> = T extends TaggedUnionSpec<any, any, infer TTag>
  ? TTag
  : never

export type CombinedUnions<T> = T extends TaggedUnionSpec<any, any, any>[]
  ? (T extends [infer TFirst, ...infer TRest]
    ? SpecUnion<TFirst> | CombinedUnions<TRest>
    : never)
  : never

export type CombinedTags<T> = T extends TaggedUnionSpec<any, any, any>[]
  ? (T extends [infer TFirst, ...infer TRest]
    ? SpecTags<TFirst> | CombinedTags<TRest>
    : never)
  : never

export function taggedUnionOf<
  TKey extends string,
  TSpecs extends NotEmptyArray<TaggedUnionSpec<any, TKey, keyof any>>
>(
  tagKey: TKey,
  ...specs: TSpecs
): TaggedUnionValidation<CombinedUnions<TSpecs>, TKey, CombinedTags<TSpecs>>
export function taggedUnionOf<
  TKey extends string,
  TSpecs extends NotEmptyArray<TaggedUnionSpecMap<any, TKey, keyof any>>,
  >(
    tagKey: TKey,
    ...specs: TSpecs
  ): TaggedUnionValidation<CombinedUnions<TSpecs>, TKey, CombinedTags<TSpecs>>
export function taggedUnionOf<
  TUnion extends TaggedUnion<TKey, TTag>,
  TKey extends string,
  TTag extends keyof any,
  >(
    tagKey: TKey,
    ...specs: NotEmptyArray<TaggedUnionSpec<TUnion, TKey, TTag>>
  ): TaggedUnionValidation<TUnion, TKey, TTag>
export function taggedUnionOf<
  TUnion extends TaggedUnion<TKey, TTag>,
  TKey extends string,
  TTag,
  >(
    tagKey: TKey,
    ...specs: NotEmptyArray<TaggedUnionSpecMap<TUnion, TKey, TTag>>
  ): TaggedUnionValidation<TUnion, TKey, TTag>
export function taggedUnionOf<
  TUnion extends TaggedUnion<TKey, TTag>,
  TKey extends string,
  TTag,
  >(
    tagKey: TKey,
    ...specs: NotEmptyArray<MapOrObjectSpec<TUnion, TKey, TTag>>
  ): TaggedUnionValidation<TUnion, TKey, TTag> {
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

      return validation(val, rejections && (({ reason, ...data }) => rejections({
        ...data,
        reason: rejectionMessage`Validation for tag ${tag} failed:
${literal(reason)}`
      })))
    },
    type
  ) as TaggedUnionValidation<TUnion, TKey, TTag>

  result.unionSpec = () => specMap

  return result
}

export default taggedUnionOf

type ResolvedTaggedUnionSpecMap<
  TUnion extends TaggedUnion<TKey, TTag>,
  TKey extends string,
  TTag,
  > = Map<TTag, TypeValidation<TUnion>>

function specAsMap<
  TUnion extends TaggedUnion<TKey, TTag>,
  TKey extends string,
  TTag,
  >(
    specs: NotEmptyArray<MapOrObjectSpec<TUnion, TKey, TTag>>
  ): ResolvedTaggedUnionSpecMap<TUnion, TKey, TTag> {
  return new Map(from(specs).pipe(
    flatMap(singleSpecEntries)
  ))

  function singleSpecEntries(
    spec: MapOrObjectSpec<TUnion, TKey, TTag>
  ): Iterable<[TTag, TypeValidation<TUnion>]> {
    return from((spec instanceof Map
      ? spec.entries()
      : Object.entries(spec)) as Iterable<[TTag, AnyTypeValidation<TUnion>]>).pipe(
        map(([tag, validation]) => [tag, asRejectingValidator(validation)])
      )
  }
}

export interface TaggedUnionValidation<
  TUnion extends TaggedUnion<TKey, TTag>,
  TKey extends string,
  TTag,
  > extends TypeValidation<TUnion> {
  unionSpec(): TaggedUnionSpecMap<TUnion, TKey, TTag>
}
