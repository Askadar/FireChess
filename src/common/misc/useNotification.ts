import { useToast } from 'vue-toastification'

export const useNotification = () => {
	const { info, warning, error } = useToast()

	const sendInfo = (text: string) => info(text)
	const sendWarning = (text: string) => warning(text)
	const sendError = (text: string) => error(text)

	return { sendInfo, sendWarning, sendError }
}
