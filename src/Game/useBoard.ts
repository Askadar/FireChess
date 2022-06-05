import { computed, onMounted, Ref, ref } from 'vue'
import { serverTimestamp, Timestamp } from 'firebase/firestore'
import { ChessInstance, Square } from 'chess.js'
import { useRoomsCollection } from '../common'
import { Chessboard } from '../externals'
import { Timing } from '../common/useRoomsCollection'

export type Timers = {
	myTimer: Record<'timeLeftMs', number>
	theirTimer: Record<'timeLeftMs', number>
}
export const useBoard = (props: {
	roomId: string
	uid: string
	chess: Ref<ChessInstance>
	playingAs: Ref<string>
	matchStart: Ref<boolean>
	timers: Timers
}) => {
	const { roomId, uid, chess, playingAs, matchStart, timers } = props

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
		if (chess.value.game_over()) return false
		const currentTurnColour = chess.value.turn()

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

		var move = chess.value.move({
			from: source,
			to: target,
			promotion: 'q', // TODO allow promotion selection
		})

		if (move === null) return 'snapback'

		const timing: Timing = {
			whiteTime: playingAs.value === 'w' ? timers.myTimer.timeLeftMs : timers.theirTimer.timeLeftMs,
			blackTime: playingAs.value === 'w' ? timers.theirTimer.timeLeftMs : timers.myTimer.timeLeftMs,
			updated: serverTimestamp() as unknown as Timestamp,
		}
		updateRoom(roomId, { gameBoard: chess.value.fen(), timing })
	}

	const onMouseoverSquare = (square: Square) => {
		const moves = chess.value.moves({
			square,
			verbose: true,
		})

		if (moves.length === 0) return

		if (canMove(moves[0].color + moves[0].piece)) moves.forEach(({ to }) => highlightCell(to))
	}

	const onMouseoutSquare = removeHighlights

	const onSnapEnd = () => {
		board.value.position(chess.value.fen())
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

	return { board, resetBoard, updateBoard }
}
