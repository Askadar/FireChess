<template>
	<div class="page">
		<slot></slot>
	</div>
</template>

<style lang="stylus">
@import './style'

.page
	display: flex;
	align-items: flex-start;

	flex-direction: column;
	gap: 12px;
	padding: 12px 6px;

	@media screen
		@media (min-width 480px)
			padding: 30px 40px;
			flex-direction: row;

		@media (min-width 768px)
			padding: 120px 180px;
			gap: 42px;

	position: relative;
	box-sizing: border-box;
	width: 100vw;
	height: 100vh;

	background: colour-secondary;
</style>
