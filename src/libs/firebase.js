import {initializeApp} from 'firebase/app';
import {firebaseConfig} from 'src/config';
import {getFirestore} from "firebase/firestore";
import {getStorage} from "firebase/storage";
import {getMessaging, getToken} from "firebase/messaging";

export const firebaseApp = initializeApp(firebaseConfig);

export const firestore = getFirestore(firebaseApp);

export const storage = getStorage(firebaseApp);
/*
// Initialize Firebase Cloud Messaging and get a reference to the service
const messaging = getMessaging(firebaseApp);
// Add the public key generated from the console here.
getToken(messaging, {vapidKey: "BL48_-tmU9Gu0wb-P3VctkuccMhHDQhJY6EIUoei_m7iMlVNRfB-1Ito66BMwG8EF87ijuy9mz9PNaXjdwEfNyM"});


 */