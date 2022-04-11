import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.FB_API_KEY,
    authDomain: process.env.FB_AUTH_DOMAIN,
    databaseURL: process.env.FB_DB_URL,
    projectId: process.env.FB_PROJECT_ID,
    storageBucket: process.env.FB_BUCKET,
    messagingSenderId: process.env.ANALYTICS_MESSAGING_ID,
    appId: process.env.ANALYTICS_ID,
    measurementId: process.env.ANALYTICS_MEASUREMENT_ID,
};

firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const googleProvider = new firebase.auth.GoogleAuthProvider();
export const facebookProvider = new firebase.auth.FacebookAuthProvider();
export const twitterProvider = new firebase.auth.TwitterAuthProvider();
export const githubProvider = new firebase.auth.GithubAuthProvider();

export const db = firebase.firestore();
export const arrayUnion = firebase.firestore.FieldValue.arrayUnion
export const deleteField = firebase.firestore.FieldValue.delete
export const arrayRemove = firebase.firestore.FieldValue.arrayRemove
