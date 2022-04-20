export const useNotification = () => {
	const sendInfo = (text: string) => alert(text)
	const sendWarning = (text: string) => alert(text)
	const sendError = (text: string) => alert(text)

	return { sendInfo, sendWarning, sendError }
}
