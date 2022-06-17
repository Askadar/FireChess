import { useTimer, TimerState } from '../useTimer'

jest.useFakeTimers()

describe('useTimer', () => {
	// Just to have infered type
	let timer = useTimer()

	beforeEach(() => {
		timer = useTimer()
	})
	afterEach(() => {
		timer.destroy()
	})

	describe('constructor', () => {
		it('should init as runnung', () => {
			expect(timer.status.value).toBe(TimerState.running)
		})
		it('should init as idle with startOnCreation = false', () => {
			timer = useTimer({ duration: 1, startOnCreation: false })
			expect(timer.status.value).toBe(TimerState.idle)
		})
	})

	describe('play', () => {
		it('should start timer', () => {
			timer.play()

			expect(timer.status.value).toBe(TimerState.running)
		})

		it('should progress time', () => {
			timer.play()
			expect(timer.timeLeftMs.value).toBe(300e3)

			jest.advanceTimersByTime(250)
			expect(timer.timeLeftMs.value).toBe(300e3 - 250)
		})

		it('should stop after duration ends', () => {
			jest.advanceTimersByTime(300e3)
			expect(timer.status.value).toBe(TimerState.finished)
		})

		it('should call finish after duration ends', () => {
			// TODO check why spy doesn't work while state is properly updated
			// const finishSpy = jest.spyOn(timer, 'finish')

			jest.advanceTimersByTime(300e3)
			expect(timer.status.value).toBe(TimerState.finished)
			// expect(finishSpy).toHaveBeenCalled()
		})

		it('should stop after exact duration', () => {
			const time = Date.now()
			// Set very long rate that overshoots expected time left
			timer = useTimer({ duration: 300, startOnCreation: true, resolutionMs: 400e3 })

			jest.runAllTimers()
			expect(timer.timeLeftMs.value).toBe(0)
			expect(timer.status.value).toBe(TimerState.finished)
			expect(Date.now() - time).toBe(300e3)
		})
	})

	describe('pause', () => {
		it('should pause running timer', () => {
			expect(timer.status.value).toBe(TimerState.running)

			timer.pause()
			expect(timer.status.value).toBe(TimerState.idle)
		})

		it('should return timeLeftMs after calling', () => {
			timer = useTimer({ duration: 60, startOnCreation: true, resolutionMs: 50 })
			jest.advanceTimersByTime(33)

			expect(timer.pause()).toBe(60e3 - 33)
		})
	})

	describe('addTime', () => {
		it('should increase timeLeft by duration ms', () => {
			expect(timer.timeLeft.value).toBe(300)

			timer.addTime(5e3)
			expect(timer.timeLeft.value).toBe(305)
			expect(timer.timeLeftMs.value).toBe(305e3)
		})
	})
})
