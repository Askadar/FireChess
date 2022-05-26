import { computed, onUnmounted, reactive } from 'vue'
import { useTimer, TimerState } from '../common'
import { Timing } from '../common/useRoomsCollection'

export const useGameTimer = ({ gameDuration }: { gameDuration: number }) => {
	const _advanceRate = 250

	const myTimer = reactive(useTimer(gameDuration, false, _advanceRate))
	const theirTimer = reactive(useTimer(gameDuration, false, _advanceRate))
	onUnmounted(() => {
		myTimer.destroy()
		theirTimer.destroy()
	})

	const currentlyPlaying = computed(() => {
		if (myTimer.status === TimerState.running) return myTimer
		else if (theirTimer.status === TimerState.running) return theirTimer
	})

	const currentlyPaused = computed(() => {
		if (myTimer.status === TimerState.idle) return myTimer
		else if (theirTimer.status === TimerState.idle) return theirTimer
	})

	const play = (forMe = true) => {
		if (forMe) myTimer.play()
		else theirTimer.play()
	}
	const turnMade = ({
		remoteDelayCompensation,
		playingAs,
	}: {
		remoteDelayCompensation?: Timing
		playingAs: 'w' | 'b'
	}) => {
		if (!currentlyPlaying.value || !currentlyPaused.value) return false

		const playingTimer = currentlyPlaying.value
		const pausedTimer = currentlyPaused.value

		playingTimer.pause()
		pausedTimer.play()

		if (remoteDelayCompensation) {
			const myTime =
				playingAs === 'w' ? remoteDelayCompensation.whiteTime : remoteDelayCompensation.blackTime
			const theirTime =
				playingAs === 'w' ? remoteDelayCompensation.blackTime : remoteDelayCompensation.whiteTime
			const difference = Date.now() - remoteDelayCompensation.updated.toMillis()

			myTimer.setTime(myTime - difference)
			theirTimer.setTime(theirTime - difference)
		}
	}

	return {
		myTimer,
		theirTimer,

		play,
		turnMade,
	}
}
