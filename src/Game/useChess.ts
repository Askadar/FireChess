import { Chess, Move, ShortMove } from 'chess.js'
import { Ref, computed, ref } from 'vue'

import { RoomSchema } from '../common'
import { colourToLong, getByLongColour, getOtherLongColour, getPlayerColour } from '../helpers'

import { ExternalState } from './useExternalState'
export interface UseChess {
	move(moveDef: ShortMove): Move | null
	getMoves(square: string): Move[]
}

export const useChess = (props: {
	blackName: Ref<string>
	whiteName: Ref<string>
	matchStart: Ref<boolean>
	gameOver: Ref<boolean>
	externalState: ExternalState
	room: Ref<RoomSchema | undefined>
}) => {
	const { blackName, whiteName, matchStart, gameOver, externalState, room } = props
	const chess = ref(new Chess())
	const turn = ref(chess.value.turn())
	const fen = ref(chess.value.fen())

	const refreshRefs = () => {
		turn.value = chess.value.turn()
		fen.value = chess.value.fen()
		gameOver.value = chess.value.game_over()
	}

	const move: UseChess['move'] = (moveDef) => {
		const moveResult = chess.value.move(moveDef)
		refreshRefs()
		return moveResult
	}
	const getMoves: UseChess['getMoves'] = (square) => chess.value.moves({ square, verbose: true })

	const gameResult = computed(() => {
		const completeGameOverState = chess.value.game_over() || externalState.gameOver
		const draw = chess.value.in_draw()

		let winnerColour: 'black' | 'white' | null = null
		let loserColour: 'black' | 'white' | null = null
		let winnerPlayer: string | null = null
		let loserPlayer: string | null = null

		if (completeGameOverState && room.value) {
			winnerColour = colourToLong(turn.value)
			if (room.value.lost) {
				winnerColour = room.value.black?.uid === room.value.lost ? 'white' : 'black'
			}
			if (externalState.lost) {
				winnerColour = colourToLong(getPlayerColour(room.value, externalState.lost)) || null
			}

			winnerPlayer = getByLongColour(room.value, winnerColour)?.uid || null

			loserColour = getOtherLongColour(winnerColour)
			loserPlayer = getByLongColour(room.value, loserColour)?.uid || null
		}

		return { finished: completeGameOverState, draw, winnerColour, winnerPlayer, loserPlayer }
	})

	const gameStatusLabel = computed(() => {
		const { finished, draw, winnerColour } = gameResult.value

		if (!matchStart.value) return `Ожидание второго игрока`

		if (turn.value === 'w' && !finished) return `${whiteName.value} ходит (Белые)`
		else if (turn.value === 'b' && !finished) return `${blackName.value} ходит (Черные)`

		if (finished && room.value) {
			if (draw) return `Ничья!`

			const winnerColourLabel = winnerColour === 'white' ? 'Белые' : 'Черные'
			const winnerName = (winnerColour && room.value[winnerColour]?.name) || ''

			return `Игра окончена! Победил ${winnerName} (${winnerColourLabel})`
		}
	})
	const resetGame = () => chess.value.reset()

	const updateGame = (newBoard: string) => {
		if (!chess.value.load(newBoard))
			return console.warn(`Failed to update chess with ${newBoard}`), false
		refreshRefs()
	}

	return {
		_chess: chess,
		resetGame,
		updateGame,
		gameResult,
		gameStatusLabel,
		fen,
		turn,
		move,
		getMoves,
	}
}
