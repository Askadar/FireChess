<script lang="ts">
import { defineComponent, } from "vue";
import { docData } from "rxfire/firestore";
import { Chess } from 'chess.js'
import { db } from './firebase';
import { ClipboardJS, jQuery, Chessboard } from './externals'
import { untilUnmounted } from "vuse-rx/src";

export default defineComponent({
	props: { roomId: String, uid: String },
	data: () => ({
		gameBoard: null, whiteName: '', turn: 'w', gameOver: false, blackName: '',
		matchStart: false,
		playingAs: 'w',
	}),
	setup(props) {
		const { uid, roomId } = props
		const clipboard = new ClipboardJS('.copy');
		const board = null
		const chess = new Chess()

		return {
			chess, board,
		}
	},
	methods: {
		removeHighlights() {
			jQuery('#myBoard' + this.id + ' .square-55d63').css('background', '')
		},
		highlightCell(cellId) {
			const cell$ = jQuery('#myBoard' + this.id + ' .square-' + cellId)

			cell$.css('background', this.hoverColour)
		},
		onDragStart(_, piece) {
			const { chess, matchStart } = this
			if (chess.game_over()) return false

			if ((chess.turn() === 'w' && piece.search(/^b/) !== -1) ||
				(chess.turn() === 'b' && piece.search(/^w/) !== -1) ||
				(chess.turn() !== this.playingAs) ||
				!matchStart) {
				return false
			}
		},
		onDrop(source, target) {
			const { chess, roomId } = this
			this.removeHighlights()

			// see if the move is legal
			var move = chess.move({
				from: source,
				to: target,
				promotion: 'q' // NOTE: always promote to a queen for example simplicity
			})

			// illegal move
			if (move === null) return 'snapback'
			else {
				db.doc('rooms/' + roomId).update({ gameBoard: chess.fen() });
			}
		},
		onMouseoverSquare(square) {
			const { chess } = this
			// get list of possible moves for this square
			const moves = chess.moves({
				square: square,
				verbose: true
			})

			console.log(moves)
			// exit if there are no moves available for this square
			if (moves.length === 0) return

			// highlight the square they moused over
			this.highlightCell(square)

			// highlight the possible squares for this piece
			for (let i = 0; i < moves.length; i++) {
				this.highlightCell(moves[i].to)
			}
		},
		onMouseoutSquare() {
			this.removeHighlights()
		},
		onSnapEnd() {
			const { board, chess } = this
			board.position(chess.fen())
		},
		goBack() {
			// TODO router
			// dispatch('goBack', { roomId });
		},
		restartGame() {
			const { chess, board, roomId } = this
			db.doc('rooms/' + roomId).update({ gameBoard: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" })
				.then(() => {
					board.start()
					chess.reset()
				});
		},
		generateGameStatus() {
			const { turn, gameOver, whiteName, blackName } = this

			if (turn === 'w' && !gameOver)
				return `${whiteName}'s turn (White)`
			else if (turn === 'b' && !gameOver)
				return `${blackName}'s turn (Black)`
			else if (gameOver)
				return `Game Over!`
		}
	},
	computed: {
		hoverColour() { return this.playingAs === 'w' ? '#a9a9a9' : '#696969' }
	},
	mounted() {
		const config = {
			draggable: true,
			position: 'start',
			onDragStart: this.onDragStart.bind(this),
			onDrop: this.onDrop.bind(this),
			onMouseoutSquare: this.onMouseoutSquare.bind(this),
			onMouseoverSquare: this.onMouseoverSquare.bind(this),
			onSnapEnd: this.onSnapEnd.bind(this),
			pieceTheme: './img/chesspieces/wikipedia/{piece}.png'
		}
		this.board = Chessboard(`myBoard-${this.roomId}`, config)


		const roomRef = db.doc('rooms/' + this.roomId);
		const onRoomDataUpdate = room => {
			const { gameBoard } = room
			if (!gameBoard)
				return;

			this.board.position(gameBoard)
			this.chess.load(gameBoard)

			if (room.black) {
				this.blackName = room.black.name

				this.matchStart = true
				if (room.black.uid == this.uid)
					this.playingAs = 'b'
			}

			const turn = this.chess.turn()
			const gameOver = this.chess.game_over()
			const { name: whiteName, uid: whiteId } = room.white

			if (this.playingAs === 'w')
				this.board.orientation('white')
			else
				this.board.orientation('black')
		}

		untilUnmounted(docData(roomRef)).subscribe(onRoomDataUpdate)
	}
})

</script>

<template>
	<div class="row">
		<div class="col-md-6 offset-md-2  mb-3">
			<div :id="`myBoard-${roomId}`" style="width: 80%"></div>
		</div>
		<div class="col-md-3">
			<div class="card mb-3">
				<div class="card-header">Game Status</div>
				<div class="card-body">
					<template v-if="!matchStart">
						<p class="card-text">Waiting for Second player to join.</p>
						<button type="button" class="btn btn-outline-dark copy" :data-clipboard-text="roomId">
							<i class="fas fa-clipboard me-2"></i>Copy Room ID
						</button>
					</template>
					<p class="card-text">{{ generateGameStatus() }}</p>
					<button v-if="gameOver" type="button" class="btn btn-outline-dark" @click="restartGame">
						<i class="fas fa-sync-alt me-2"></i>Reset Board
					</button>
				</div>
			</div>
		</div>
	</div>
</template>
