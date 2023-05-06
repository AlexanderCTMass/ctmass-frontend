import {initializeApp} from 'firebase/app';
import {firebaseConfig} from 'src/config';
import {getFirestore} from "firebase/firestore/lite";
import { getStorage } from "firebase/storage";

export const firebaseApp = initializeApp(firebaseConfig);

export const firestore = getFirestore(firebaseApp);

export const storage = getStorage(firebaseApp);