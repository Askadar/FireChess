import { computed, ref } from 'vue'

export enum ETimerState {
	idle,
	running,
	finished,
}

export const useTimer = (props?: {
	duration?: number
	startOnCreation?: boolean
	resolutionMs?: number
}) => {
	const { duration = 300, startOnCreation = true, resolutionMs = 10 } = props || {}
	const _timeout = ref<number>(-1)
	const lastEndpoint = ref<number>(0)
	const status = ref<ETimerState>(ETimerState.idle)
	const timeLeftMs = ref(duration * 1e3)
	const timeLeft = computed(() => Math.floor(timeLeftMs.value / 1e3))

	const addTime = (duration: number) => {
		timeLeftMs.value += duration
	}

	const setTime = (newTime: number) => {
		// Advance time before setting new timeLeft so lastEndpoint is updated
		advanceTime()
		timeLeftMs.value = newTime
	}

	const finish = () => {
		timeLeftMs.value = 0
		status.value = ETimerState.finished
	}
	const advanceTime = () => {
		if (status.value !== ETimerState.running) return false

		const currentTime = Date.now()
		timeLeftMs.value -= currentTime - lastEndpoint.value
		lastEndpoint.value = currentTime

		// Since advanceTime is called from pause to tally time elapsed since last tick till pause, we should clear timeout to not let it hang around and potentially double tick in case of rapid play-pause-play
		clearTimeout(_timeout.value)
		if (timeLeftMs.value <= 0) return finish()

		_timeout.value = setTimeout(
			advanceTime,
			// short circuit timeout to prevent needless accuracy loss
			Math.min(resolutionMs, timeLeftMs.value)
		) as unknown as number
	}
	const play = () => {
		status.value = ETimerState.running
		lastEndpoint.value = Date.now()

		advanceTime()
	}
	const pause = () => {
		advanceTime()
		status.value = ETimerState.idle

		return timeLeftMs.value
	}
	const destroy = () => {
		if (_timeout.value !== -1) clearTimeout(_timeout.value)
	}

	const reset = () => {
		timeLeftMs.value = duration * 1e3
	}

	if (startOnCreation) play()

	return {
		status,
		timeLeftMs,
		timeLeft,

		addTime,
		setTime,
		play,
		pause,
		destroy,
		finish,
		reset,
	}
}
