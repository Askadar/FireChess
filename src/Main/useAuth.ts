import { ref } from 'vue'
import { User, signInAnonymously } from 'firebase/auth'
import { authState } from 'rxfire/auth'
import { untilUnmounted } from 'vuse-rx'

import { auth } from '../firebase'

export const useAuth = () => {
	const user = ref<null | User>(null)

	untilUnmounted(authState(auth)).subscribe((u) => {
		user.value = u
	})
	signInAnonymously(auth)

	return { user }
}
