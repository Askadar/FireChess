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
			timer = useTimer(1, false)
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
	})

	describe('pause', () => {
		it('should pause running timer', () => {
			expect(timer.status.value).toBe(TimerState.running)

			timer.pause()
			expect(timer.status.value).toBe(TimerState.idle)
		})

		it('should return timeLeftMs after calling', () => {
			timer = useTimer(60, true, 50)
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
