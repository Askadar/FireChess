import {
	CollectionReference,
	FirestoreDataConverter,
	QueryDocumentSnapshot,
} from 'firebase/firestore'

export const useTypedCollection = <T extends { id: string }>(collection: CollectionReference) => {
	const converter: FirestoreDataConverter<T> = {
		toFirestore: (data) => {
			const copy = { ...data }
			delete copy.id
			return copy
		},
		fromFirestore: (snap: QueryDocumentSnapshot, options) => {
			const data = snap.data(options) as T
			return { ...data, id: snap.id }
		},
	}
	return collection.withConverter(converter)
}
