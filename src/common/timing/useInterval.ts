import { ref } from 'vue'

/**
 * Simplisstic implementation, if we ever needs something more complete, can check https://stackoverflow.com/questions/64676617/pause-an-interval-rxjs etc
 */
export const useInterval = (fn: () => void, interval = 60e3) => {
	const intervalId = ref<null | number>(setInterval(fn, interval) as unknown as number)

	const stop = (): boolean => {
		if (intervalId.value === null) return true

		clearInterval(intervalId.value)
		intervalId.value = null
		return true
	}

	return { stop, intervalId }
}
