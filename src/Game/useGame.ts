import { deleteField } from '@firebase/firestore'
import { Subscription } from 'rxjs'
import { docData } from 'rxfire/firestore'
import { ref, watch, computed } from 'vue'

import {
	RoomSchema,
	useEvent,
	useRoomsCollection,
	Timing,
	cleanBoard,
	useMountedSubscription,
} from '../common'
import { getByShortColour } from '../helpers'

import { useBoard } from './useBoard'
import { useChess } from './useChess'
import { useGameTimer } from './useGameTimer'
import { useExternalState } from './useExternalState'

export const useGame = (props: { uid: string; roomId: string, gameDuration: number }) => {
	const { uid, roomId, gameDuration } = props

	// TODO extract into rule settings
	const gameTime = 20

	const playingAs = ref<'w' | 'b'>('w')
	const matchStart = ref(false)
	const gameOver = ref(false)
	const whiteName = ref('')
	const blackName = ref('')
	const prevTurn = ref('w')

	const { externalState, resetExternalState } = useExternalState({ uid, roomId, username: 'null' })
	const completeGameOverState = computed(() => externalState.gameOver || gameOver.value)

	const room = ref<RoomSchema>()
	const { getRoomRef, updateRoom } = useRoomsCollection({ uid, username: 'null' })

	const { resetGame, updateGame, gameResult, gameStatusLabel, move, fen, getMoves, turn } =
		useChess({
			matchStart,
			whiteName,
			blackName,
			gameOver,
			externalState,
			room,
		})

	const {
		myTimer,
		theirTimer,
		play: startGameTimer,
		turnMade,
		compensateTimer,
	} = useGameTimer({ gameDuration })

	const { changeBoardOrientation, resetBoard, updateBoard } = useBoard({
		uid,
		roomId,
		matchStart,
		playingAs,
		timers: { myTimer, theirTimer },
		gameOver: completeGameOverState,
		fen,
		turn,
		move,
		getMoves,
	})

	const onTimeout = (event: CustomEvent<{ myTime: number; theirTime: number }>) => {
		if (externalState.gameOver === true || !room.value) return false

		externalState.gameOver = true
		updateGame(fen.value)

		updateRoom(roomId, {
			gameStatus: 'timeout',
			lost: getByShortColour(room.value, turn.value)?.uid,
		})

		myTimer.pause()
		theirTimer.pause()
	}
	const { dispatch } = useEvent({ evtName: 'timeout', handleEvent: onTimeout })

	watch([myTimer, theirTimer], ([mTimer, tTimer]) => {
		if (
			Math.abs(mTimer.timeLeftMs - tTimer.timeLeftMs) <= gameTime * 1e3 ||
			(mTimer.timeLeftMs > 0 && theirTimer.timeLeftMs > 0)
		)
			return

		dispatch({ myTime: mTimer.timeLeftMs, theirTime: tTimer.timeLeftMs })
	})

	const restartGame = async () => {
		if (!room.value) throw new Error(`Unexpected empty room value when restarting game`)

		await updateRoom(room.value.id, {
			gameBoard: cleanBoard,
			gameStatus: 'in progress',
			timing: deleteField() as unknown as undefined,
			lost: deleteField() as unknown as undefined,
		})

		myTimer.reset()
		theirTimer.reset()

		resetExternalState()
		resetBoard()
		resetGame()
		startGameTimer(prevTurn.value === playingAs.value)
	}

	let roomMetaSub: Subscription
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

		// if (roomMeta.timing)
		// 	compensateTimer({ remoteDelayCompensation: roomMeta.timing, playingAs: playingAs.value })

		if (matchStart.value) roomMetaSub?.unsubscribe()
	}

	const onRoomDataUpdate = (roomData: RoomSchema) => {
		const { gameBoard } = roomData
		if (!gameBoard) return

		updateBoard(gameBoard)
		updateGame(gameBoard)

		if (roomData.gameStatus === 'in progress' && externalState.gameOver === true) {
			return restartGame()
		}
		if (roomData.gameStatus === 'forfeited') externalState.gameOver = true
		room.value = roomData

		if (prevTurn.value !== turn.value) {
			let remoteDelayCompensation: Timing | undefined
			if (prevTurn.value !== playingAs.value) remoteDelayCompensation = roomData.timing

			turnMade({ remoteDelayCompensation, playingAs: playingAs.value })
		}
		prevTurn.value = turn.value
	}

	useMountedSubscription(docData<RoomSchema>(getRoomRef(roomId)), onRoomDataUpdate)
	roomMetaSub = useMountedSubscription(docData<RoomSchema>(getRoomRef(roomId)), onRoomMetaUpdate)

	return {
		_room: room,
		gameOver: completeGameOverState,
		restartGame,
		gameStatusLabel,
		myTimer,
		theirTimer,
	}
}
