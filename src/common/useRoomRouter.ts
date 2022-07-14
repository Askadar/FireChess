import { useRouter } from 'vue-router'
import { RulesetSchema } from './useRulesetsCollection'

export const useRoomRouter = () => {
	const router = useRouter()

	const simpleQueryConstructor = <O extends object>(store: O) =>
		'?' +
		Object.entries(store)
			.map(([key, value]) => `${key}=${value}`)
			.join('&')

	const moveToRoom = (id: string, ruleset?: RulesetSchema) =>
		router.push(`/${id}${ruleset ? simpleQueryConstructor(ruleset) : ''}`)

	const returnToLobby = () => router.push(`/`)

	return { moveToRoom, returnToLobby }
}
