import firebase from 'firebase'

export const useTypedCollection = <T extends { id: string }>(
	collection: firebase.firestore.CollectionReference
) => {
	const converter: firebase.firestore.FirestoreDataConverter<T> = {
		toFirestore: (data) => {
			const copy = { ...data }
			delete copy.id
			return copy
		},
		fromFirestore: (snap: firebase.firestore.QueryDocumentSnapshot, options) => {
			const data = snap.data(options) as T
			return { ...data, id: snap.id }
		},
	}
	return collection.withConverter(converter)
}
