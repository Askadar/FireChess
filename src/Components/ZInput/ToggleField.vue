<template>
	<input type="radio" class="toggle-field" @change="change" :name="name" value="on" />
	<input type="radio" class="toggle-field" @change="change" :name="name" value="off" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Option } from "./common";

export default defineComponent({
	props: {
		value: String,
		options: { type: Array<Option>, default: [] },
		name: { type: String, default: `toggle-${Math.random()}`},
	},
	mounted(){
		if (!this.value)
			this.updateTo(false)
	},
	methods: {
		updateTo(toggled: boolean) {
			this.$emit('update:modelValue', toggled)
		},
		change(evt: Event) {
			const toggled = (evt.target as HTMLInputElement).value === 'on' ?? false
			this.updateTo(toggled)
		}
	}
})
</script>
