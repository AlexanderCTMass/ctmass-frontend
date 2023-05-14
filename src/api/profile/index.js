import {doc, getDoc, setDoc, updateDoc} from "firebase/firestore";
import {firestore} from "src/libs/firebase";

class ProfileApi {

    update(userId, attr) {
        let accountRef = doc(firestore, "profiles", userId);
        updateDoc(accountRef, attr);
    }

    get(userId){
        const accountRef = doc(firestore, "profiles", userId);
        return getDoc(accountRef);
    }

    set(userId, attr){
        let accountRef = doc(firestore, "profiles", userId);
        return setDoc(accountRef, attr);
    }

}

export const profileApi = new ProfileApi();