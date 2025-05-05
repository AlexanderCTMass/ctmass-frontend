import {initializeApp} from 'firebase/app';
import {firebaseConfig} from 'src/config';
import {getFirestore} from "firebase/firestore";
import {getStorage} from "firebase/storage";
import {getRemoteConfig} from 'firebase/remote-config';

export const firebaseApp = initializeApp(firebaseConfig);

export const firestore = getFirestore(firebaseApp);

export const storage = getStorage(firebaseApp);

export const remoteConfig = getRemoteConfig(firebaseApp);

// Установка дефолтных значений
remoteConfig.defaultConfig = {
    // Сериализуем объект в JSON строку
    "contactInfo": JSON.stringify({
        address: "Granby, MA 01033",
        phones: [
            "+1 (413) 555-0100",
            "+1 (413) 555-0200"
        ],
        email: "support@ctmass.com"
    })
};

/*
// Initialize Firebase Cloud Messaging and get a reference to the service
const messaging = getMessaging(firebaseApp);
// Add the public key generated from the console here.
getToken(messaging, {vapidKey: "BL48_-tmU9Gu0wb-P3VctkuccMhHDQhJY6EIUoei_m7iMlVNRfB-1Ito66BMwG8EF87ijuy9mz9PNaXjdwEfNyM"});


 */