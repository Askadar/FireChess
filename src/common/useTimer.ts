import { computed, ref } from 'vue'

export enum TimerState {
	idle,
	running,
}

export const useTimer = (duration: number = 300, startOnCreation = true, advanceRateMs = 10) => {
	const _timeout = ref<number>(-1)
	const lastEndpoint = ref<number>(0)
	const status = ref<TimerState>(TimerState.idle)
	const timeLeftMs = ref(duration * 1e3)
	const timeLeft = computed(() => Math.floor(timeLeftMs.value / 1e3))

	const addTime = (duration: number) => {
		timeLeftMs.value += duration
	}
	const advanceTime = () => {
		if (status.value !== TimerState.running) return false

		const currentTime = Date.now()
		timeLeftMs.value -= currentTime - lastEndpoint.value
		lastEndpoint.value = currentTime

		// Since advanceTime is called from pause to tally time elapsed since last tick till pause, we should clear timeout to not let it hang around and potentially double tick in case of rapid play-pause-play
		clearTimeout(_timeout.value)
		_timeout.value = setTimeout(advanceTime, advanceRateMs) as unknown as number
	}
	const play = () => {
		status.value = TimerState.running
		lastEndpoint.value = Date.now()

		advanceTime()
	}
	const pause = () => {
		advanceTime()
		status.value = TimerState.idle

		return timeLeftMs.value
	}
	const destroy = () => {
		if (_timeout.value !== -1) clearTimeout(_timeout.value)
	}

	if (startOnCreation) play()

	return {
		status,
		timeLeftMs,
		timeLeft,

		addTime,
		play,
		pause,
		destroy,
	}
}
