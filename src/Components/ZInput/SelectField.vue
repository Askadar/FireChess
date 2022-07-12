<template>
	<select class="select-field" @change="change" :id="labelName">
		<option>Выберите один из вариантов ниже</option>
		<option v-for="{ label, value } in options" :value="value">
			{{ label }}
		</option>
	</select>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { Option } from "./common";

export default defineComponent({
	inject: { labelName: 'labelName'},
	props: {
		labelName: String,
		modelValue: Object as PropType<Option>,
		options: { type: Array<Option>, default: [] }
	},
	methods: {
		updateTo(option:Option) {
			this.$emit('update:modelValue', option)
		},
		change(evt: Event) {
			const value = (evt.target as HTMLSelectElement)?.value
			if (!value)
				return

			const selectedOption = this.options.find(option => option.value == value)
			if (selectedOption)
				this.updateTo(selectedOption)
		}
	}
})
</script>

<style lang="stylus">
.input-field
	position relative

	&:after
		content ''
		width: 16px;
		height: 100%;

		background url('../../../public/icons/Arrow Down.svg') 0 0
		background-position: 50% 50%;

		position: absolute;
		right: 0;

		pointer-events none

	& > .select-field.select-field
		padding-right 18px
</style>
