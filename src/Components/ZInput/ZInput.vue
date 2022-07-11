<template>
	<label class="input">
		<span v-if="$slots.label" class="input-label">
			<slot name="label">Input Label</slot>
		</span>

		<slot></slot>
	</label>
</template>

<style lang="stylus">
.input
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	padding: 4px 6px;
	gap: 3px;

	min-width: 200px
	width: auto;
	height: 35px;

	/* Primary */

	background: colour-white;
	box-shadow: inset 0px 0px 1px rgba(0, 0, 0, 0.25);
	border-radius: 2px;
</style>
