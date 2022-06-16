<script lang="ts">
import { defineComponent, onUnmounted } from 'vue'
import { serverTimestamp, Timestamp } from 'firebase/firestore'
import { docData } from 'rxfire/firestore'
import { useRoute, useRouter } from 'vue-router'

import { useRoomsCollection, RoomSchema } from '../common'
import { useInterval } from '../common/useInterval'
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
		const { _room, gameOver, restartGame, gameStatusLabel, myTimer, theirTimer } = useGame({ uid, roomId })

		const refreshRoomTimer = () =>
			updateRoom(roomId, { created: serverTimestamp() as Timestamp })

		const { stop: stopRoomHeartbeat } = useInterval(refreshRoomTimer, 60e3)

		let heartbeatSub: Subscription;
		const stopHeartbeat = () => {
			stopRoomHeartbeat()
			heartbeatSub?.unsubscribe()
		}
		heartbeatSub = docData<RoomSchema>(getRoomRef(roomId)).subscribe(roomData => {
			if (roomData.players.length !== 2) return false

			stopHeartbeat()
		})
		onUnmounted(stopHeartbeat)

		const leaveRoom = () => {
			if (!_room.value)
				return false

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
					lost: gameOver.value === true && !_room.value.lost ? uid : _room.value.lost || undefined,
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

		return {
			roomId,
			gameOver,
			leaveRoom,
			restartGame,
			gameStatusLabel,
			myTimer,
			theirTimer,
		}
	},
})
</script>

<template>
	<div class="row">
		<div class="col-md-6 offset-md-2 mb-3">
			<div :id="`myBoard-${roomId}`" style="width: 80%"></div>
		</div>
		<div class="col-md-3">
			<div class="card mb-3">
				<div class="card-header">
					<button type="button" class="btn btn-outline-dark" @click="leaveRoom">
						Вернуться в лобби
					</button>
				</div>
			</div>
			<div class="card mb-3">
				<div class="card-header">Ход игры</div>
				<div class="card-body">
					<p class="card-text">
						My time: {{ myTimer.timeLeft }}s, their time: {{ theirTimer.timeLeft }}s
					</p>
					<p class="card-text">{{ gameStatusLabel }}</p>
					<button v-if="gameOver" type="button" class="btn btn-outline-dark" @click="restartGame">
						<i class="fas fa-sync-alt me-2"></i>Reset Board
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

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
