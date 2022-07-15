<template>
	<label class="input" :for="labelName">
		<span class="input-label" v-if="$slots.label">
			<slot name="label">Input Label</slot>
		</span>

		<div class="input-field"><slot></slot></div>
	</label>
</template>

<script lang="ts">
import { useAttrs, defineComponent, provide } from 'vue'

export default defineComponent({
	setup(_, context) {
		const labelName = (context.attrs.name as string) || `input-${Math.random()}`
		provide('labelName', labelName)

		return { labelName }
	}
})
</script>

<style lang="stylus">
@import '../style.styl'

.input
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	padding: 6px 9px;
	gap: 6px;

	min-width: 205px
	width: auto;
	height: 42px;

	background: colour-white;
	box-shadow: inset 0px 0px 1px rgba(0, 0, 0, 0.25);
	border-radius: 2px;
	border 1px solid colour-secondary
	border-top-width: 0px // for stacked inputs
	cursor pointer

	&:first-child
		border-top-width: 1px

	& > &-label
		typography-label()

	&:focus-within
	&:hover
		outline 1px solid colour-secondary

	& > &-field
		width 100%
		typography-input()

		input
		select
			cursor inherit
			border 0
			padding 0
			appearance none

			&:focus
				outline none
</style>
