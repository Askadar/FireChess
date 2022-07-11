<template>
	<select class="select-field">
		<option v-for="{ label, value } in options" :value="value">{{ label }}</option>
	</select>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Option } from "./common";

export default defineComponent({
	props: {
		value: String,
		options: { type: Array<Option>, default: [] }
	}
})
</script>
