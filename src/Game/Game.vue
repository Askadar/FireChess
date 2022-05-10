<script lang="ts">
import { defineComponent, onUnmounted, ref } from 'vue'
import { docData } from 'rxfire/firestore'
import { untilUnmounted } from 'vuse-rx/src'
import { useRoute, useRouter } from 'vue-router'
import firebase from 'firebase'

import { useRoomsCollection, RoomSchema } from '../common'
import { useBoard } from './useBoard'
import { useChess } from './useChess'
import { useInterval } from '../common/useInterval'
import { fieldValues } from '../firebase'

export default defineComponent({
	props: { uid: { type: String, required: true } },
	setup(props) {
		const { uid } = props
		const { params } = useRoute()
		const roomId = params.roomId as string
		const router = useRouter()

		const playingAs = ref('w')
		const matchStart = ref(false)
		const gameOver = ref(false)
		const whiteName = ref('')
		const blackName = ref('')
		const room = ref<RoomSchema>()

		const { collection, updateRoom } = useRoomsCollection({ uid, username: 'null' })

		const { chess, resetGame, updateGame, gameStatusLabel } = useChess({
			matchStart,
			whiteName,
			blackName,
			gameOver,
			room,
		})
		const { board, resetBoard, updateBoard } = useBoard({
			uid,
			chess,
			roomId,
			matchStart,
			playingAs,
		})

		const refreshRoomTimer = () =>
			updateRoom(roomId, { created: fieldValues.serverTimestamp() as firebase.firestore.Timestamp })
		const restartGame = async () => {
			if (!room.value) throw new Error(`Unexpected empty room value when restarting game`)

			await updateRoom(room.value.id, {
				gameBoard: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
			})
			resetBoard()
			resetGame()
		}

		const { stop } = useInterval(refreshRoomTimer, 60e3)
		onUnmounted(stop)

		const onRoomDataUpdate = (roomData: RoomSchema) => {
			const { gameBoard } = roomData
			if (!gameBoard) return

			if (!matchStart.value) {
				whiteName.value = roomData.white?.name || ''
				blackName.value = roomData.black?.name || ''
				playingAs.value = roomData?.black?.uid === uid ? 'b' : 'w'
				board.value?.orientation(playingAs.value === 'b' ? 'black' : 'white')
			}

			if (roomData.players.length === 2) matchStart.value = true
			if (matchStart.value) stop()

			updateBoard(gameBoard)
			updateGame(gameBoard)
			gameOver.value = chess.value.game_over()
			if (roomData.gameStatus === 'forfeited') gameOver.value = true
			room.value = roomData
		}

		const leaveRoom = () => {
			if (room.value)
				if (room.value.owner === uid) {
					const extraClause =
						gameOver.value === false && room.value?.gameStatus !== 'waiting'
							? ' и Вам будет засчитано поражение'
							: ''
					const acceptCloseRoom = confirm(
						`Если вернуться в лобби, комната будет закрыта${extraClause}. Закрыть комнату и вернуться в лобби?`
					)
					if (!acceptCloseRoom) return false

					updateRoom(roomId, {
						gameStatus: gameOver.value === true ? 'finished' : 'forfeited',
						lost: gameOver.value === true && !room.value.lost ? uid : room.value.lost || undefined,
					})
				} else if (room.value.players.some((p) => p === uid) && !gameOver.value) {
					const acceptLeaveRoom = confirm(
						`Если вернуться в лобби, Вам будет засчитано поражение. Принять поражение и вернуться в лобби?`
					)
					if (!acceptLeaveRoom) return false
					if (!gameOver.value) updateRoom(roomId, { gameStatus: 'forfeited', lost: uid })
				}

			router.push(`/`)
		}

		untilUnmounted(docData<RoomSchema>(collection.doc(roomId))).subscribe(onRoomDataUpdate)

		return {
			room,
			roomId,
			gameOver,
			chess,
			board,
			leaveRoom,
			restartGame,
			gameStatusLabel,
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
