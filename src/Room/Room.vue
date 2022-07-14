<template>
	<paper>
		<template #header>Открытые комнаты</template>
		<template #default v-if="rooms.length > 0">
			<z-button v-for="room in rooms" @click="() => playInRoom(room)" :key="room.id">
				{{ generateRoomLabel(room) }}
				<z-button
					v-if="room.owner == uid"
					title="Delete Room"
					@click.stop="() => deleteRoom(room.id)"
				>
					<i class="fas fa-trash-alt"></i>
				</z-button>
			</z-button>
		</template>
		<template #default v-else>
			Сейчас нет ожидающих игр куда можно присоединиться, создайте свою
		</template>
	</paper>
	<paper>
		<template #header>Создать комнату</template>
		<template #default>
			<z-input>
				<template #label>Начать игру</template>
				<radio-field v-model="playAs" :options="startingColours" />
			</z-input>
			<z-input>
				<template #label>Продолжительность игры</template>
				<select-field v-model="selectedRuleset" :options="rulesetOptions" />
			</z-input>
		</template>
		<template #actions>
			<z-button @click="createRoom" variant="primary">Создать комнату</z-button>
		</template>
	</paper>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import {
	RoomSchema,
	useNotification,
	useRoomRouter,
	useRoomsCollection,
	useRulesetsCollection,
} from '../common'
import { RulesetOption } from '../common/useRulesetsCollection'
import { Paper, ZInput, ZButton, SelectField, RadioField } from '../Components'

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

		const selectedRuleset = ref<RulesetOption>()
		const { rulesetOptions } = useRulesetsCollection()
		const startingColours = [
			{ value: 'white', label: 'Белыми' } as const,
			{ value: 'black', label: 'Черными' } as const,
		]
		const playAs = ref<typeof startingColours[number]>(startingColours[0])

		const createRoom = async () => {
			if (!selectedRuleset.value)
				return sendWarning(`Для создания комнаты нужно выбрать набор правил для игры`)

			const duration = selectedRuleset.value.ruleset.duration

			const newRoom = await _createRoom({ duration, playAs: playAs.value.value })
			if (newRoom) moveToRoom(newRoom.id, duration)
		}

		const playInRoom = (room: RoomSchema) => {
			joinRoom(room.id)
			moveToRoom(room.id, room.duration)
		}

		return {
			rooms,
			generateRoomLabel,
			createRoom,
			playInRoom,
			deleteRoom,

			rulesetOptions,
			selectedRuleset,
			playAs,
			startingColours,
		}
	},
	components: { Paper, ZInput, ZButton, SelectField, RadioField },
})
</script>
