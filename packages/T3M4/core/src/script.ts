namespace State {
  export type asMap = Map<string, Map<string, string>>
  export type asObj = Record<string, Record<string, string>>

  export type asDirty = asMap & { readonly __stage: 'dirty' }
  export type asSanitized = asMap & { readonly __stage: 'sanitized' }
  export type asNormalized = asMap & { readonly __stage: 'normalized' }
  export type asPartial = Partial<asMap> & { readonly __stage: 'partial' }
}