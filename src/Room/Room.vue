<template>
	<paper>
		<template #header>Открытые комнаты</template>
		<template #default v-if="rooms.length > 0">
			<z-button
				v-for="room in rooms"
				@click="() => playInRoom(room.id)"
				:key="room.id"
			>
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
				<template #label> Продолжительность игры </template>
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
	useNotification,
	useRoomRouter,
	useRoomsCollection,
	useRulesetsCollection,
} from '../common'
import { RulesetOption } from '../common/useRulesetsCollection'
import { Paper, ZInput, ZButton } from '../Components'
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

		const selectedRuleset = ref<RulesetOption>()
		const { rulesetOptions } = useRulesetsCollection()

		const createRoom = async () => {
			if (!selectedRuleset.value)
				return sendWarning(`Для создания комнаты нужно выбрать набор правил для игры`)

			const duration = selectedRuleset.value.ruleset.duration

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
			selectedRuleset,
		}
	},
	components: { Paper, ZInput, ZButton, SelectField },
})
</script>
