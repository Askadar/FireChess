<template>
	<div class="page">
		<slot></slot>
	</div>
</template>

<style lang="stylus">
@import './style'

.page
	display: flex;
	flex-direction: row;
	align-items: flex-start;
	padding: 120px 180px;
	gap: 42px;

	position: relative;
	box-sizing: border-box;
	width: 100vw;
	height: 100vh;

	background: colour-secondary;
</style>
