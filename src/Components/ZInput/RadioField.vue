<template>
	<div class="radio-fields">
		<label
			:class="[`radio-field`, !(modelValue && value === modelValue.value) || 'radio-field--active']"
			v-for="{ label, value } in options"
			:for="`radio-input-${value}`"
		>
			<i class="radio-field__dot" />
			<input
				class="radio-field__input"
				type="radio"
				:value="value"
				:checked="modelValue && value === modelValue.value"
				:id="`radio-input-${value}`"
				@change="change"
			/>
			<span class="radio-field__label">{{ label }}</span>
		</label>
	</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { Option } from "./common";

export default defineComponent({
	props: {
		modelValue: Object as PropType<Option | undefined>,
		options: { type: Array<Option>, default: [] }
	},
	methods: {
		updateTo(option: Option | undefined) {
			this.$emit('update:modelValue', option)
		},
		change(evt: Event) {
			const target = evt.target as HTMLInputElement
			if (!target)
				return

			const selectedOption = this.options.find(option => option.value === target.value)
			if (selectedOption)
				this.updateTo(target.checked ? selectedOption : undefined)
		}
	}
})
</script>

<style lang="stylus">
@import '../style.styl'

.radio-fields
	display: flex;
	flex-direction: row;
	flwx-wrap wrap
	align-items: flex-start;
	padding: 0px;
	gap: 6px;

.radio-field
	& &__dot
		width: 12px;
		height: 12px;
		border-radius: 100%;
		background: colour-primary;
		display: inline-block;
		position: relative;
		box-shadow: inset 0 0 2px 0px rgb(0 0 0 / 25%)
		margin-right 4px

		&:after
			content: '';
			display: inline-block;
			position: absolute;
			left: 2px;
			top: 2px;
			width: 8px;
			height: 8px;
			border-radius: 100%;

	&--active &__dot:after
		background: colour-accent;
		box-shadow: 0 0 1px colour-accent;
</style>
