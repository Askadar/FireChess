<script lang="ts">
import { defineComponent } from 'vue'
import { useRouter} from 'vue-router'

import { collectionData } from 'rxfire/firestore'
import { startWith } from 'rxjs/operators'
import { refFrom } from 'vuse-rx'


import { db, arrayUnion, deleteField, arrayRemove, fieldValues, Timestamp } from '../firebase'

type PlayerSchema = { uid: string; name: string }

type RoomSchema = {
	owner: string
	players: string[]
	white: PlayerSchema,
	black?: PlayerSchema,
	gameBoard: string
	gameStatus: 'waiting' | 'in progress' | 'finished'
	created: typeof Timestamp
	id: string
}

export default defineComponent({
	props: { uid: String, username: String },
	setup(props) {
		const { uid } = props
		const query = db
			.collection('rooms')
			// Cuts off stale rooms
			.where('created', '>', Timestamp.fromDate(new Date(Date.now() - 90e3)))
			.orderBy('created', 'asc')
		const rooms = refFrom<RoomSchema>(collectionData(query, 'id').pipe(startWith([])))


		const generateRoomLabel = (room: RoomSchema) => {
			switch(room.players.length){
				case 0:
					return `Пустая комната`
				case 1:
					return `Комната с гостем`
				case 2:
					return `Играют`
			}
		}

		return { query, rooms, generateRoomLabel }
	},
	data: () => ({
		roomID: '',
		searchQuery: '',
	}),
	methods: {
		selectRoom(id: string) {
			this.$router.push(`/${id}`)
		},
		roomList() {
			this.$router.push(`/`)
		},
		createRoom() {
			const { uid, username } = this
			if (this.rooms.length >= 5) {
				alert("You've already created 5 rooms. Delete some to make room for more")
				return
			}
			db.collection('rooms').add({
				owner: uid,
				created: fieldValues.serverTimestamp(),
				players: [uid],
				white: { uid: uid, name: username },
				gameBoard: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
				gameStatus: 'progress',
			})
		},
		joinRoom(roomId: string) {
			const { uid, username } = this

			const docRef = db.collection('rooms').doc(roomId)

			docRef
				.get()
				.then((doc) => {
					if (doc.exists) {
						console.log('Players in the room:', doc.data().players.length)
						if (doc.data().players.length <= 1) {
							if (uid !== doc.data().owner)
								docRef.update({
									black: { uid: uid, name: username },
									players: arrayUnion(uid),
								})
							this.selectRoom(doc.id)
						} else alert('Cannot join this room')
					} else {
						// doc.data() will be undefined in this case
						console.log('No such document!')
					}
				})
				.catch((error) => {
					console.log('Error getting document:', error)
				})
		},
		deleteRoom(id) {
			db.collection('rooms').doc(id).delete()
		},
		leaveRoom(id) {
			const { uid, username } = this

			const docRef = db.collection('rooms').doc(id)
			docRef
				.get()
				.then((doc) => {
					if (doc.exists) {
						console.log('Document data:', doc.data())
						if (uid !== doc.data().white.uid && doc.data().players.length == 2)
							docRef.update({
								black: deleteField(),
								players: arrayRemove(uid),
							})
					} else {
						// doc.data() will be undefined in this case
						console.log('No such document!')
					}
				})
				.catch((error) => {
					console.log('Error getting document:', error)
				})
		},
	},
})
</script>

<template>
	<div class="row justify-content-around">
		<div class="col-lg-4 col-md-5 mb-3">
			<div class="card">
				<div class="card-header">
					<h5 class="card-title">Room List</h5>
				</div>
				<div class="list-group list-group-flush">
					<button v-for="room in rooms" type="button" class="list-group-item list-group-item-action"
						@click="() => joinRoom(room.id)">
						{{ generateRoomLabel(room) }}

						<button v-if="room.owner == uid" type="button" class="btn btn-danger btn-sm float-end"
							data-bs-placement="right" title="Delete Room" @click.stop="() => deleteRoom(room.id)">
							<i class="fas fa-trash-alt"></i>
						</button>
						<button v-else-if="room.owner !== uid" type="button" class="btn btn-warning btn-sm float-end"
							data-bs-placement="right" title="Leave Room" @click.stop="() => leaveRoom(room.id)">
							<i class="fas fa-sign-out-alt"></i>
						</button>
					</button>
				</div>
			</div>
		</div>
		<div class="col-auto">
			<button type="button" class="btn btn-outline-success" @click="createRoom">
				Create Room
			</button>
		</div>
	</div>
</template>
