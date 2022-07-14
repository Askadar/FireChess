<template>
	<page>
		<router-view v-if="user" :uid="user.uid" :username="user.displayName || 'Гость'" />
	</page>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useAuth } from './useAuth'
import { Page } from '../Components'

export default defineComponent({
	setup() {
		const { user } = useAuth()
		return { user }
	},
	components: { Page },
})
</script>

<style lang="stylus">
@import '../Components/style.styl'

html
body
	typography-body()
</style>
