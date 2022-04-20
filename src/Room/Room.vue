<script lang="ts">
import { defineComponent } from 'vue'
import { useRoomRouter, useRoomsCollection } from '../common'

export default defineComponent({
	props: { uid: { type: String, required: true }, username: { type: String, required: true } },
	setup(props) {
		const {
			rooms,
			generateRoomLabel,
			createRoom: _createRoom,

			deleteRoom,
			joinRoom,
		} = useRoomsCollection(props)

		const { moveToRoom } = useRoomRouter()

		const createRoom = async () => {
			const newRoom = await _createRoom()
			if (newRoom) moveToRoom(newRoom.id)
		}

		const playInRoom = (roomId: string) => {
			joinRoom(roomId)
			moveToRoom(roomId)
		}

		return {
			rooms,
			generateRoomLabel,
			createRoom,
			playInRoom,
			deleteRoom,
		}
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
					<button
						v-for="room in rooms"
						type="button"
						class="list-group-item list-group-item-action"
						@click="() => playInRoom(room.id)"
					>
						{{ generateRoomLabel(room) }}

						<button
							v-if="room.owner == uid"
							type="button"
							class="btn btn-danger btn-sm float-end"
							data-bs-placement="right"
							title="Delete Room"
							@click.stop="() => deleteRoom(room.id)"
						>
							<i class="fas fa-trash-alt"></i>
						</button>
					</button>
				</div>
			</div>
		</div>
		<div class="col-auto">
			<button type="button" class="btn btn-outline-success" @click="createRoom">Create Room</button>
		</div>
	</div>
</template>
