import { RoomSchema, useRoomsCollection } from '../common'

import { Subscription } from 'rxjs'
import { Timing } from '../common/useRoomsCollection'
import { docData } from 'rxfire/firestore'
import { ref } from 'vue'
import { untilUnmounted } from 'vuse-rx/src'
import { useBoard } from './useBoard'
import { useChess } from './useChess'
import { useGameTimer } from './useGameTimer'

export const useGame = (props: { uid: string; roomId: string }) => {
	const { uid, roomId } = props

	const playingAs = ref<'w' | 'b'>('w')
	const matchStart = ref(false)
	const gameOver = ref(false)
	const whiteName = ref('')
	const blackName = ref('')
	const prevTurn = ref('w')

	const room = ref<RoomSchema>()
	const { getRoomRef, updateRoom } = useRoomsCollection({ uid, username: 'null' })

	const { resetGame, updateGame, gameStatusLabel, move, fen, getMoves, turn } = useChess({
		matchStart,
		whiteName,
		blackName,
		gameOver,
		room,
	})

	const {
		myTimer,
		theirTimer,
		play: startGameTimer,
		turnMade,
	} = useGameTimer({ gameDuration: 300 })

	const { changeBoardOrientation, resetBoard, updateBoard } = useBoard({
		uid,
		roomId,
		matchStart,
		playingAs,
		timers: { myTimer, theirTimer },
		gameOver,
		move,
		fen,
		getMoves,
		turn,
	})

	const restartGame = async () => {
		if (!room.value) throw new Error(`Unexpected empty room value when restarting game`)

		await updateRoom(room.value.id, {
			gameBoard: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
		})
		resetBoard()
		resetGame()
	}

	let roomMetaSub: Subscription;
	const onRoomMetaUpdate = (roomMeta: RoomSchema) => {
		if (!matchStart.value) {
			whiteName.value = roomMeta.white?.name || ''
			blackName.value = roomMeta.black?.name || ''
			playingAs.value = roomMeta?.black?.uid === uid ? 'b' : 'w'
			changeBoardOrientation(playingAs.value === 'b' ? 'black' : 'white')
		}

		if (roomMeta.players.length === 2) {
			matchStart.value = true
			startGameTimer(prevTurn.value === playingAs.value)
		}

		if (matchStart.value)
			roomMetaSub?.unsubscribe()
	}

	const onRoomDataUpdate = (roomData: RoomSchema) => {
		const { gameBoard } = roomData
		if (!gameBoard) return

		updateBoard(gameBoard)
		updateGame(gameBoard)

		if (roomData.gameStatus === 'forfeited') gameOver.value = true
		room.value = roomData

		if (prevTurn.value !== turn.value) {
			let remoteDelayCompensation: Timing | undefined
			if (prevTurn.value !== playingAs.value) remoteDelayCompensation = roomData.timing

			turnMade({ remoteDelayCompensation, playingAs: playingAs.value })
		}
		prevTurn.value = turn.value
	}

	roomMetaSub = untilUnmounted(docData<RoomSchema>(getRoomRef(roomId))).subscribe(onRoomMetaUpdate)
	untilUnmounted(docData<RoomSchema>(getRoomRef(roomId))).subscribe(onRoomDataUpdate)

	return { _room: room, gameOver, restartGame, gameStatusLabel, myTimer, theirTimer }
}
