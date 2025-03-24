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
import {ERROR} from "src/libs/log";

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

    createProfile(userId, attr) {
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

    async getChatProfilesById(profilesIds) {
        if (!profilesIds || profilesIds.length === 0) {
            return [];
        }
        try {
            const profilesRef = collection(firestore, "profiles");
            const q = query(profilesRef, where('id', 'in', profilesIds));

            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                return [];
            }

            const users = [];
            snapshot.forEach(doc => {
                const profile = doc.data();
                users.push({
                    id: profile.id,
                    name: profile.businessName || profile.name || profile.email,
                    avatar: profile.avatar || '/assets/default-avatar.png',
                    email: profile.email,
                });
            });

            return users;
        } catch (error) {
            console.error("Error fetching users by IDs:", error);
            throw error;
        }
    }

    async getProfilesById(profilesIds) {
        try {
            const profilesRef = collection(firestore, "profiles");
            const q = query(profilesRef, where('id', 'in', profilesIds));

            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                return [];
            }

            const users = [];
            snapshot.forEach(doc => {
                users.push({id: doc.id, ...doc.data()});
            });

            return users;
        } catch (error) {
            console.error("Error fetching users by IDs:", error);
            throw error;
        }
    }

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


    getAllProfiles = async () => {
        try {
            const profilesRef = collection(firestore, 'profiles');
            const querySnapshot = await getDocs(profilesRef);
            const profiles = [];

            querySnapshot.forEach((doc) => {
                const profile = doc.data();
                profiles.push({
                    id: doc.id,
                    name: profile.businessName || profile.name || profile.email,
                    avatar: profile.avatar || '/assets/default-avatar.png',
                    email: profile.email,
                });
            });

            return profiles;
        } catch (error) {
            console.error('Error fetching profiles:', error);
            throw new Error('Failed to fetch profiles');
        }
    };

    searchProfiles = async (profiles, setProfiles, queryText = '') => {
        let allProf;
        if (!profiles) {
            allProf = await profileApi.getAllProfiles();
            setProfiles(allProf);
        } else {
            allProf = profiles;
        }
        if (!queryText) {
            return allProf; // Если запрос пустой, возвращаем всех пользователей
        }

        const lowerCaseQuery = queryText.toLowerCase();

        if (!Array.isArray(allProf)) {
            console.error('Profiles is not an array:', allProf);
            return []; // Возвращаем пустой массив, если profiles не является массивом
        }

        const filterObjects = allProf?.filter((item) => {
            if (!item.name) {
                return false;
            }
            const profileName = item.name.toLowerCase();
            return profileName.includes(lowerCaseQuery);
        });
        return filterObjects;
    };

    updateProfileKeywords = async (userId, displayName, email) => {
        try {
            const keywords = [
                ...displayName.toLowerCase().split(" "), // Разбиваем имя на части
                email.toLowerCase(), // Добавляем email
                displayName.toLowerCase().replace(/\s/g, ""), // Убираем пробелы (например, "johndoe")
            ];

            const profileRef = doc(firestore, "profiles", userId);
            await updateDoc(profileRef, {keywords});
        } catch (error) {
            console.error("Error updating profile keywords:", error);
            throw new Error("Failed to update profile keywords");
        }
    };

    getUserIdsForSpecialty = async (specialtyId) => {
        try {
            const userSpecRef = collection(firestore, "userSpecialties");
            const q = query(userSpecRef, where("specialty", "==", specialtyId));
            const qS = await getDocs(q);
            const userIds = [];
            qS.forEach((doc) => {
                userIds.push(doc.data().user);
            });
            return userIds;
        } catch (error) {
            console.error("Error fetching user IDs:", error);
            throw new Error("Failed to fetch user IDs");
        }
    }

    getUsersEmails = async (userIds) => {
        try {
            const userIdsArray = Array.isArray(userIds) ? userIds : [userIds];
            const userRef = collection(firestore, "profiles");
            const q = query(userRef, where("id", "in", userIdsArray));
            const qS = await getDocs(q);
            return qS.docs.reduce((acc, doc) => {
                acc[doc.id] = doc.data().email;
                return acc;
            }, {});
        } catch (error) {
            ERROR("Error fetching user emails:", error);
            throw error;
        }
    }

    checkExistPhone = async (phone, profileId) => {
        const profileRef = collection(firestore, "profiles");
        const q = query(profileRef, where("phone", "==", phone),
            where("id", "!=", profileId));
        const qS = await getDocs(q);
        return !qS.empty;
    }
}

export const
    profileApi = new ProfileApi();