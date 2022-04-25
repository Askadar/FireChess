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
		const stopRoomUpdateInterval = ref((): boolean => true)

		const { collection, getRoom, updateRoom } = useRoomsCollection({ uid, username: 'null' })

		const { chess, resetGame, updateGame, generateGameStatus } = useChess({
			matchStart,
			whiteName,
			blackName,
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

		onUnmounted(() => stopRoomUpdateInterval.value())
		getRoom(roomId)
			.then((doc) => doc.data())
			.then((room) => {
				playingAs.value = room?.black?.uid === uid ? 'b' : 'w'
				board.value.orientation(playingAs.value === 'b' ? 'black' : 'white')

				if (room?.owner === uid) {
					const { stop } = useInterval(refreshRoomTimer, 60e3)
					stopRoomUpdateInterval.value = stop
				}
			})

		const onRoomDataUpdate = (roomData: RoomSchema) => {
			const { gameBoard } = roomData
			if (!gameBoard) return
			if (roomData.players.length === 2) matchStart.value = true
			if (matchStart.value) stopRoomUpdateInterval.value()

			if (!whiteName.value || !blackName.value) {
				whiteName.value = roomData.white?.name || ''
				blackName.value = roomData.black?.name || ''
			}

			updateBoard(gameBoard)
			updateGame(gameBoard)
			gameOver.value = chess.game_over()
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

					updateRoom(roomId, { gameStatus: gameOver.value === true ? 'finished' : 'forfeited' })
				} else if (room.value.players.some((p) => p === uid) && !gameOver.value) {
					const acceptLeaveRoom = confirm(
						`Если вернуться в лобби, Вам будет засчитано поражение. Принять поражение и вернуться в лобби?`
					)
					if (!acceptLeaveRoom) return false
				}

			router.push(`/`)
		}

		untilUnmounted(docData<RoomSchema>(collection.doc(roomId))).subscribe(onRoomDataUpdate)

		return {
			roomId,
			gameOver,
			chess,
			board,
			leaveRoom,
			restartGame,
			generateGameStatus,
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
					<p class="card-text">{{ generateGameStatus() }}</p>
					<button v-if="gameOver" type="button" class="btn btn-outline-dark" @click="restartGame">
						<i class="fas fa-sync-alt me-2"></i>Reset Board
					</button>
				</div>
			</div>
		</div>
	</div>
</template>
