import { initializeApp } from 'firebase/app';
import { firebaseConfig } from 'src/config';
import {getFirestore} from "firebase/firestore/lite";

export const firebaseApp = initializeApp(firebaseConfig);

export const firestore = getFirestore(firebaseApp);