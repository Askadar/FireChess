import { computed, ref, Ref } from 'vue'
import { Chess } from 'chess.js'
import { RoomSchema } from '../common'

export const useChess = (props: {
	blackName: Ref<string>
	whiteName: Ref<string>
	matchStart: Ref<boolean>
	gameOver: Ref<boolean>
	room: Ref<RoomSchema>
}) => {
	const { blackName, whiteName, matchStart, gameOver, room } = props
	const chess = ref(new Chess())
	const turn = ref(chess.value.turn())

	const gameResult = computed(() => {
		const completeGameOverState = chess.value.game_over() || gameOver.value
		const draw = chess.value.in_draw()

		let winnerColour: 'black' | 'white' | null = null
		let winnerPlayer: string | null = null
		let loserPlayer: string | null = null

		if (completeGameOverState) {
			winnerColour = turn.value === 'b' ? 'white' : 'black'
			winnerPlayer = room.value[winnerColour]?.uid || null
			if (room.value.lost) {
				winnerColour = room.value.black?.uid === room.value.lost ? 'white' : 'black'
				winnerPlayer = room.value[winnerColour]?.uid || null
			}

			const loserColour = winnerColour === 'white' ? 'black' : 'white'
			loserPlayer = room.value[loserColour]?.uid || null
		}

		return { finished: completeGameOverState, draw, winnerColour, winnerPlayer, loserPlayer }
	})

	const gameStatusLabel = computed(() => {
		const { finished, draw, winnerColour } = gameResult.value

		if (!matchStart.value) return `Ожидание второго игрока`

		if (turn.value === 'w' && !finished) return `${whiteName.value} ходит (Белые)`
		else if (turn.value === 'b' && !finished) return `${blackName.value} ходит (Черные)`

		if (finished) {
			if (draw) return `Ничья!`

			const winnerColourLabel = winnerColour === 'white' ? 'Белые' : 'Черные'
			const winnerName = (winnerColour && room.value[winnerColour]?.name) || ''

			return `Игра окончена! Победил ${winnerName} (${winnerColourLabel})`
		}
	})
	const resetGame = () => chess.value.reset()
	const updateGame = (newBoard: string) => {
		chess.value.load(newBoard)
		turn.value = chess.value.turn()
	}

	return { chess, resetGame, updateGame, gameStatusLabel }
}
