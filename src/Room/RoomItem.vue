<template>
	<router-link class="room-item" @click="joinRoom" :to="`/${room?.id}`">
		<span class="room-item__piece">{{ durationLabel }}</span>
		<span class="room-item__piece">{{ typeLabel }}</span>
		<!-- <span class="room-item__piece">{{ roomLabel }}</span> -->
		<img
			class="room-item__piece icon icon--delete"
			v-if="isOwner"
			src="../../public/icons/Delete.svg"
			alt="icon icon-delete"
			@click="deleteRoom"
		/>
		<img class="icon icon--join" v-else src="../../public/icons/Enter.svg" alt="icon icon-join" />
	</router-link>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { RouterLink } from 'vue-router'
import { RoomSchema } from '../common'
import { i18nTypeHash, RulesetSchema } from '../common/useRulesetsCollection'

export default defineComponent({
	props: {
		duration: Number,
		type: String as PropType<RulesetSchema['type']>,
		extraTime: Number,
		room: Object as PropType<RoomSchema>,
		uid: String,
	},
	setup(props, ctx) {
		const { duration, type, extraTime, room, uid } = props

		const durationLabel = computed(() => `${duration} мин | +${extraTime} сек`)
		const typeLabel = computed(() => (type ? i18nTypeHash[type] : ''))
		const roomLabel = computed(() => ``)
		const isOwner = computed(() => uid === room?.owner)

		const joinRoom = () => ctx.emit('joinRoom', room)
		const deleteRoom = (evt: Event) => {
			evt.preventDefault()
			evt.stopPropagation()
			ctx.emit('deleteRoom', room?.id)
		}

		return { durationLabel, typeLabel, roomLabel, isOwner, joinRoom, deleteRoom }
	},
	components: { RouterLink },
})
</script>

<style lang="stylus">
.room-item
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 9px;

	height: 24px;

	color initial
	text-decoration: none
</style>
