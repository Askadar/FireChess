<template>
	<div class="page">
		<div class="page__insides">
			<slot></slot>
		</div>
	</div>
</template>

<style lang="stylus">
@import './style'

.page
	background: colour-secondary;
	width: 100vw;
	height: 100vh;
	overflow auto

	& > &__insides
		max-width 1200px
		margin auto
		height 100%
		display: flex;
		align-items: flex-start;
		justify-content: stretch
		flex-flow: column nowrap;

		gap: 12px;
		padding: 12px 6px;

		@media screen
			@media (min-width 480px)
				padding: 30px 12px;
				flex-flow row wrap

			@media (min-width 768px)
				padding: 120px 12px;
				gap: 42px;

		position: relative;
		box-sizing: border-box;

		& > *:last-child
			margin-bottom: 100% // stick last item to the top
</style>
