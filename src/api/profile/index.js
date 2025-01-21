import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    or,
    query,
    setDoc,
    updateDoc,
    where,
    writeBatch
} from "firebase/firestore";
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

    getProfileByEmail(email) {
        const profilesRef = collection(firestore, "profiles");
        const q = query(profilesRef, where("email", "==", email), limit(1));
        return getDocs(q);
    }

    async get(userId) {
        const profileSnap = await this.getSnap(userId);
        if (profileSnap.exists())
            return profileSnap.data();
        return null;
    }

    async getForProfilePage(pageName) {
        const q = query(collection(firestore, "profiles"),
            or(
                where("profilePage", "==", pageName),
                where("id", "==", pageName),
                )
        );
        const querySnapshot = await getDocs(q);
        let data = {};
        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            data = doc.data();
        });
        return data;
    }

    set(userId, attr) {
        let accountRef = doc(firestore, "profiles", userId);
        return setDoc(accountRef, attr);
    }

    getUserSpecialtiesById(userId) {
        return new Promise(async (resolve, reject) => {
            try {
                const userSpecRef = collection(firestore, "userSpecialties");
                const q = query(userSpecRef, where("user", "==", userId))
                const qS = await getDocs(q);
                const res = []
                qS.forEach((doc) => {
                    res.push(doc.data());
                });
                resolve(res);
            } catch (err) {
                console.error('[Dictionary Api]: ', err);
                reject(new Error('Internal server error'));
            }
        });
    }


    async addSpecialties(userId, specialties) {
        const batch = writeBatch(firestore);

        specialties.forEach((spec) => {
            let userSpecRef = doc(firestore, "userSpecialties", userId + ":" + spec.id);
            batch.set(userSpecRef, {specialty: spec.id, user: userId});
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

    async getProfiles() {
        const profilesRef = collection(firestore, "profiles");
        const querySnapshot = await getDocs(profilesRef);
        const profiles = [];
        querySnapshot.forEach((doc) => {
            profiles.push({id: doc.id, ...doc.data()});
        });
        return profiles;
    };

    async updateUserSpecialty(userId, specId, attr) {
        let accountRef = doc(firestore, "userSpecialties", userId + ":" + specId);
        await updateDoc(accountRef, attr);
    }

    async getUserSpecialties(specId) {
        const userSpecRef = collection(firestore, "userSpecialties");
        const q = query(userSpecRef, where("specialty", "==", specId))
        const qS = await getDocs(q);
        const res = []
        qS.forEach((doc) => {
            res.push(doc.data());
        });

        return res;
    }

    async getUsers(specId) {
        const userSpecRef = collection(firestore, "userSpecialties");
        const q = query(userSpecRef, where("specialty", "==", specId))
        const qS = await getDocs(q);
        const res = []
        qS.forEach((doc) => {
            res.push(doc.data());
        });


        const userRef = collection(firestore, "profiles");
        // console.log(res.map((res)=>res.user));
        const q2 = query(userRef, where("id", "in", res.map((res) => res.user)))
        const qS2 = await getDocs(q2);
        const res2 = []

        qS2.forEach((doc) => {
            res2.push(doc.data());
        });


        return res2;
    }

    getUserByEmail(email) {
        return new Promise(async (resolve, reject) => {
            try {
                const userSpecRef = collection(firestore, "profiles");
                const q = query(userSpecRef, where("email", "==", email), limit(1))
                const qS = await getDocs(q);
                const res = []
                qS.forEach((doc) => {
                    res.push(doc.data());
                });
                resolve(res[0]);
            } catch (err) {
                console.error('[Profiles Api]: ', err);
                reject(new Error('Internal server error'));
            }
        });
    }
}

export const
    profileApi = new ProfileApi();