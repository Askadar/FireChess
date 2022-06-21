import { globalEventContext } from '../externals'

export const useEvent = <EventPayload = undefined>(props: {
	evtName: string
	evtNamespace?: string
	handleEvent: (evt: CustomEvent<EventPayload>) => void
}) => {
	const { evtName, evtNamespace = 'chess', handleEvent } = props

	const evtFullName = `${evtNamespace}:${evtName}`

	const eventHandler = (evt: Event) => {
		handleEvent(evt as CustomEvent<EventPayload>)
	}
	globalEventContext.addEventListener(evtFullName, eventHandler)

	const dispatch = (detail: EventPayload) =>
		globalEventContext.dispatchEvent(new CustomEvent(evtFullName, { detail }))

	const unsubscribe = () => globalEventContext.removeEventListener(evtFullName, eventHandler)

	return { dispatch, unsubscribe }
}
