<template>
	<button type="button" class="button">
		<slot>Button</slot>
	</button>
</template>

<style lang="stylus">
@import './style'

.button
	background: colour-accent
</style>
