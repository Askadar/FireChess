import { deleteField, DocumentSnapshot } from '@firebase/firestore'
import { Subscription } from 'rxjs'
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
import { shareReplay } from 'rxjs/operators'

export const useGame = (props: {
	uid: string
	roomId: string
	gameDuration: number
	extraTime: number
}) => {
	const { uid, roomId, gameDuration, extraTime } = props

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
	const { updateRoom, getRoomDoc$ } = useRoomsCollection({ uid, username: 'null' })

	const { resetGame, updateGame, gameStatusLabel, move, fen, getMoves, turn } = useChess({
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
	} = useGameTimer({ gameDuration, extraTime })

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
		extraTime,
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
		console.log({ diff: Math.abs(mTimer.timeLeftMs - tTimer.timeLeftMs), reqDiff: gameTime * 1e3 })
		if (
			Math.abs(mTimer.timeLeftMs - tTimer.timeLeftMs) >= gameTime * 1e3 ||
			(mTimer.timeLeftMs <= 0 && theirTimer.timeLeftMs <= 0)
		)
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
	const onRoomMetaUpdate = (roomDoc: DocumentSnapshot<RoomSchema>) => {
		const roomMeta = roomDoc.data()
		if (!roomDoc.exists || !roomMeta) return false

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

		if (roomMeta.timing)
			compensateTimer({ remoteDelayCompensation: roomMeta.timing, playingAs: playingAs.value })

		if (matchStart.value) roomMetaSub?.unsubscribe()
	}

	const onRoomDataUpdate = (roomDoc: DocumentSnapshot<RoomSchema>) => {
		const roomData = roomDoc.data()
		if (roomDoc.metadata.hasPendingWrites || !roomDoc.exists || !roomData) return false

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

	const $roomDocs = getRoomDoc$(roomId).pipe(shareReplay(1))
	useMountedSubscription($roomDocs, onRoomDataUpdate)
	roomMetaSub = useMountedSubscription($roomDocs, onRoomMetaUpdate)

	return {
		_room: room,
		gameOver: completeGameOverState,
		restartGame,
		gameStatusLabel,
		myTimer,
		theirTimer,
	}
}
