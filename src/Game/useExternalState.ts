import { docData } from 'rxfire/firestore'
import { reactive } from 'vue'
import { untilUnmounted } from 'vuse-rx/src'

import { RoomSchema, useRoomsCollection } from '../common'

export interface ExternalState {
	gameOver: boolean
	lost: string | null
}

export const useExternalState = (props: { uid: string; username: string; roomId: string }) => {
	const { uid, username, roomId } = props
	const { getRoomRef } = useRoomsCollection({ uid, username })

	const initialState = {
		gameOver: false,
		lost: null,
	}
	const externalState = reactive<ExternalState>({ ...initialState })

	const resetExternalState = () => {
		Object.assign(externalState, { ...initialState })
	}

	const onRoomDataUpdate = (roomData: RoomSchema) => {
		if (!roomData) return false

		const { gameStatus, lost } = roomData

		if (gameStatus === 'forfeited') {
			externalState.gameOver = true
			externalState.lost = lost || null
		}
	}

	untilUnmounted(docData<RoomSchema>(getRoomRef(roomId))).subscribe(onRoomDataUpdate)

	return { externalState, resetExternalState }
}
