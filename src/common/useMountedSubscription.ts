import { onUnmounted } from 'vue'
import { Observable } from 'rxjs'

export const useMountedSubscription = <T>(
	$source: Observable<T>,
	callback: (update: T) => void
) => {
	const subscription = $source.subscribe(callback)

	onUnmounted(() => subscription.unsubscribe())

	return subscription
}
