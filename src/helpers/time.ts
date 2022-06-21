export const formatGameTime = (timeSeconds: number) =>
	`${Math.floor(timeSeconds / 60)
		.toString()
		.padStart(2, '0')}:${Math.round(timeSeconds % 60)
		.toString()
		.padStart(2, '0')}`
