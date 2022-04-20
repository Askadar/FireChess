import firebase from 'firebase'

import { collectionData } from 'rxfire/firestore'
import { startWith } from 'rxjs/operators'
import { refFrom } from 'vuse-rx'

import { db, fieldValues, Timestamp } from '../firebase'
import { useNotification } from './useNotification'
import { useTypedCollection } from './useTypedCollection'

export type PlayerSchema = { uid: string; name: string }

export interface RoomSchema {
	readonly id: string
	owner: string
	players: string[]
	white?: PlayerSchema
	black?: PlayerSchema
	gameBoard: string
	gameStatus: 'waiting' | 'in progress' | 'finished' | 'forfeited'
	created: firebase.firestore.Timestamp
}

export const useRoomsCollection = (
	props: { uid: string; username: string },
	options = { roomLimit: 3 }
) => {
	const { uid, username } = props
	const { roomLimit } = options

	const { sendInfo, sendWarning } = useNotification()
	const collection = useTypedCollection<RoomSchema>(db.collection('rooms'))

	const query = collection
		// Cuts off stale rooms
		.where('created', '>', Timestamp.fromDate(new Date(Date.now() - 90e3)))
		.orderBy('created', 'asc')
	const rooms = refFrom(
		collectionData<RoomSchema>(query, 'id').pipe(startWith([] as RoomSchema[])),
		[]
	)

	const createRoom = async () => {
		if (rooms.value.filter((room) => room.owner === uid).length >= roomLimit) {
			sendWarning(
				`Вы уже создали больше ${roomLimit} комнат, закройте некоторые прежде чем создавать новые`
			)
			return false
		}

		return collection.add({
			id: '',
			owner: uid,
			players: [uid],
			white: { uid: uid, name: username || 'guest' }, // TODO allow user to select colour
			gameBoard: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
			gameStatus: 'waiting',
			// Forced type cause firestore types serverTimestamp as FieldValue instead of Timestamp
			created: fieldValues.serverTimestamp() as unknown as firebase.firestore.Timestamp,
		})
	}

	const getRoom = async (id: string) => {
		return collection.doc(id).get()
	}

	const updateRoom = async (
		roomOrId: string | firebase.firestore.DocumentSnapshot<RoomSchema>,
		updateData: Partial<RoomSchema>
	) => {
		const room = typeof roomOrId === 'string' ? await getRoom(roomOrId) : roomOrId
		return room.ref.update(updateData)
	}

	const deleteRoom = async (roomOrId: string | firebase.firestore.DocumentSnapshot<RoomSchema>) => {
		const id = typeof roomOrId === 'string' ? roomOrId : roomOrId.id
		return collection.doc(id).delete()
	}

	const tickActiveRoom = async (room: string | firebase.firestore.DocumentSnapshot<RoomSchema>) =>
		updateRoom(room, {
			created: fieldValues.serverTimestamp() as unknown as firebase.firestore.Timestamp,
		})

	const generateRoomLabel = (room: RoomSchema) => {
		switch (room.players.length) {
			case 0:
				return `Пустая комната`
			case 1:
				return `Комната с гостем`
			case 2:
				return `Играют`
		}
	}

	const joinRoom = async (id: string) => {
		try {
			const doc = await getRoom(id)
			const room = doc.data()
			if (!doc.exists || !room) throw new Error(`Empty/nonexistant document`)

			if (room.players.length >= 2) sendWarning(`Комната уже заполнена`)
			if (uid === room.owner || room.players.some((p) => p === uid))
				sendInfo(`Вы уже находитесь в комнате`)

			updateRoom(doc, {
				black: { uid: uid, name: username },
				players: fieldValues.arrayUnion(uid) as unknown as string[],
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

			if (!doc.exists || !room) throw new Error(`Empty/nonexistant document`)

			if ((room.players.length === 1 && room.players[0] === uid) || room.players.length === 0)
				return deleteRoom(doc)

			if (room.players.length >= 2 && room.players.some((p) => p === uid)) {
				const playingAs = room.black?.uid === uid ? 'black' : 'white'
				updateRoom(doc, {
					[playingAs]: fieldValues.delete(),
					players: fieldValues.arrayRemove(uid) as unknown as string[],
				})
			}
		} catch (error) {
			console.log('Error getting document:', error)
		}
	}

	return {
		query,
		collection,
		rooms,
		generateRoomLabel,
		createRoom,
		getRoom,
		updateRoom,
		deleteRoom,
		tickActiveRoom,
		joinRoom,
		leaveRoom,
	}
}
