<template>
	<paper>
		<template #header>Открытые комнаты</template>
		<template #default v-if="rooms.length > 0">
			<button
				v-for="room in rooms"
				type="button"
				class="list-group-item list-group-item-action"
				@click="() => playInRoom(room.id)"
				:key="room.id"
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
		</template>
		<template #default v-else>
			Сейчас нет ожидающих игр куда можно присоединиться, создайте свою
		</template>
	</paper>
	<paper>
		<template #header>Создать комнату</template>
		<template #default>
			<z-input>
				<template #label> Продолжительность игры </template>
				<select-field v-model="ruleset" :options="rulesetOptions" />
			</z-input>
		</template>
		<template #actions>
			<button @click="createRoom">Создать комнату</button>
		</template>
	</paper>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import {
	useNotification,
	useRoomRouter,
	useRoomsCollection,
	useRulesetsCollection,
} from '../common'
import { RulesetOption } from '../common/useRulesetsCollection'
import { Paper, ZInput } from '../Components'
import SelectField from '../Components/ZInput/SelectField.vue'

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
		const { sendWarning } = useNotification()

		const ruleset = ref<RulesetOption>()
		const { rulesetOptions } = useRulesetsCollection()

		const createRoom = async () => {
			if (!ruleset.value)
				return sendWarning(`Для создания комнаты нужно выбрать набор правил для игры`)

			const duration = ruleset.value.ruleset.duration

			const newRoom = await _createRoom({ duration, playAs: 'white' })
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

			rulesetOptions,
			ruleset,
		}
	},
	components: { Paper, ZInput, SelectField },
})
</script>
