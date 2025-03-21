import {firestore, storage} from "src/libs/firebase";
import {
    addDoc,
    arrayUnion,
    collection,
    deleteDoc,
    deleteField,
    doc,
    getDoc,
    getDocs,
    increment,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
    writeBatch
} from "firebase/firestore";
import {deleteObject, getDownloadURL, ref, uploadBytes} from "firebase/storage";
import toast from "react-hot-toast";
import {v4 as uuidv4} from "uuid";
import {FriendStatus} from "../ProfileConst"
import {ERROR, INFO} from "src/libs/log";
import {profileApi} from "src/api/profile";
import {profileService} from "src/service/profile-service";


class ExtendedProfileApi {

    async getUserData(userId, allSpecialties) {
        try {
            let [profile, specialties, education, reviews, portfolio, friends] = await Promise.all([
                this.getProfile(userId),
                this.getUserSpecialties(userId),
                this.getEducation(userId),
                this.getReviews(userId),
                this.getPortfolio(userId),
                this.getFriends(userId, allSpecialties),
            ]);

            profile = profileService.updateRatingInfo(profile, reviews);

            const data = {profile, specialties, education, reviews, portfolio, friends};
            INFO("ExtendedProfileApi getUserData", data);
            return data;
        } catch (error) {
            ERROR("Error fetching user data:", error);
            throw error;
        }
    }

    async getProfile(userId) {
        try {
            const profileRef = doc(firestore, "profiles", userId);
            const profileSnapshot = await getDoc(profileRef);

            if (profileSnapshot.exists()) {
                return profileSnapshot.data(); // Возвращаем данные профиля
            } else {
                throw new Error("Profile not found");
            }
        } catch (error) {
            ERROR("Error fetching profile:", error);
            throw error;
        }
    }

    async getPortfolio(userId) {
        try {
            const portfolioRef = collection(firestore, "profiles", userId, "portfolio");
            const portfolioSnapshot = await getDocs(portfolioRef);

            const portfolio = [];
            portfolioSnapshot.forEach((doc) => {
                portfolio.push(doc.data());
            });

            return portfolio; // Возвращаем массив портфолио
        } catch (error) {
            ERROR("Error fetching portfolio:", error);
            throw error;
        }
    }

    async addReviewComment(profileId, reviewId, newComment) {
        try {
            const reviewRef = doc(firestore, "profiles", profileId, "reviews", reviewId);

            // Сохраняем комментарий в Firestore (без authorData)
            await updateDoc(reviewRef, {
                comments: arrayUnion(newComment)
            });
        } catch (error) {
            ERROR("Error fetching review:", error);
            throw error;
        }
    }

    async addReview(profileId, projectId, text, rating, authorId, transaction = undefined) {
        try {
            INFO("addReview", profileId, text, rating, authorId);
            const reviewsCollection = collection(firestore, `profiles/${profileId}/reviews`)
            const data = {text, rating, authorId, date: serverTimestamp(), projectId};
            if (transaction) {
                transaction.add(reviewsCollection, data);
            } else {
                await addDoc(reviewsCollection, data);
            }
        } catch (error) {
            ERROR("Error fetching review:", error);
            throw error;
        }
    }

    async getFriends(currentUserId, allSpecialties) {
        if (!allSpecialties || allSpecialties.length === 0) {
            return [];
        }
        try {
            // Получаем все связи текущего пользователя
            const connectionsRef = collection(firestore, "connections");
            const q = query(connectionsRef, where("users", "array-contains", currentUserId));
            const querySnapshot = await getDocs(q);

            const friendIds = [];
            const connectionsData = [];

            querySnapshot.forEach((doc) => {
                const connectionData = doc.data();
                const friendId = connectionData.users.find(id => id !== currentUserId);
                if (friendId) {
                    const hasConnection = connectionData.items.connection === true;
                    const hasFriends = connectionData.items.friends !== null && connectionData.items.friends !== undefined;
                    const hasRecommendations = Array.isArray(connectionData.items.recommendations) && connectionData.items.recommendations.length > 0;

                    if (hasConnection || hasFriends || hasRecommendations) {
                        friendIds.push(friendId);
                        connectionsData.push({
                            friendId,
                            connection: connectionData.items.connection || false,
                            friends: connectionData.items.friends || null,
                            recommendations: connectionData.items.recommendations || []
                        });
                    }
                }
            });

            if (friendIds.length === 0) return [];

            // Получаем данные всех связанных пользователей
            const usersRef = collection(firestore, "profiles");
            const usersQuery = query(usersRef, where("__name__", "in", friendIds));
            const usersSnapshot = await getDocs(usersQuery);

            const friends = usersSnapshot.docs.map((userDoc) => {
                const userData = userDoc.data();
                const friendId = userDoc.id;
                const connectionInfo = connectionsData.find(conn => conn.friendId === friendId);

                if (connectionInfo) {
                    const type = [];
                    if (connectionInfo.connection) type.push("connection");
                    if (connectionInfo.friends?.status === FriendStatus.confirmed) type.push("friend_confirmed");
                    if (connectionInfo.friends?.status === FriendStatus.pending) type.push({
                        status: "friend_pending",
                        initiatedBy: connectionInfo.friends.initiatedBy
                    });

                    connectionInfo.recommendations
                        .forEach(recommendation => {
                            type.push({status: "recommendations", initiatedBy: recommendation.from});
                        });

                    return {
                        id: friendId,
                        name: userData.businessName,
                        avatar: userData.avatar,
                        specName: userData.mainSpecId,
                        rating: userData.rating,
                        reviewsCount: userData.reviewsCount,
                        location: userData.address,
                        link: `/cabinet/profiles/${userData.id}`,
                        type
                    };
                }
                return null;
            }).filter(Boolean);


            friends.forEach(friend => {
                if (friend.specName && allSpecialties?.byId?.[friend.specName]) {
                    friend.specName = allSpecialties.byId[friend.specName].label || "Unknown";
                } else {
                    friend.specName = "Unknown";
                }
            });

            return friends;
        } catch (error) {
            ERROR("Error fetching friends:", error);
            throw error;
        }
    }

    async addComment(profileId, projectId, imageId, newComment) {
        try {
            const projectRef = doc(firestore, "profiles", profileId, "portfolio", projectId);

            const projectDoc = await getDoc(projectRef);

            const projectData = projectDoc.data();
            const images = projectData.images || [];

            const imageIndex = images.findIndex(image => image.id === imageId);

            const updatedImages = [...images];
            updatedImages[imageIndex] = {
                ...updatedImages[imageIndex],
                comments: [...(updatedImages[imageIndex].comments || []), newComment]
            };

            await updateDoc(projectRef, {
                images: updatedImages
            });
        } catch (error) {
            ERROR("Error adding comment:", error);
            throw error;
        }
    }

    async getReviews(userId) {
        try {
            const reviewsRef = collection(firestore, "profiles", userId, "reviews");
            const reviewsSnapshot = await getDocs(reviewsRef);

            const reviews = [];
            reviewsSnapshot.forEach((doc) => {
                reviews.push(doc.data());
            });
            INFO("getReviews", userId, reviews);
            return reviews;
        } catch (error) {
            ERROR("Error fetching reviews:", error);
            throw error;
        }
    }

    async getEducation(userId) {
        try {
            const educationRef = collection(firestore, "profiles", userId, "education");
            const educationSnapshot = await getDocs(educationRef);

            const education = [];
            educationSnapshot.forEach((doc) => {
                education.push(doc.data());
            });

            return education;
        } catch (error) {
            ERROR("Error fetching education:", error);
            throw error;
        }
    }

    async getUserSpecialties(userId) {
        try {
            const specialtiesRef = collection(firestore, "userSpecialties");

            const querySnapshot = await getDocs(
                query(specialtiesRef, where("user", "==", userId))
            );

            const specialties = [];
            querySnapshot.forEach((doc) => {
                specialties.push(doc.data());
            });

            return specialties.map(specialty => {
                return {
                    specialty: specialty?.specialty,
                    user: userId,
                    services: specialty?.services || []
                };
            });
        } catch (error) {
            ERROR("Error fetching specialties:", error);
            throw error;
        }
    }

    async updateProfile(userId, profileData, batch) {
        console.info("updateProfile")
        const profileRef = doc(firestore, "profiles", userId);
        batch.set(profileRef, profileData, {merge: true});
    }

    async deleteProfile(userId, portfolioId) {
        const profileRef = doc(firestore, "profiles", userId, "portfolio", portfolioId);
        const itemDoc = await getDoc(profileRef);

        if (itemDoc.exists()) {
            const item = itemDoc.data();

            if (item.images && item.images.length > 0) {
                const deletePromises = item.images.map((img) => {
                    if (img.url) {
                        const fileRef = ref(storage, img.url);
                        return deleteObject(fileRef);
                    }
                    return Promise.resolve();
                });

                try {
                    await Promise.all(deletePromises);
                } catch (error) {
                    ERROR("Error deleting images from Storage:", error);
                    throw error;
                }
            }
            await deleteDoc(profileRef);
        }
    }

    async updateSpecialties(specialties, batch, userId, initSpecialties) {
        const specialtiesRef = collection(firestore, "userSpecialties");

        const initIds = new Set(initSpecialties.map(spec => spec.specialty));
        const updatedIds = new Set(specialties.map(spec => spec.specialty));

        const idsToDelete = [...initIds].filter(id => !updatedIds.has(id));

        for (const id of idsToDelete) {
            await this.deleteSpecialties(userId, id);
        }

        for (const spec of specialties) {
            const initSpec = initSpecialties.find(s => s.specialty === spec.specialty);

            const specRef = doc(specialtiesRef, userId + ":" + spec.specialty);

            if (initSpec && initSpec.services) {
                const initSpecIds = new Set(initSpec.services.map(service => service.specialty));
                const updatedSpecIds = new Set(spec.services.map(service => service.specialty));

                const servToDelete = [...initSpecIds].filter(id => !updatedSpecIds.has(id));

                const deletePromises = servToDelete.map(servId => {
                    const servToDelete = initSpec.services.find(service => service.specialty === servId);
                    if (servToDelete?.images) {
                        return Promise.all(servToDelete.images.map(image => {
                            const fileRef = ref(storage, image);
                            return deleteObject(fileRef);
                        }));
                    }
                    return Promise.resolve();
                });

                try {
                    await Promise.all(deletePromises);
                } catch (error) {
                    ERROR("Error deleting images from Storage:", error);
                    throw error;
                }
            }

            if (spec.services && Array.isArray(spec.services)) {
                for (let i = 0; i < spec.services.length; i++) {
                    const serv = spec.services[i];

                    if (serv.images && Array.isArray(serv.images)) {
                        const uploadPromises = serv.images.map(async (s, index) => {
                            if (!s.startsWith("http")) {
                                try {
                                    // Загружаем изображение, если оно не является URL
                                    const file = await fetch(s)
                                        .then((res) => res.blob())
                                        .catch((err) => {
                                            ERROR("Error fetching image:", err.message);
                                            throw err;
                                        });

                                    // Загружаем изображение в Storage и получаем URL
                                    serv.images[index] = await this.uploadServiceImages(file, userId, `${spec.specialty}_${i}_${index}`);
                                } catch (error) {
                                    ERROR("Error uploading file:", error);
                                    throw error;
                                }
                            }
                        });

                        try {
                            await Promise.all(uploadPromises);
                        } catch (error) {
                            ERROR("Error uploading images:", error);
                            throw error;
                        }
                    }
                }
            }
            batch.set(specRef, spec);
        }
    }


    async deleteSpecialties(userId, id) {
        const specialtiesRef = doc(firestore, "userSpecialties", userId + ":" + id);
        const specDoc = await getDoc(specialtiesRef);

        if (specDoc.exists()) {
            const spec = specDoc.data();

            if (spec.services && spec.services.length > 0) {
                const deletePromises = [];

                spec.services.forEach((service) => {
                    if (service.images && service.images.length > 0) {
                        service.images.forEach((image) => {
                            const fileRef = ref(storage, image);
                            deletePromises.push(deleteObject(fileRef));
                        });
                    }
                });

                try {
                    await Promise.all(deletePromises);
                } catch (error) {
                    ERROR("Error deleting images from Storage:", error);
                    throw error;
                }
            }
            await deleteDoc(specialtiesRef);
        } else {
            ERROR("Document does not exist");
            throw new Error("Document does not exist");
        }
    }

    async updateEducation(userId, education, initEducation, batch) {
        const educationRef = collection(firestore, "profiles", userId, "education");

        const initIds = new Set(initEducation.map(edu => edu.id));
        const updatedIds = new Set(education.map(edu => edu.id));

        const idsToDelete = [...initIds].filter(id => !updatedIds.has(id));

        for (const id of idsToDelete) {
            await this.deleteEducationItem(userId, id);
        }

        for (const edu of education) {
            const initEdu = initEducation.find(e => e.id === edu.id);
            const eduRef = edu.id ? doc(educationRef, edu.id) : doc(educationRef);

            if (!edu.id) {
                edu.id = eduRef.id;
            }

            if (initEdu && initEdu.certificates) {
                const initCertIds = new Set(initEdu.certificates.map(cert => cert.id));
                const updatedCertIds = new Set(edu.certificates.map(cert => cert.id));

                const certsToDelete = [...initCertIds].filter(id => !updatedCertIds.has(id));

                const deletePromises = certsToDelete.map(certId => {
                    const certToDelete = initEdu.certificates.find(cert => cert.id === certId);
                    if (certToDelete?.url) {
                        const fileRef = ref(storage, certToDelete.url);
                        return deleteObject(fileRef);
                    }
                    return Promise.resolve();
                });

                try {
                    await Promise.all(deletePromises);
                } catch (error) {
                    ERROR("Error deleting images from Storage:", error);
                    throw error;
                }
            }

            if (edu.certificates && edu.certificates.length > 0) {
                for (let i = 0; i < edu.certificates.length; i++) {
                    const cert = edu.certificates[i];

                    if (cert.url && !cert.url.startsWith("http")) {
                        try {
                            const file = await fetch(cert.url)
                                .then((res) => res.blob())
                                .catch((err) => {
                                    ERROR("Error fetching image:", err.message);
                                    throw err;
                                });

                            cert.url = await this.uploadImage(file, userId, i);
                        } catch (error) {
                            ERROR("Error uploading file:", error);
                            throw error;
                        }
                    }
                }
            }
            batch.set(eduRef, edu);
        }
    }

    uploadServiceImages(image, userId, i) {
        return new Promise(async (resolve, reject) => {
            try {
                if (image) {
                    const storageRef = ref(storage, `userServices/${userId}/${new Date().getTime()}_${i}`)
                    uploadBytes(storageRef, image).then((snapshot) => {
                        getDownloadURL(storageRef).then((url) => {
                            resolve(url);
                            toast.success("Images upload successfully!");
                        })
                    });
                }
            } catch (err) {
                reject(new Error('Internal server error'));
            }
        });
    }

    uploadImage(image, userId, i) {
        return new Promise(async (resolve, reject) => {
            try {
                if (image) {
                    const storageRef = ref(storage, `certificates/${userId}/${new Date().getTime()}_${i}`)
                    uploadBytes(storageRef, image).then((snapshot) => {
                        getDownloadURL(storageRef).then((url) => {
                            resolve(url);
                            toast.success("Images upload successfully!");
                        })
                    });
                }
            } catch (err) {
                reject(new Error('Internal server error'));
            }
        });
    }

    async deleteEducationItem(userId, educationId) {
        const eduRef = doc(firestore, "profiles", userId, "education", educationId);
        const eduDoc = await getDoc(eduRef);

        if (eduDoc.exists()) {
            const edu = eduDoc.data();

            if (edu.certificates && edu.certificates.length > 0) {
                const deletePromises = edu.certificates.map((cert) => {
                    if (cert.url) {
                        const fileRef = ref(storage, cert.url);
                        return deleteObject(fileRef);
                    }
                    return Promise.resolve();
                });

                try {
                    await Promise.all(deletePromises);
                } catch (error) {
                    ERROR("Error deleting images from Storage:", error);
                    throw error;
                }
            }

            await deleteDoc(eduRef);
        }
    }

    async updateReviews(userId, reviews, batch) {
        const reviewsRef = collection(firestore, "profiles", userId, "reviews");
        for (const review of reviews) {
            const reviewRef = doc(reviewsRef, review.id);
            batch.set(reviewRef, review);
        }
    }

    async updatePortfolio(userId, portfolio, initPortfolio, batch) {
        console.info("updatePortfolio")
        const portfolioRef = collection(firestore, "profiles", userId, "portfolio");


        const initIds = new Set(initPortfolio?.map(item => item.id));
        const updatedIds = new Set(portfolio?.map(item => item.id));

        const idsToDelete = [...initIds].filter(id => !updatedIds.has(id));

        for (const id of idsToDelete) {
            await this.deleteProfile(userId, id);
        }


        for (const item of portfolio) {
            const initPort = initPortfolio.find(e => e.id === item.id);
            const itemRef = item.id.toString() ? doc(portfolioRef, item.id.toString()) : doc(portfolioRef);

            // Если ID был сгенерирован, сохраняем его обратно в объект
            if (!item.id) {
                item.id = itemRef.id;
            }

            if (initPort && initPort.images) {
                const initPortIds = new Set(initPort.images.map(image => image.id));
                const updatedPortIds = new Set(item.images.map(image => image.id));

                const imageToDelete = [...initPortIds].filter(id => !updatedPortIds.has(id));

                const deletePromises = imageToDelete.map(imgId => {
                    const imgToDelete = initPort.images.find(img => img.id === imgId);
                    if (imgToDelete?.url) {
                        const fileRef = ref(storage, imgToDelete.url);
                        return deleteObject(fileRef);
                    }
                    return Promise.resolve();
                });

                try {
                    await Promise.all(deletePromises);
                } catch (error) {
                    ERROR("Error deleting images from Storage:", error);
                    throw error;
                }
            }

            let thumbnail = null;
            for (let i = 0; i < item.images.length; i++) {
                if (!item.images[i].url.startsWith("http")) {
                    try {
                        const file = await fetch(item.images[i].url)
                            .then((res) => res.blob())
                            .catch((err) => {
                                ERROR("Error fetching image:", err.message);
                                throw err;
                            });
                        if (item.thumbnail && (item.images[i].url === item.thumbnail)) {
                            item.images[i].url = await this.uploadPortfolioImage(file, userId);
                            thumbnail = item.images[i].url;
                        } else {
                            item.images[i].url = await this.uploadPortfolioImage(file, userId);
                        }
                    } catch (error) {
                        ERROR("Error uploading file:", error);
                        throw error;
                    }
                }
                item.thumbnail = thumbnail || item.images[0]?.url;
            }
            batch.set(itemRef, item);
        }
    }

    uploadPortfolioImage = async (image, userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                if (image) {
                    const storageRef = ref(storage, `/portfolio/${userId}` + uuidv4() + image.name);
                    uploadBytes(storageRef, image).then((snapshot) => {
                        getDownloadURL(storageRef).then((url) => {
                            resolve(url);
                            toast.success("Images upload successfully!");
                        })
                    });
                }
            } catch (err) {
                reject(new Error('Internal server error'));
            }
        });
    }

    async deletePortfolio(userId, batch) {
        const portfolioRef = collection(firestore, "profiles", userId, "portfolio");
        const portfolioSnapshot = await getDocs(portfolioRef);
        portfolioSnapshot.forEach((doc) => batch.delete(doc.ref));
    }

    async addFriend(initiatedUserId, secondUserId) {
        const friendsRef = collection(firestore, "connections");
        const friendId = initiatedUserId < secondUserId ? `${initiatedUserId}:${secondUserId}` : `${secondUserId}:${initiatedUserId}`;
        const friendRef = doc(friendsRef, friendId);

        const docSnapshot = await getDoc(friendRef);

        if (docSnapshot.exists()) {
            const existingData = docSnapshot.data();
            const users = existingData.users || [initiatedUserId, secondUserId];

            await updateDoc(friendRef, {
                "items.friends.status": FriendStatus.pending,
                "items.friends.initiatedBy": initiatedUserId,
                "users": users
            });
        } else {
            await setDoc(friendRef, {
                items: {
                    friends: {
                        status: FriendStatus.pending,
                        initiatedBy: initiatedUserId,
                    },
                },
                users: [initiatedUserId, secondUserId]
            }, {merge: true});
        }
    }

    async addRecommendation(fromUserId, toUserId) {
        const friendsRef = collection(firestore, "connections");
        const friendId = fromUserId < toUserId ? `${fromUserId}:${toUserId}` : `${toUserId}:${fromUserId}`;
        const friendRef = doc(friendsRef, friendId);

        const docSnapshot = await getDoc(friendRef);

        if (docSnapshot.exists()) {
            await updateDoc(friendRef, {
                "items.recommendations": arrayUnion({from: fromUserId})
            });
        } else {
            await setDoc(friendRef, {
                items: {
                    recommendations: [{from: fromUserId}]
                },
                users: [fromUserId, toUserId]
            });
        }
    }

    async removeRecommendation(currentUserId, friendId) {
        try {
            const connectionsRef = collection(firestore, "connections");
            const q = query(
                connectionsRef,
                where("users", "array-contains", currentUserId)
            );
            const querySnapshot = await getDocs(q);

            querySnapshot.forEach(async (doc) => {
                const connectionData = doc.data();
                if (connectionData.users.includes(friendId)) {
                    const updatedRecommendations = connectionData.items.recommendations.filter(
                        (rec) => rec.from !== currentUserId
                    );

                    await updateDoc(doc.ref, {
                        "items.recommendations": updatedRecommendations,
                    });
                }
            });
            return true;
        } catch (error) {
            ERROR("Error removing recommendation:", error);
            throw error;
        }
    }

    async confirmFriend(initiatedUserId, secondUserId) {
        const friendsRef = collection(firestore, "connections");
        const friendId = initiatedUserId < secondUserId ? `${initiatedUserId}:${secondUserId}` : `${secondUserId}:${initiatedUserId}`;
        const friendRef = doc(friendsRef, friendId);

        await updateDoc(friendRef, {
            "items.friends.status": FriendStatus.confirmed,
        });
    }

    async removeFriend(currentUserId, friendId) {
        try {
            const connectionsRef = collection(firestore, "connections");

            const connectionId = currentUserId < friendId
                ? `${currentUserId}:${friendId}`
                : `${friendId}:${currentUserId}`;

            const connectionRef = doc(connectionsRef, connectionId);

            await updateDoc(connectionRef, {
                "items.friends": deleteField(),
            });

            return true;
        } catch (error) {
            ERROR("Error removing friend:", error);
            throw error;
        }
    }

    async like(projectId, imageId, userId) {
        try {
            const projectRef = doc(firestore, "profiles", userId, "portfolio", projectId);
            const projectDoc = await getDoc(projectRef);

            if (projectDoc.exists()) {
                const projectData = projectDoc.data();
                const updatedImages = projectData.images.map(image => {
                    if (image.id === imageId) {
                        // Инициализируем likes как массив, если он отсутствует или не является массивом
                        const likes = Array.isArray(image.likes) ? image.likes : [];
                        const hasLiked = likes.includes(userId);
                        return {
                            ...image,
                            likes: hasLiked
                                ? likes.filter(id => id !== userId) // Удаляем лайк
                                : [...likes, userId], // Добавляем лайк
                        };
                    }
                    return image;
                });

                await updateDoc(projectRef, {images: updatedImages});
            }
        } catch (error) {
            ERROR("Error updating likes:", error);
        }
    }

    async updateUserData(userId, updatesData, initData) {
        try {
            const batch = writeBatch(firestore);

            const updatesProfile = updatesData.profile;
            const initProfile = initData.profile;
            if (initProfile.about !== updatesProfile.about
                || initProfile.address !== updatesProfile.address
                || initProfile.avatar !== updatesProfile.avatar
                || initProfile.businessName !== updatesProfile.businessName
                || initProfile.busyUntil !== updatesProfile.busyUntil
                || initProfile.mainSpecId !== updatesProfile.mainSpecId)
                await this.updateProfile(userId, updatesData.profile, batch);
            if (!this.deepEqual(initData.specialties, updatesData.specialties))
                await this.updateSpecialties(updatesData.specialties, batch, userId, initData.specialties);
            if (!this.deepEqual(initData.education, updatesData.education))
                await this.updateEducation(userId, updatesData.education, initData.education, batch);
            if (!this.deepEqual(initData.portfolio, updatesData.portfolio))
                await this.updatePortfolio(userId, updatesData.portfolio, initData.portfolio, batch);

            await batch.commit();
        } catch (error) {
            ERROR("Error updating user data:", error);
            throw error;
        }
    }

    deepEqual(obj1, obj2) {
        // Если оба объекта являются null или undefined, они равны
        if (obj1 === null && obj2 === null) return true;
        if (obj1 === undefined && obj2 === undefined) return true;

        // Если один из объектов null или undefined, они не равны
        if (obj1 === null || obj2 === null) return false;
        if (obj1 === undefined || obj2 === undefined) return false;

        // Если типы объектов разные, они не равны
        if (typeof obj1 !== typeof obj2) return false;

        // Если это примитивы, сравниваем их значения
        if (typeof obj1 !== 'object') return obj1 === obj2;

        // Если это массивы, сравниваем их длины и элементы
        if (Array.isArray(obj1) && Array.isArray(obj2)) {
            if (obj1.length !== obj2.length) return false;
            for (let i = 0; i < obj1.length; i++) {
                if (!this.deepEqual(obj1[i], obj2[i])) return false; // Исправлено: this.deepEqual
            }
            return true;
        }

        // Если это объекты, сравниваем их ключи и значения
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);

        if (keys1.length !== keys2.length) return false;

        for (const key of keys1) {
            if (!keys2.includes(key)) return false;
            if (!this.deepEqual(obj1[key], obj2[key])) return false; // Исправлено: this.deepEqual
        }
        return true;
    }
}

export const
    extendedProfileApi = new ExtendedProfileApi();