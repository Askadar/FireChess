import { useRouter } from 'vue-router'

export const useRoomRouter = () => {
	const router = useRouter()

	const moveToRoom = (id: string) => router.push(`/${id}`)
	const returnToLobby = () => router.push(`/`)

	return { moveToRoom, returnToLobby }
}
