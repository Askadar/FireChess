<template>
	<button type="button" :class="['button', `button-${variant}`]">
		<slot>Button</slot>
	</button>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

export default defineComponent({
	props: {
		variant: { type: String as PropType<'primary' | 'secondary' | 'tretiary'>, default: 'tretiary' },
	},
})
</script>

<style lang="stylus">
@import './style'

.button
	background: none
	color: colour-white

	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
	padding: 9px 30px;
	cursor: pointer

	width: auto;
	min-width 160px

	border-radius: 24px;
	border 1px solid transparent

	font-family: 'Montserrat';
	font-style: normal;
	font-weight: 400;
	font-size: 16px;
	line-height: 1;
	text-align: center;
	letter-spacing: -0.25px;

	&-primary
		background colour-accent

	&-secondary
		background colour-secondary

	&-tretiary
		border-colour colour-secondary-2;
		color secondary-1
</style>
