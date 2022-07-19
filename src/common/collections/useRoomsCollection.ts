import {
	addDoc,
	arrayRemove,
	arrayUnion,
	collection,
	deleteDoc,
	deleteField,
	doc,
	DocumentSnapshot,
	getDoc,
	orderBy,
	query,
	serverTimestamp,
	Timestamp,
	updateDoc,
	where,
} from 'firebase/firestore'
import { collectionData, doc as doc$ } from 'rxfire/firestore'
import { Observable } from 'rxjs'
import { startWith } from 'rxjs/operators'

import { db } from '../../firebase'

import { cleanBoard } from '../constants'
import { useNotification } from '../misc'
import { useObservable } from '../rx/useObservable'
import { RulesetSchema } from './useRulesetsCollection'
import { useTypedCollection } from './useTypedCollection'

export type PlayerSchema = { uid: string; name: string }
export type Timing = { whiteTime: number; blackTime: number; updated: Timestamp }

export interface RoomSchema {
	readonly id: string
	owner: string
	players: string[]
	white?: PlayerSchema
	black?: PlayerSchema
	timing?: Timing
	lost?: string
	ruleset: RulesetSchema
	gameBoard: string
	gameStatus: 'waiting' | 'in progress' | 'finished' | 'forfeited' | 'timeout'
	created: Timestamp
}

export const useRoomsCollection = (
	props: { uid: string; username: string },
	options = { roomLimit: 3 }
) => {
	const { uid, username } = props
	const { roomLimit } = options

	const { sendInfo, sendWarning } = useNotification()
	const roomsCollection = useTypedCollection<RoomSchema>(collection(db, 'rooms'))

	const filteredRooms = query(
		roomsCollection,
		// Cuts off stale rooms
		where('created', '>', Timestamp.fromDate(new Date(Date.now() - 90e3))),
		orderBy('created', 'asc')
	)
	const rooms = useObservable(
		collectionData<RoomSchema>(filteredRooms, { idField: 'id' }).pipe(
			startWith([] as RoomSchema[])
		),
		[]
	)

	const createRoom = async (roomParams: { ruleset: RulesetSchema; playAs: 'white' | 'black' }) => {
		if (rooms.value.filter((room) => room.owner === uid).length >= roomLimit) {
			sendWarning(
				`Вы уже создали больше ${roomLimit} комнат, закройте некоторые прежде чем создавать новые`
			)
			return false
		}

		const { ruleset, playAs } = roomParams
		const playerObject = { uid: uid, name: username || 'guest' }
		return addDoc(roomsCollection, {
			id: '',
			owner: uid,
			players: [uid],
			[playAs]: playerObject,
			gameBoard: cleanBoard,
			gameStatus: 'waiting',
			ruleset,
			created: serverTimestamp(),
		})
	}

	const getRoomRef = (id: string) => doc(roomsCollection, id)

	const getRoom = async (id: string) => {
		return getDoc(getRoomRef(id))
	}

	const getRoomDoc$ = (id: string): Observable<DocumentSnapshot<RoomSchema>> => doc$<RoomSchema>(getRoomRef(id))

	const updateRoom = async (
		roomOrId: string | DocumentSnapshot<RoomSchema>,
		updateData: Partial<RoomSchema>
	) => {
		const room = typeof roomOrId === 'string' ? await getRoom(roomOrId) : roomOrId
		return updateDoc(room.ref, updateData)
	}

	const deleteRoom = async (roomOrId: string | DocumentSnapshot<RoomSchema>) => {
		const id = typeof roomOrId === 'string' ? roomOrId : roomOrId.id
		return deleteDoc(doc(roomsCollection, id))
	}

	const tickActiveRoom = async (room: string | DocumentSnapshot<RoomSchema>) =>
		updateRoom(room, {
			created: serverTimestamp() as unknown as Timestamp,
		})

	const joinRoom = async (id: string) => {
		try {
			const doc = await getRoom(id)
			const room = doc.data()
			if (!doc.exists() || !room) throw new Error(`Empty/nonexistant document`)

			if (room.players.length >= 2) sendWarning(`Комната уже заполнена`)
			if (uid === room.owner || room.players.some((p) => p === uid))
				sendInfo(`Вы уже находитесь в комнате`)

			const joinAsColour = room.white ? 'black' : 'white'
			updateRoom(doc, {
				[joinAsColour]: { uid: uid, name: username },
				players: arrayUnion(uid) as unknown as string[],
				gameStatus: room.players.length === 1 ? 'in progress' : room.gameStatus,
			})
		} catch (error) {
			console.log('Error getting document:', error)
		}
	}

	const leaveRoom = async (id: string) => {
		try {
			const doc = await getRoom(id)
			const room = doc.data()

			if (!doc.exists() || !room) throw new Error(`Empty/nonexistant document`)

			if ((room.players.length === 1 && room.players[0] === uid) || room.players.length === 0)
				return deleteRoom(doc)

			if (room.players.length >= 2 && room.players.some((p) => p === uid)) {
				const playingAs = room.black?.uid === uid ? 'black' : 'white'
				updateRoom(doc, {
					[playingAs]: deleteField(),
					players: arrayRemove(uid) as unknown as string[],
				})
			}
		} catch (error) {
			console.log('Error getting document:', error)
		}
	}

	return {
		query: filteredRooms,
		_collection: roomsCollection,
		rooms,
		createRoom,
		getRoom,
		getRoomRef,
		getRoomDoc$,
		updateRoom,
		deleteRoom,
		tickActiveRoom,
		joinRoom,
		leaveRoom,
	}
}
