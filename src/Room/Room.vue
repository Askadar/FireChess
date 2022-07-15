<template>
	<paper>
		<template #header>Открытые комнаты</template>
		<template #default v-if="rooms.length > 0">
			<room-item
				v-for="room in rooms"
				v-bind="room.ruleset"
				:room="room"
				:uid="uid"
				:key="room.id"
				@join-room="playInRoom"
				@delete-room="deleteRoom"
			/>
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
	<paper>
		<template #header>Играйте в шахматы онлайн!</template>
		<template #default>
			Чтобы начать игру онлайн достаточно присоединиться к открытой комнате где Вас уже ждет
			соперник, или создать новую с понравившимся типом матча, будь то Блиц, Рапид или Пуля.
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
import { default as RoomItem } from './RoomItem.vue'

export default defineComponent({
	props: { uid: { type: String, required: true }, username: { type: String, required: true } },
	setup(props) {
		const { rooms, createRoom: _createRoom, deleteRoom, joinRoom } = useRoomsCollection(props)
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

			const ruleset = selectedRuleset.value.ruleset

			const newRoom = await _createRoom({ ruleset, playAs: playAs.value.value })
			if (newRoom) moveToRoom(newRoom.id, ruleset)
		}

		const playInRoom = (room: RoomSchema) => {
			joinRoom(room.id)
			moveToRoom(room.id, room.ruleset)
		}

		return {
			rooms,
			createRoom,
			playInRoom,
			deleteRoom,

			rulesetOptions,
			selectedRuleset,
			playAs,
			startingColours,
		}
	},
	components: { RoomItem, Paper, ZInput, ZButton, SelectField, RadioField },
})
</script>
