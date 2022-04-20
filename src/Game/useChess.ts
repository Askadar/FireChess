import { Ref } from 'vue'
import { Chess } from 'chess.js'

export const useChess = (props: {
	blackName: Ref<string>
	whiteName: Ref<string>
	matchStart: Ref<boolean>
}) => {
	const { blackName, whiteName, matchStart } = props
	const chess = new Chess()

	const generateGameStatus = () => {
		const turn = chess.turn()
		const gameOver = chess.game_over()

		if (!matchStart.value) return `Ожидание второго игрока`
		if (turn === 'w' && !gameOver) return `${whiteName.value} ходит (Белые)`
		else if (turn === 'b' && !gameOver) return `${blackName.value} ходит (Черные)`
		else if (gameOver) return `Игра окончена!`
	}
	const resetGame = () => chess.reset()
	const updateGame = (newBoard: string) => chess.load(newBoard)

	return { chess, resetGame, updateGame, generateGameStatus }
}
