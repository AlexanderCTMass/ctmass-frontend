import { initializeApp } from 'firebase/app';
import { firebaseConfig } from 'src/config';
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getRemoteConfig } from 'firebase/remote-config';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";
import { getFunctions } from 'firebase/functions';
import { getAnalytics, isSupported as analyticsSupported } from 'firebase/analytics'
import { getPerformance } from 'firebase/performance'

export const firebaseApp = initializeApp(firebaseConfig);

// Create a ReCaptchaEnterpriseProvider instance using your reCAPTCHA Enterprise
// site key and pass it to initializeAppCheck().
const appCheck = initializeAppCheck(firebaseApp, {
    provider: new ReCaptchaEnterpriseProvider("6LcuXOAlAAAAACyA5xKrCWhGJYWCQ5ZPInzix9qy"),
    isTokenAutoRefreshEnabled: true // Set to true to allow auto-refresh.
});

export const firestore = getFirestore(firebaseApp);

export const storage = getStorage(firebaseApp);

export const functions = getFunctions(firebaseApp, 'us-central1');

export const remoteConfig = getRemoteConfig(firebaseApp);

// Важные настройки
remoteConfig.settings = {
    minimumFetchIntervalMillis: 3000000, // 5 минут для разработки
    fetchTimeoutMillis: 60000 // 60 секунд таймаут
};

// Установка дефолтных значений
remoteConfig.defaultConfig = {
    // Сериализуем объект в JSON строку
    "contactInfo": JSON.stringify({
        address: "Amherst, MA 01002",
        phones: [
            "+1 (413) 430-9679"
        ],
        email: "support@ctmass.com"
    })
};

let analytics = null;
analyticsSupported().then((yes) => {
    if (yes) {
        analytics = getAnalytics(firebaseApp)
    }
})

export { analytics }

export const performance = getPerformance(firebaseApp)

/*
// Initialize Firebase Cloud Messaging and get a reference to the service
const messaging = getMessaging(firebaseApp);
// Add the public key generated from the console here.
getToken(messaging, {vapidKey: "BL48_-tmU9Gu0wb-P3VctkuccMhHDQhJY6EIUoei_m7iMlVNRfB-1Ito66BMwG8EF87ijuy9mz9PNaXjdwEfNyM"});


 */