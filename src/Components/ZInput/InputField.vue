<template>
	<input :type="type" class="input-field" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { InputFieldTypes } from './common'

export default defineComponent({ props: { type: String as InputFieldTypes } })
</script>
