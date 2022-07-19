export const formatGameTime = (timeSeconds: number) =>
	`${Math.max(0, Math.floor(timeSeconds / 60))
		.toString()
		.padStart(2, '0')}:${Math.max(0, Math.round(timeSeconds % 60))
		.toString()
		.padStart(2, '0')}`
