import {collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where, writeBatch} from "firebase/firestore";
import {firestore} from "src/libs/firebase";

class ProfileApi {

    update(userId, attr) {
        let accountRef = doc(firestore, "profiles", userId);
        updateDoc(accountRef, attr);
    }

    getSnap(userId) {
        const accountRef = doc(firestore, "profiles", userId);
        return getDoc(accountRef);
    }

    async get(userId) {
        const profileSnap = await this.getSnap(userId);
        if (profileSnap.exists())
            return profileSnap.data();
        return null;
    }

    set(userId, attr) {
        let accountRef = doc(firestore, "profiles", userId);
        return setDoc(accountRef, attr);
    }

    getSpecialties(userId) {
        const specRef = collection(firestore, "userSpecialties");
        const q = query(specRef, where("userId", "==", userId));
        const qS = getDocs(q);

        const res = [];
        qS.forEach((doc) => {
            res.push(doc.data);
        });

        return res;
    }

    async addSpecialties(userId, specialties) {
        const batch = writeBatch(firestore);

        specialties.forEach((spec) => {
            let userSpecRef = doc(firestore, "userSpecialties", userId + ":" + spec.id);
            batch.set(userSpecRef, spec);
        })
        await batch.commit();
    }

    async removeSpecialty(userId, specialty) {
        const batch = writeBatch(firestore);
        let userSpecRef = doc(firestore, "userSpecialties", userId + ":" + specialty.id);
        batch.delete(userSpecRef, specialty);

        await batch.commit();
    }

    async getUserSpecialty(userId, specId) {
        const userSpecRef = doc(firestore, "userSpecialties", userId + ":" + specId);
        const promise = await getDoc(userSpecRef);
        if (promise.exists())
            return promise.data();
        return null;
    }

    async updateUserSpecialty(userId, specId, attr) {
        let accountRef = doc(firestore, "userSpecialties", userId + ":" + specId);
        await updateDoc(accountRef, attr);
    }
}

export const profileApi = new ProfileApi();