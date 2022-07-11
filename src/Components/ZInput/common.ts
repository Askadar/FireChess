import { PropType } from 'vue'

export const AllowedInputTypes = ['text', 'number'] as const
export type InputFieldTypes = PropType<typeof AllowedInputTypes[number]>

export const AllowedSelectTypes = ['select'] as const
export type SelectFieldTypes = PropType<typeof AllowedSelectTypes[number]>

export type Option = { label: string; value: string }
