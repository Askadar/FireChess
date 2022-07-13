<template>
	<div :id="`myBoard-${roomId}`" style="width: 50%"></div>
	<paper>
		<template #header>Ход игры</template>
		<template #default>
			<p>{{ gameStatusLabel }}</p>
			<p>{{ myTimeFormatted }} | {{ theirTimeFormatted }}</p>
		</template>
		<template #actions>
			<z-button v-if="gameOver" variant="secondary" @click="restartGame">
				<i class="fas fa-sync-alt me-2"></i>Reset Board
			</z-button>
			<z-button variant="tretiary" @click="leaveRoom">Вернуться в лобби</z-button>
		</template>
	</paper>
</template>

<script lang="ts">
import { computed, defineComponent, onUnmounted } from 'vue'
import { deleteField, serverTimestamp, Timestamp } from 'firebase/firestore'
import { docData } from 'rxfire/firestore'
import { useRoute, useRouter } from 'vue-router'

import { useRoomsCollection, RoomSchema } from '../common'
import { Paper, ZButton } from '../Components'
import { useInterval } from '../common/useInterval'
import { formatGameTime } from '../helpers'
import { useGame } from './useGame'
import { Subscription } from 'rxjs'

export default defineComponent({
	props: { uid: { type: String, required: true } },
	setup(props) {
		const { uid } = props
		const { params } = useRoute()
		const roomId = params.roomId as string
		const router = useRouter()

		const { getRoomRef, updateRoom } = useRoomsCollection({ uid, username: 'null' })
		const { _room, gameOver, restartGame, gameStatusLabel, myTimer, theirTimer } = useGame({
			uid,
			roomId,
		})

		const refreshRoomTimer = () => updateRoom(roomId, { created: serverTimestamp() as Timestamp })

		const { stop: stopRoomHeartbeat } = useInterval(refreshRoomTimer, 60e3)

		let heartbeatSub: Subscription
		const stopHeartbeat = () => {
			stopRoomHeartbeat()
			heartbeatSub?.unsubscribe()
		}
		heartbeatSub = docData<RoomSchema>(getRoomRef(roomId)).subscribe((roomData) => {
			if (roomData.players.length !== 2) return false

			stopHeartbeat()
		})
		onUnmounted(stopHeartbeat)

		const leaveRoom = () => {
			if (!_room.value) return false

			if (_room.value.owner === uid) {
				const extraClause =
					gameOver.value === false && _room.value?.gameStatus !== 'waiting'
						? ' и Вам будет засчитано поражение'
						: ''
				const acceptCloseRoom = confirm(
					`Если вернуться в лобби, комната будет закрыта${extraClause}. Закрыть комнату и вернуться в лобби?`
				)
				if (!acceptCloseRoom) return false

				updateRoom(roomId, {
					gameStatus: gameOver.value === true ? 'finished' : 'forfeited',
					lost: gameOver.value === true && !_room.value.lost ? uid : _room.value.lost || deleteField() as unknown as undefined,
				})
			} else if (_room.value.players.some((p) => p === uid) && !gameOver.value) {
				const acceptLeaveRoom = confirm(
					`Если вернуться в лобби, Вам будет засчитано поражение. Принять поражение и вернуться в лобби?`
				)
				if (!acceptLeaveRoom) return false
				if (!gameOver.value) updateRoom(roomId, { gameStatus: 'forfeited', lost: uid })
			}

			router.push(`/`)
		}

		const myTimeFormatted = computed(() => formatGameTime(myTimer.timeLeft))
		const theirTimeFormatted = computed(() => formatGameTime(theirTimer.timeLeft))

		return {
			roomId,
			gameOver,
			leaveRoom,
			restartGame,
			gameStatusLabel,
			myTimeFormatted,
			theirTimeFormatted,
		}
	},
	components: { Paper, ZButton },
})
</script>

<style lang="stylus">
.square-55d63:after
	content ""
	transition: box-shadow 0.1s ease-in
	box-shadow: inset 0 0 2px 2px rgba(255, 255, 255, 0.0)
	display: block;
	width: 90%;
	height: 90%;
	transform: translate(5%, 5%);
	border-radius: 100%;
	position: absolute;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;

.hover-black
.hover-white
	&:after
		content ""
		box-shadow: inset 0 0 4px 4px rgba(255, 255, 255, 0.8)
</style>
