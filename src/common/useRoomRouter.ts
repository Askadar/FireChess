import { useRouter } from 'vue-router'

export const useRoomRouter = () => {
	const router = useRouter()

	const moveToRoom = (id: string, duration?: number) =>
		router.push(`/${id}?duration=${duration || 300}`)
	const returnToLobby = () => router.push(`/`)

	return { moveToRoom, returnToLobby }
}
