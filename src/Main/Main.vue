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

<style>
.signin {
	display: flex;
	align-items: center;
	padding-top: 40px;
	padding-bottom: 40px;
}

.form-signin {
	width: 100%;
	padding: 15px;
	margin: auto;
}
</style>
