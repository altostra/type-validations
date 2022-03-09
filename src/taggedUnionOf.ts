import { anyOfType } from './anyOf'
import {
  AnyTypeValidation,
  isObject,
  NotEmptyArray,
  transformValidation,
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

/**
 * Represents a tagged-union object, which is an object with specific key `TKey`
 * having a specified `TTags` type
 *
 * @param TKey The tag's property name
 * @param TTags The type of tags that may be used in the `TaggedUnion`
 */
export type TaggedUnion<TKey extends string, TTags> = {
  [k in TKey]: TTags
}

/**
 * A tagged-union specification using a `Map`
 * @param TUnion The union type that is defined by the spec
 * @param TKey The tag's property name
 * @param TTag The type of tags that may be used in the `TaggedUnion`
 */
export type TaggedUnionSpecMap<
  TUnion extends TaggedUnion<TKey, TTag>,
  TKey extends string,
  TTag,
  > = Map<TTag, AnyTypeValidation<TUnion>>
/**
 * A tagged-union specification using a simple object.  \
 * Usable only when all the tags are strings.
 * @param TUnion The union type that is defined by the spec
 * @param TKey The tag's property name
 * @param TTag The type of tags that may be used in the `TaggedUnion`
 */
export type TaggedUnionSpecObject<
  TUnion extends TaggedUnion<TKey, TTag>,
  TKey extends string,
  TTag extends keyof any,
  > = {
    [K in TTag]: AnyTypeValidation<TUnion>
  }

/**
 * Tagged union specification
 * @param TUnion The union type that is defined by the spec
 * @param TKey The tag's property name
 * @param TTag The type of tags that may be used in the `TaggedUnion`
 */
export type TaggedUnionSpec<
  TUnion extends TaggedUnion<TKey, TTag>,
  TKey extends string,
  TTag extends keyof any,
  > =
  | TaggedUnionSpecMap<TUnion, TKey, TTag>
  | TaggedUnionSpecObject<TUnion, TKey, TTag>

type MapOrObjectSpec<
  TUnion extends TaggedUnion<TKey, TTag>,
  TKey extends string,
  TTag,
  > = TTag extends keyof any
  ? TaggedUnionSpec<TUnion, TKey, TTag>
  : TaggedUnionSpecMap<TUnion, TKey, TTag>

/**
 * Given a `TaggedUnionSpec` type, extracts the union type described by the spec
 * @param T A `TaggedUnionSpec` type to extract the union from.
 */
export type SpecUnion<T> = T extends TaggedUnionSpec<infer TUnion, any, any>
  ? TUnion
  : never
/**
 * Given a `TaggedUnionSpec` type, extracts the tags type described by the spec
 * @param T A `TaggedUnionSpec` type to extract the tag-type from.
 */
export type SpecTags<T> = T extends TaggedUnionSpec<any, any, infer TTag>
  ? TTag
  : never

/**
 * Gets the combined _tagged union_ type from an array type of specifications
 * @param T A `TaggedUnionSpec[]` array type to get a union of the *tagged-union* types
 * defined in them
 */
export type CombinedUnions<T> = T extends TaggedUnionSpec<any, any, any>[]
  ? (T extends [infer TFirst, ...infer TRest]
    ? SpecUnion<TFirst> | CombinedUnions<TRest>
    : never)
  : never

/**
 * Gets the combined _tagged union_ **tag** type from an array type of specifications
 *@param T A `TaggedUnionSpec[]` array type to get a union of the *tagged-union* **tag** types
 * defined in them
 */
export type CombinedTags<T> = T extends TaggedUnionSpec<any, any, any>[]
  ? (T extends [infer TFirst, ...infer TRest]
    ? SpecTags<TFirst> | CombinedTags<TRest>
    : never)
  : never

/**
 * The type of the `TypeValidation` returned from `taggedUnionOf`.
 * @param TUnion The union type that is defined by the spec
 * @param TKey The tag's property name
 * @param TTag The type of tags that may be used in the `TaggedUnion`
 */
export interface TaggedUnionValidation<
  TUnion extends TaggedUnion<TKey, TTag>,
  TKey extends string,
  TTag,
  > extends TypeValidation<TUnion> {
  /**
   * Returns a `TaggedUnionSpecMap` for the validated *tagged-union* types.  \
   * Can be used in `taggedUnionOf` to compose broader *tagged-union* validations
   * from existing ones.
   */
  unionSpec(): TaggedUnionSpecMap<TUnion, TKey, TTag>
}

/**
 * Create `TypeValidation` that validate tagged-unions
 * @param tagKey The name of the property containing the tag.
 * @param specs A `TaggedUnionSpec`s that define which validation is used for each specified tag.
 * @returns A `TaggedUnionValidation` type validation that validates the *tagged-union* type.
 *
 * @example
 * interface A {
 *   tag: 'a'
 *   ...
 * }
 * interface B {
 *   tag: 'b'
 *   ...
 * }
 * type TaggedUnion = A | B
 *
 * const isA = objectOf<A>({...})
 * const isB = objectOf<B>({...})
 *
 * const isTaggedUnion = taggedUnionOf('tag', {
 *   // When the tag's values === 'a', use `isA` type validation
 *   // Due to typescript limitation, the first (and only the first) validation must be casted to the validated type.
 *   a: isA as TypeValidation<TaggedUnion>,
 *   // When the tag's values === 'b', use `isB` type validation (this time, no cast is needed)
 *   b: isB,
 * })
 */
export function taggedUnionOf<
  TKey extends string,
  TSpecs extends NotEmptyArray<TaggedUnionSpec<any, TKey, keyof any>>
>(
  tagKey: TKey,
  ...specs: TSpecs
): TaggedUnionValidation<CombinedUnions<TSpecs>, TKey, CombinedTags<TSpecs>>

/**
 * Create `TypeValidation` that validate tagged-unions
 * @param tagKey The name of the property containing the tag.
 * @param specs A `TaggedUnionSpec`s that define which validation is used for each specified tag.
 * @returns A `TaggedUnionValidation` type validation that validates the *tagged-union* type.
 *
 * @example
 * const ATag = {}, BTag = {}
 *
 * interface A {
 *   objectTag: object // Assumed to be ATag
 *   ...
 * }
 * interface B {
 *   objectTag: object // Assumed to be BTag
 *   ...
 * }
 * type TaggedUnion = A | B
 *
 * const isA = objectOf<A>({...})
 * const isB = objectOf<B>({...})
 *
 * const isTaggedUnion = taggedUnionOf('objectTag', new Map(
 *   // When the tag's values === ATag, use `isA` type validation
 *   // Due to typescript limitation, the first (and only the first) validation must be casted to the validated type.
 *   [ ATag, isA as TypeValidation<TaggedUnion> ],
 *   // When the tag's values === BTag, use `isB` type validation (this time, no cast is needed)
 *   [ BTag, isB ],
 * ))
 */
export function taggedUnionOf<
  TKey extends string,
  TSpecs extends NotEmptyArray<TaggedUnionSpecMap<any, TKey, keyof any>>,
  >(
    tagKey: TKey,
    ...specs: TSpecs
  ): TaggedUnionValidation<CombinedUnions<TSpecs>, TKey, CombinedTags<TSpecs>>

/**
 * Create `TypeValidation` that validate tagged-unions
 * @param tagKey The name of the property containing the tag.
 * @param specs A `TaggedUnionSpec`s that define which validation is used for each specified tag.
 * @returns A `TaggedUnionValidation` type validation that validates the *tagged-union* type.
 *
 * @example
 * interface A {
 *   tag: 'a'
 *   ...
 * }
 * interface B {
 *   tag: 'b'
 *   ...
 * }
 * type TaggedUnion = A | B
 *
 * const isA = objectOf<A>({...})
 * const isB = objectOf<B>({...})
 *
 * const isTaggedUnion = taggedUnionOf('tag', {
 *   // When the tag's values === 'a', use `isA` type validation
 *   // Due to typescript limitation, the first (and only the first) validation must be casted to the validated type.
 *   a: isA as TypeValidation<TaggedUnion>,
 *   // When the tag's values === 'b', use `isB` type validation (this time, no cast is needed)
 *   b: isB,
 * })
 */
export function taggedUnionOf<
  TUnion extends TaggedUnion<TKey, TTag>,
  TKey extends string,
  TTag extends keyof any,
  >(
    tagKey: TKey,
    ...specs: NotEmptyArray<TaggedUnionSpec<TUnion, TKey, TTag>>
  ): TaggedUnionValidation<TUnion, TKey, TTag>

/**
 * Create `TypeValidation` that validate tagged-unions
 * @param tagKey The name of the property containing the tag.
 * @param specs A `TaggedUnionSpec`s that define which validation is used for each specified tag.
 * @returns A `TaggedUnionValidation` type validation that validates the *tagged-union* type.
 *
 * @example
 * const ATag = {}, BTag = {}
 *
 * interface A {
 *   objectTag: object // Assumed to be ATag
 *   ...
 * }
 * interface B {
 *   objectTag: object // Assumed to be BTag
 *   ...
 * }
 * type TaggedUnion = A | B
 *
 * const isA = objectOf<A>({...})
 * const isB = objectOf<B>({...})
 *
 * const isTaggedUnion = taggedUnionOf('objectTag', new Map(
 *   // When the tag's values === ATag, use `isA` type validation
 *   // Due to typescript limitation, the first (and only the first) validation must be casted to the validated type.
 *   [ ATag, isA as TypeValidation<TaggedUnion> ],
 *   // When the tag's values === BTag, use `isB` type validation (this time, no cast is needed)
 *   [ BTag, isB ],
 * ))
 */
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
    type,
    (transformation, args) => taggedUnionOf(tagKey, new Map(
      from(specMap).pipe(
        map(([key, validation]) => [key, validation[transformValidation](transformation, args)])
      )
    ))
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
