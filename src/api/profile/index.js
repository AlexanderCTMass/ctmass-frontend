import {
    addDoc,
    collection,
    collectionGroup,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    limit,
    onSnapshot,
    or,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
    writeBatch,
    arrayUnion,
    arrayRemove
} from "firebase/firestore";
import { firestore } from "src/libs/firebase";
import { ERROR, INFO } from "src/libs/log";
import { extendedProfileApi } from "src/pages/cabinet/profiles/my/data/extendedProfileApi";
import { profileService } from "src/service/profile-service";

class ProfileApi {

    async update(userId, attr) {
        let accountRef = doc(firestore, "profiles", userId);
        await updateDoc(accountRef, attr);
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

    getTempProfileByEmail(email) {
        const profilesRef = collection(firestore, "tempProfiles");
        const q = query(profilesRef, where("email", "==", email), limit(1));
        return getDocs(q);
    }

    logger = {
        warn: (message) => console.warn(`[WARN] ${message}`),
        error: (message, error) => console.error(`[ERROR] ${message}`, error),
        info: (message) => console.log(`[INFO] ${message}`)
    };

    deleteTempProfile = async (email) => {
        const collectionRef = collection(firestore, "tempProfiles");
        const q = query(collectionRef, where('email', '==', email));
        const snapshot = await getDocs(q);

        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);

    };

    async get(userId) {
        const profileSnap = await this.getSnap(userId);
        if (profileSnap.exists())
            return profileSnap.data();
        return null;
    }


    subscribe = (profileId, callback) => {
        const projectRef = doc(firestore, "profiles", profileId);
        const unsubscribe = onSnapshot(projectRef, (doc) => {
            if (doc.exists()) {
                callback(doc.data());
            }
        });

        return unsubscribe;
    };

    subscribeEducations = (profileId, callback) => {
        const projectRef = collection(firestore, "profiles", profileId, "education");
        const unsubscribe = onSnapshot(projectRef, (snapshot) => {
            const educations = snapshot.docs.map(doc => doc.data());
            callback(educations);
        });

        return unsubscribe;
    };

    subscribeSpecialties = (profileId, callback) => {
        const userSpecRef = collection(firestore, "userSpecialties");
        const q = query(userSpecRef, where("user", "==", profileId));

        const unsubscribe = onSnapshot(
            q,
            (querySnapshot) => {
                const specialtiesData = [];
                querySnapshot.forEach((doc) => {
                    specialtiesData.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                callback(specialtiesData);
            },
            (err) => {
                ERROR("Ошибка получения специальностей пользователя");
            }
        );

        return () => unsubscribe();
    };


    subscribePortfolio = (profileId, callback) => {
        const projectRef = collection(firestore, "profiles", profileId, "portfolio");
        const unsubscribe = onSnapshot(projectRef, (snapshot) => {
            const educations = snapshot.docs.map(doc => doc.data());
            callback(educations);
        });

        return unsubscribe;
    };

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

    async createTempProfile(values) {
        const projectCollection = collection(firestore, 'tempProfiles');
        await addDoc(projectCollection, values);
    }

    /**
     * Добавляет гостевой профиль или возвращает существующий
     * @param {string} email - Email гостя
     * @param {string} name - Имя гостя
     * @returns {Promise<{id: string, exists: boolean}>} Объект с ID профиля и флагом существования
     */
    addGuestProfile = async (email, name) => {
        try {
            // 1. Проверяем существование профиля по email
            const profilesRef = collection(firestore, "profiles");
            const q = query(profilesRef, where("email", "==", email));
            const querySnapshot = await getDocs(q);

            // 2. Если профиль уже существует - возвращаем его
            if (!querySnapshot.empty) {
                const existingProfile = querySnapshot.docs[0];
                return {
                    id: existingProfile.id,
                    exists: true,
                    data: existingProfile.data()
                };
            }

            // 3. Если не существует - создаем новый
            const newProfileRef = await addDoc(profilesRef, {
                email,
                name,
                role: 'guest',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            return {
                id: newProfileRef.id,
                exists: false,
                data: {
                    email,
                    name,
                    role: 'guest'
                }
            };

        } catch (error) {
            console.error("Error in addGuestProfile:", error);
            throw error;
        }
    };

    getUserSpecialtiesById(userId) {
        return new Promise((resolve, reject) => {
            (async () => {
                try {
                    const userSpecRef = collection(firestore, "userSpecialties");
                    const q = query(userSpecRef, where("user", "==", userId));
                    const qS = await getDocs(q);
                    const res = [];
                    qS.forEach((doc) => {
                        res.push(doc.data());
                    });
                    resolve(res);
                } catch (err) {
                    console.error("[Dictionary Api]: ", err);
                    reject(new Error("Internal server error"));
                }
            })();
        });
    }

    getUserServices(userId) {
        return new Promise((resolve, reject) => {
            (async () => {
                try {
                    const userServicesRef = collection(firestore, "userServices");
                    const q = query(userServicesRef, where("userId", "==", userId));
                    const qS = await getDocs(q);
                    const res = [];
                    qS.forEach((doc) => {
                        res.push({ id: doc.id, ...doc.data() });
                    });
                    resolve(res);
                } catch (err) {
                    console.error("[Dictionary Api]: ", err);
                    reject(new Error("Internal server error"));
                }
            })();
        });
    }


    async addSpecialties(userId, specialties) {
        const batch = writeBatch(firestore);

        specialties.forEach((spec) => {
            let userSpecRef = doc(firestore, "userSpecialties", userId + ":" + spec.id);
            batch.set(userSpecRef, { specialty: spec.id, user: userId });
        })
        await batch.commit();
    }

    async addServices(userId, services) {
        const batch = writeBatch(firestore);

        services.forEach((service) => {
            let userServiceRef = doc(firestore, "userServices", userId + ":" + service.id);
            batch.set(userServiceRef, { service: service.id, user: userId });
        })
        await batch.commit();
    }

    async addService(userId, specialtyId, serviceId, price, priceType) {
        const userServiceRef = doc(firestore, "userServices", userId + ":" + serviceId);
        await setDoc(userServiceRef, {
            userId: userId,
            specialtyId: specialtyId,
            serviceId: serviceId,
            price: price,
            priceType: priceType
        });
    }

    async removeService(serviceId) {
        try {
            const userServiceRef = doc(firestore, "userServices", serviceId);
            await deleteDoc(userServiceRef);
            INFO("Service removed", `${serviceId}`);
        } catch (err) {
            ERROR(err);
        }
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

    async getProfiles(role, limitr = 1000) {
        const profilesRef = collection(firestore, "profiles");
        const q = query(profilesRef, where('role', '==', role), limit(limitr));

        const querySnapshot = await getDocs(q);
        const profiles = [];
        querySnapshot.forEach((doc) => {
            profiles.push({ id: doc.id, ...doc.data() });
        });

        return profiles;
    }

    async getProfilesWithReviews(role, limit = 1000, businessNameFilter = '') {
        // 1. Get all profiles
        const profiles = await this.getProfiles(role, limit);

        // 2. Filter by businessName if provided
        const filteredProfiles = businessNameFilter
            ? profiles.filter(profile =>
                profile.businessName &&
                profile.businessName.toLowerCase().includes(businessNameFilter.toLowerCase()))
            : profiles;

        // 3. Parallel load reviews and specialties for all filtered profiles
        const profilePromises = filteredProfiles.map(async (profile) => {
            try {
                // Run parallel requests for reviews and specialties
                const [reviews, specialties] = await Promise.all([
                    extendedProfileApi.getReviews(profile.id),
                    extendedProfileApi.getUserSpecialties(profile.id)
                ]);

                // Update profile information
                profileService.updateRatingInfo(profile, reviews);
                profile.specialties = specialties.map(spec => spec.specialty);

                INFO("Profile data fetched", {
                    id: profile.id,
                    reviews: reviews.length,
                    specialties: profile.specialties
                });

                return profile;
            } catch (error) {
                console.error(`Error processing profile ${profile.id}:`, error);
                return profile; // Return profile even in case of error
            }
        });

        // 4. Wait for all operations to complete
        return await Promise.all(profilePromises);
    }

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

    async getProfilesById(profilesIds, limiter = 1000) {
        try {
            const profilesRef = collection(firestore, "profiles");
            const q = query(profilesRef, where('id', 'in', profilesIds), limit(limiter));

            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                return [];
            }

            const users = [];
            snapshot.forEach(doc => {
                users.push({ id: doc.id, ...doc.data() });
            });

            return users;
        } catch (error) {
            console.error("Error fetching users by IDs:", error);
            throw error;
        }
    }

    async getProfilesByIdWithReviews(profilesIds, limiter = 10) {
        // 1. Get all profiles
        const profiles = await this.getProfilesById(profilesIds, limiter);

        // 3. Parallel load reviews and specialties for all filtered profiles
        const profilePromises = profiles.map(async (profile) => {
            try {
                // Run parallel requests for reviews and specialties
                const [reviews, specialties] = await Promise.all([
                    extendedProfileApi.getReviews(profile.id),
                    extendedProfileApi.getUserSpecialties(profile.id)
                ]);

                // Update profile information
                profileService.updateRatingInfo(profile, reviews);
                profile.specialties = specialties.map(spec => spec.specialty);

                INFO("Profile data fetched", {
                    id: profile.id,
                    reviews: reviews.length,
                    specialties: profile.specialties
                });

                return profile;
            } catch (error) {
                console.error(`Error processing profile ${profile.id}:`, error);
                return profile; // Return profile even in case of error
            }
        });

        // 4. Wait for all operations to complete
        return await Promise.all(profilePromises);
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

    async getUsersWithoutSpecialties(limitr = 1000) {
        try {
            const profilesRef = collection(firestore, "profiles");
            const q = query(profilesRef, where('role', '==', 'WORKER'), limit(limitr));

            const snapshot = await getDocs(q);
            const users = [];
            snapshot.forEach(doc => {
                users.push({ id: doc.id, ...doc.data() });
            });

            return users;
        } catch (error) {
            console.error("Error fetching users without specialties:", error);
            throw error;
        }
    }

    getUserByEmail(email) {
        return new Promise((resolve, reject) => {
            (async () => {
                try {
                    const userSpecRef = collection(firestore, "profiles");
                    const q = query(userSpecRef, where("email", "==", email), limit(1));
                    const qS = await getDocs(q);
                    const res = [];
                    qS.forEach((doc) => {
                        res.push(doc.data());
                    });
                    resolve(res[0]);
                } catch (err) {
                    console.error("[Profiles Api]: ", err);
                    reject(new Error("Internal server error"));
                }
            })();
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
            await updateDoc(profileRef, { keywords });
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

    checkProfilePageExists = async (profilePage, currentUserId) => {
        try {
            const profilesRef = collection(firestore, 'profiles');
            const q = query(
                profilesRef,
                where('profilePage', '==', profilePage),
                where('id', '!=', currentUserId)
            );

            const querySnapshot = await getDocs(q);
            return !querySnapshot.empty;
        } catch (error) {
            console.error("Error checking profile page:", error);
            throw error;
        }
    };

    checkExistPhone = async (phone, profileId) => {
        const profileRef = collection(firestore, "profiles");
        const q = query(profileRef, where("phone", "==", phone),
            where("id", "!=", profileId));
        const qS = await getDocs(q);
        return !qS.empty;
    }

    //eslint-disable-next-line
    checkExistPhone = async (phone) => {
        const profileRef = collection(firestore, "profiles");
        const q = query(profileRef, where("phone", "==", phone));
        const qS = await getDocs(q);
        return !qS.empty;
    }

    checkExistEmail = async (email) => {
        const profileRef = collection(firestore, "profiles");
        const q = query(profileRef, where("email", "==", email));
        const qS = await getDocs(q);
        return !qS.empty;
    }

    /**
     * Add project to portfolio
     * @param userId - user id
     * @param portfolio - {date, title, shortDescription, images}
     * @returns {Promise<void>}
     */
    addPortfolio = async (userId, portfolio) => {
        try {
            const portfolioRef = collection(firestore, "profiles", userId, "portfolio");
            await addDoc(portfolioRef, portfolio);
        } catch (error) {
            ERROR("Error adding portfolio:", error);
            throw error;
        }
    }

    getPortfolioById = async (portfolioId) => {
        try {
            // 1. Запрашиваем ВСЕ подколлекции "portfolio" с указанным portfolioId
            const portfoliosQuery = query(
                collectionGroup(firestore, "portfolio"),
                where("__name__", "==", portfolioId)
            );

            const querySnapshot = await getDocs(portfoliosQuery);

            if (!querySnapshot.empty) {
                const portfolioDoc = querySnapshot.docs[0];
                return {
                    id: portfolioDoc.id,
                    ...portfolioDoc.data(),
                    userId: portfolioDoc.ref.parent.parent?.id // Добавляем userId
                };
            } else {
                INFO("Portfolio not found");
                return null;
            }
        } catch (error) {
            ERROR("Error fetching portfolio:", error);
            throw error;
        }
    };

    /**
     * Get a portfolio by its ID
     * @param {string} userId - The ID of the user who owns the portfolio
     * @param {string} portfolioId - The ID of the portfolio to retrieve
     * @returns {Promise<Object|null>} The portfolio data if found, null if not found
     * @throws {Error} If there's an error fetching the portfolio
     */
    getPortfolioByUserAndId = async (userId, portfolioId) => {
        try {
            INFO("Fetching portfolio for user:", userId, "and portfolio ID:", portfolioId);
            const portfolioRef = doc(firestore, "profiles", userId, "portfolio", portfolioId);
            const portfolioSnap = await getDoc(portfolioRef);

            if (portfolioSnap.exists()) {
                return { id: portfolioSnap.id, ...portfolioSnap.data() };
            } else {
                INFO("No such portfolio found!");
                return null;
            }
        } catch (error) {
            ERROR("Error getting portfolio:", error);
            throw error;
        }
    };

    static CONNECTION_CATEGORIES = {
        trustedColleagues: 'trustedColleagues',
        localPros: 'localPros',
        pastClients: 'pastClients',
        interestedHomeowners: 'interestedHomeowners'
    };

    _ensureConnectionsObject(profile) {
        const base = {
            [ProfileApi.CONNECTION_CATEGORIES.trustedColleagues]: [],
            [ProfileApi.CONNECTION_CATEGORIES.localPros]: [],
            [ProfileApi.CONNECTION_CATEGORIES.pastClients]: [],
            [ProfileApi.CONNECTION_CATEGORIES.interestedHomeowners]: []
        };
        const connections = profile?.connections ? { ...base, ...profile.connections } : base;

        if (Array.isArray(profile?.recommendations) && connections.trustedColleagues.length === 0) {
            connections.trustedColleagues = [...new Set([
                ...connections.trustedColleagues,
                ...profile.recommendations
            ])];
        }

        return connections;
    }

    async getConnections(userId) {
        const profileSnap = await this.getSnap(userId);
        if (!profileSnap.exists()) return this._ensureConnectionsObject(null);

        const profile = profileSnap.data();
        return this._ensureConnectionsObject(profile);
    }

    async updateConnections(userId, changes) {
        const accountRef = doc(firestore, "profiles", userId);
        await updateDoc(accountRef, {
            connections: changes
        });
    }

    async addToConnectionCategory(userId, categoryKey, targetUserId) {
        const accountRef = doc(firestore, "profiles", userId);
        await updateDoc(accountRef, {
            [`connections.${categoryKey}`]: arrayUnion(targetUserId)
        });
    }

    async removeFromConnectionCategory(userId, categoryKey, targetUserId) {
        const accountRef = doc(firestore, "profiles", userId);
        await updateDoc(accountRef, {
            [`connections.${categoryKey}`]: arrayRemove(targetUserId)
        });
    }

    async addPastClientOnProjectComplete(contractorId, homeownerId) {
        try {
            await this.addToConnectionCategory(contractorId,
                ProfileApi.CONNECTION_CATEGORIES.pastClients, homeownerId);
            await this.addToConnectionCategory(homeownerId,
                ProfileApi.CONNECTION_CATEGORIES.trustedColleagues, contractorId);
        } catch (e) {
            ERROR("addPastClientOnProjectComplete", e);
        }
    }

    async upsertConnectionWithCategories(currentUserId, targetUserId, categories) {
        try {
            const connections = await this.getConnections(currentUserId);
            const next = { ...connections };

            Object.keys(ProfileApi.CONNECTION_CATEGORIES).forEach((key) => {
                next[key] = (next[key] || []).filter(id => id !== targetUserId);
            });
            categories.forEach(key => {
                next[key] = [...new Set([...(next[key] || []), targetUserId])];
            });

            await this.updateConnections(currentUserId, next);

            const id = currentUserId < targetUserId
                ? `${currentUserId}:${targetUserId}` : `${targetUserId}:${currentUserId}`;
            const connRef = doc(collection(firestore, "connections"), id);
            const connSnap = await getDoc(connRef);
            if (connSnap.exists()) {
                await updateDoc(connRef, {
                    users: [currentUserId, targetUserId],
                    "items.connection": true
                });
            } else {
                await setDoc(connRef, {
                    users: [currentUserId, targetUserId],
                    items: { connection: true }
                }, { merge: true });
            }

            return next;
        } catch (e) {
            ERROR("upsertConnectionWithCategories", e);
            throw e;
        }
    }

    async getFriendshipStatus(currentUserId, targetUserId) {
        const id = currentUserId < targetUserId
            ? `${currentUserId}:${targetUserId}` : `${targetUserId}:${currentUserId}`;
        const connRef = doc(collection(firestore, "connections"), id);
        const snap = await getDoc(connRef);
        if (!snap.exists()) return null;
        const data = snap.data();
        const items = data?.items || {};
        const friends = items?.friends || null;
        return friends || null;
    }

    async getConfirmedFriends(userId) {
        try {
            const connectionsRef = collection(firestore, "connections");
            const q = query(connectionsRef, where("users", "array-contains", userId));
            const snapshot = await getDocs(q);
            const res = [];
            snapshot.forEach((docSnap) => {
                const data = docSnap.data();
                const other = (data.users || []).find(u => u !== userId);
                const status = data?.items?.friends?.status;
                if (other && status === 'confirmed') res.push(other);
            });
            return res;
        } catch (e) {
            ERROR("getConfirmedFriends", e);
            return [];
        }
    }

    async addFriend(currentUserId, targetUserId) {
        const id = currentUserId < targetUserId
            ? `${currentUserId}:${targetUserId}` : `${targetUserId}:${currentUserId}`;
        const connRef = doc(collection(firestore, "connections"), id);
        const snap = await getDoc(connRef);

        const items = {
            ...((snap.exists() && snap.data().items) || {}),
            friends: {
                status: 'pending',
                initiatedBy: currentUserId,
                updatedAt: serverTimestamp()
            }
        };

        if (snap.exists()) {
            await updateDoc(connRef, { users: [currentUserId, targetUserId], items });
        } else {
            await setDoc(connRef, { users: [currentUserId, targetUserId], items });
        }
    }

    async getIncomingFriendRequests(userId) {
        const connectionsRef = collection(firestore, "connections");
        const q = query(connectionsRef, where("users", "array-contains", userId));
        const snapshot = await getDocs(q);
        const incoming = [];

        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const users = data.users || [];
            const other = users.find(u => u !== userId);
            const friends = data?.items?.friends;
            if (other && friends?.status === 'pending' && friends.initiatedBy !== userId) {
                incoming.push({ id: docSnap.id, otherUserId: other });
            }
        });

        return incoming;
    }
}

export const
    profileApi = new ProfileApi();