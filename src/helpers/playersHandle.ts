import { RoomSchema, PlayerSchema } from '../common/useRoomsCollection'

const shortToLong = { w: 'white', b: 'black' } as const
const longToShort = { white: 'w', black: 'b' } as const

export const colourToLong = (from: keyof typeof shortToLong): keyof typeof longToShort =>
	shortToLong[from]

export const colourToShort = (from: keyof typeof longToShort): keyof typeof shortToLong =>
	longToShort[from]

const getFullPlayers = (room: RoomSchema): PlayerSchema[] =>
	[room.white, room.black].filter((p): p is PlayerSchema => Boolean(p))

export const getByShortColour = (room: RoomSchema, colour: 'w' | 'b') =>
	room[colourToLong(colour)] || null
export const getByLongColour = (room: RoomSchema, colour: 'white' | 'black') => room[colour] || null

export const getPlayerColour = (room: RoomSchema, uid: string): keyof typeof shortToLong => {
	if (room.white) return room.white.uid === uid ? 'w' : 'b'
	else return room.black?.uid === uid ? 'b' : 'w'
}
export const getById = (room: RoomSchema, uid: string): PlayerSchema | null =>
	getFullPlayers(room).filter((p) => p.uid === uid)[0] || null

export const getOther = (room: RoomSchema, player: PlayerSchema): PlayerSchema | null => {
	return getFullPlayers(room).filter((p) => p.uid != player.uid)[0] || null
}
export const getOtherByShortColour = (room: RoomSchema, colour: 'w' | 'b') => {
	const player = getByShortColour(room, colour)
	if (!player) return null

	return getOther(room, player)
}
export const getOtherByLongColour = (room: RoomSchema, colour: 'white' | 'black') => {
	const player = getByLongColour(room, colour)
	if (!player) return null

	return getOther(room, player)
}

export const getOtherShortColour = (colour: keyof typeof shortToLong): keyof typeof shortToLong =>
	colour === 'w' ? 'b' : 'w'
export const getOtherLongColour = (colour: keyof typeof longToShort): keyof typeof longToShort =>
	colour === 'white' ? 'black' : 'white'
