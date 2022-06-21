import { computed, onUnmounted, reactive } from 'vue'
import { useTimer, TimerState } from '../common'
import { Timing } from '../common/useRoomsCollection'

export const useGameTimer = ({ gameDuration }: { gameDuration: number }) => {
	const resolutionMs = 250

	const myTimer = reactive(
		useTimer({ duration: gameDuration, startOnCreation: false, resolutionMs })
	)
	const theirTimer = reactive(
		useTimer({ duration: gameDuration, startOnCreation: false, resolutionMs })
	)
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

	const compensateTimer = (args: { remoteDelayCompensation: Timing; playingAs: 'w' | 'b' }) => {
		const { remoteDelayCompensation, playingAs } = args

		const myTime =
			playingAs === 'w' ? remoteDelayCompensation.whiteTime : remoteDelayCompensation.blackTime
		const theirTime =
			playingAs === 'w' ? remoteDelayCompensation.blackTime : remoteDelayCompensation.whiteTime
		const difference = Date.now() - remoteDelayCompensation.updated.toMillis()

		myTimer.setTime(myTime - difference)
		theirTimer.setTime(theirTime - difference)
	}

	const turnMade = (args: { remoteDelayCompensation?: Timing; playingAs: 'w' | 'b' }) => {
		if (!currentlyPlaying.value || !currentlyPaused.value) return false

		const playingTimer = currentlyPlaying.value
		const pausedTimer = currentlyPaused.value

		playingTimer.pause()
		pausedTimer.play()
		if (args.remoteDelayCompensation)
			compensateTimer({
				remoteDelayCompensation: args.remoteDelayCompensation,
				playingAs: args.playingAs,
			})
	}

	return {
		myTimer,
		theirTimer,

		play,
		turnMade,
		compensateTimer,
	}
}
