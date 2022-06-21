import { RoomSchema, PlayerSchema } from '../common/useRoomsCollection'

// TODO find a way without explicit typing, might be not possible with current typescript implementation
type ShortToLong = { w: 'white'; b: 'black' }
type LongToShort = { white: 'w'; black: 'b' }
const shortToLong: ShortToLong = { w: 'white', b: 'black' }
const longToShort: LongToShort = { white: 'w', black: 'b' }

export const colourToLong = (from: keyof ShortToLong): keyof LongToShort => shortToLong[from]

export const colourToShort = (from: keyof LongToShort): keyof ShortToLong => longToShort[from]

const getFullPlayers = (room: RoomSchema): PlayerSchema[] =>
	[room.white, room.black].filter((p): p is PlayerSchema => Boolean(p))

export const getByShortColour = (room: RoomSchema, colour: 'w' | 'b') =>
	room[colourToLong(colour)] || null
export const getByLongColour = (room: RoomSchema, colour: 'white' | 'black') => room[colour] || null

export const getPlayerColour = (room: RoomSchema, uid: string): keyof ShortToLong => {
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

export const getOtherShortColour = (colour: keyof ShortToLong): keyof ShortToLong =>
	colour === 'w' ? 'b' : 'w'
export const getOtherLongColour = (colour: keyof LongToShort): keyof LongToShort =>
	colour === 'white' ? 'black' : 'white'
