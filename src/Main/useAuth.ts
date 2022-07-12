import { User, signInAnonymously } from 'firebase/auth'
import { authState } from 'rxfire/auth'

import { auth } from '../firebase'
import { useObservable } from '../common'

export const useAuth = () => {
	const user = useObservable<null | User>(authState(auth))

	signInAnonymously(auth)

	return { user }
}
