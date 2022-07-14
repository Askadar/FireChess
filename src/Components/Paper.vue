<template>
	<div class="paper">
		<h2 class="paper-item paper-header">
			<slot name="header">Paper Header</slot>
		</h2>
		<div class="paper-item paper-body" v-if="$slots.default">
			<slot>Paper Body</slot>
		</div>
		<div class="paper-item paper-actions" v-if="$slots.actions">
			<slot name="actions"><button type="button">Action button</button></slot>
		</div>
	</div>
</template>

<style lang="stylus">
@import './style'

.paper
	box-sizing border-box
	display flex
	flex-direction column
	align-items flex-start
	padding 16px
	gap 12px
	background colour-primary
	box-shadow 1px 1px 8px rgba(0, 0, 0, .25)
	border-radius 8px
	width 100%

	@media screen and (min-width: 768px)
		width auto

	&>&-item
		flex none
		order 1
		flex-grow 0
		align-self stretch

	&>&-header
		typography-header-2()
		margin 0

	&>&-actions
		display flex
		flex-direction row
		justify-content flex-end
		align-items center
</style>
