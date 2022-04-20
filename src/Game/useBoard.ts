import { computed, onMounted, Ref, ref } from 'vue'
import { ChessInstance, Square, Piece } from 'chess.js'
import { useRoomsCollection } from '../common'
import { Chessboard } from '../externals'

export const useBoard = (props: {
	roomId: string
	uid: string
	chess: ChessInstance
	playingAs: Ref<string>
	matchStart: Ref<boolean>
}) => {
	const { roomId, uid, chess, playingAs, matchStart } = props

	const { updateRoom } = useRoomsCollection({ uid, username: 'invalid param' })
	const hoverColour = computed(() => {
		return playingAs.value === 'w' ? '#a9a9a9' : '#696969'
	})
	const board = ref()

	const highlightCell = (cellId: string) => {
		document
			.querySelectorAll<HTMLDivElement>(`#myBoard${roomId} .square-${cellId}`)
			.forEach((el) => (el.style.background = hoverColour.value))
	}
	const removeHighlights = () => {
		document
			.querySelectorAll<HTMLDivElement>(`#myBoard${roomId} .square-55d63`)
			.forEach((el) => (el.style.background = ''))
	}
	const onDragStart = (_: Event, piece: string) => {
		// const { chess, matchStart } = this
		if (chess.game_over()) return false

		const currentTurnColour = chess.turn()
		if (
			(currentTurnColour === 'w' && piece.search(/^b/) !== -1) ||
			(currentTurnColour === 'b' && piece.search(/^w/) !== -1) ||
			currentTurnColour !== playingAs.value ||
			!matchStart.value
		) {
			return false
		}
	}

	const onDrop = (source: Square, target: Square) => {
		removeHighlights()

		var move = chess.move({
			from: source,
			to: target,
			promotion: 'q', // TODO allow promotion selection
		})

		if (move === null) return 'snapback'

		updateRoom(roomId, { gameBoard: chess.fen() })
	}

	const onMouseoverSquare = (square: Square) => {
		const moves = chess.moves({
			square,
			verbose: true,
		})

		console.log(moves)
		if (moves.length === 0) return

		highlightCell(square)
		moves.forEach(({ to }) => highlightCell(to))
	}

	const onMouseoutSquare = removeHighlights

	const onSnapEnd = () => {
		board.value.position(chess.fen())
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
	const updateBoard = (newBoard: string) => board.value.position(newBoard)

	return { board, resetBoard, updateBoard }
}
