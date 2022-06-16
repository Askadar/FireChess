import { Ref, computed, onMounted, ref } from 'vue'
import { Square, UseChess } from './useChess'
import { Timestamp, serverTimestamp } from 'firebase/firestore'

import { Chessboard } from '../externals'
import { Timing } from '../common/useRoomsCollection'
import { useRoomsCollection } from '../common'

export type Timers = {
	myTimer: Record<'timeLeftMs', number>
	theirTimer: Record<'timeLeftMs', number>
}
export const useBoard = (props: {
	roomId: string
	uid: string
	playingAs: Ref<string>
	matchStart: Ref<boolean>
	turn: Ref<'w' | 'b'>
	gameOver: Ref<boolean>
	fen: Ref<string>
	move: UseChess['move']
	getMoves: UseChess['getMoves']
	timers: Timers
}) => {
	const { roomId, uid, playingAs, matchStart, timers, turn, gameOver, move, getMoves, fen } = props

	const { updateRoom } = useRoomsCollection({ uid, username: 'invalid param' })
	const hoverColour = computed(() => {
		return playingAs.value === 'w' ? 'hover-white' : 'hover-black'
	})
	const board = ref()

	const highlightCell = (cellId: string) => {
		document
			.querySelectorAll<HTMLDivElement>(`#myBoard-${roomId} .square-${cellId}`)
			.forEach((el) => el.classList.add(hoverColour.value))
	}
	const removeHighlights = () => {
		document
			.querySelectorAll<HTMLDivElement>(`#myBoard-${roomId} .square-55d63`)
			.forEach((el) => el.classList.remove('hover-white', 'hover-black'))
	}

	const canMove = (piece: string) => {
		if (gameOver.value) return false
		const currentTurnColour = turn.value

		return !(
			(currentTurnColour === 'w' && piece.search(/^b/) !== -1) ||
			(currentTurnColour === 'b' && piece.search(/^w/) !== -1) ||
			currentTurnColour !== playingAs.value ||
			!matchStart.value
		)
	}
	const onDragStart = (_: Event, piece: string) => canMove(piece)

	const onDrop = (source: Square, target: Square) => {
		removeHighlights()
		let currentMove = move({
			from: source,
			to: target,
			promotion: 'q', // TODO allow promotion selection
		})

		if (currentMove === null) return 'snapback'

		const timing: Timing = {
			whiteTime: playingAs.value === 'w' ? timers.myTimer.timeLeftMs : timers.theirTimer.timeLeftMs,
			blackTime: playingAs.value === 'w' ? timers.theirTimer.timeLeftMs : timers.myTimer.timeLeftMs,
			updated: serverTimestamp() as unknown as Timestamp,
		}
		updateRoom(roomId, { gameBoard: fen.value, timing })
	}

	const onMouseoverSquare = (square: Square) => {
		const moves = getMoves(square)

		if (moves.length === 0) return

		if (canMove(moves[0].color + moves[0].piece)) moves.forEach(({ to }) => highlightCell(to))
	}

	const onMouseoutSquare = removeHighlights

	const onSnapEnd = () => {
		board.value.position(fen.value)
	}

	const config = {
		draggable: true,
		position: 'start',
		onDragStart,
		onDrop,
		onMouseoutSquare,
		onMouseoverSquare,
		onSnapEnd,
		pieceTheme: './img/chesspieces/wikipedia/{piece}.png',
	}
	onMounted(() => (board.value = Chessboard(`myBoard-${roomId}`, config)))

	const resetBoard = () => board.value.start()
	const updateBoard = (newBoard: string) => board.value?.position(newBoard)
	const changeBoardOrientation = (orientation: 'black' | 'white') =>
		board.value.orientation(orientation)

	return { _board: board, resetBoard, updateBoard, changeBoardOrientation }
}
