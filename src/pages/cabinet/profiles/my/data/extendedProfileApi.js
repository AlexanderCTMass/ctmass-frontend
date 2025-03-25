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
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where
} from "firebase/firestore";
import {deleteObject, getDownloadURL, ref, uploadBytes} from "firebase/storage";
import toast from "react-hot-toast";
import {v4 as uuidv4} from "uuid";
import {FriendStatus} from "../ProfileConst"
import {ERROR, INFO} from "src/libs/log";
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

            const newReviewRef = doc(reviewsCollection);
            const reviewId = newReviewRef.id;

            const data = {id: reviewId, text, rating, authorId, date: serverTimestamp(), projectId};
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

    async updateProfileInfo(userId, updates) {
        const profileRef = doc(firestore, "profiles", userId);
        await updateDoc(profileRef, {
            ...updates,
            updatedAt: new Date().toISOString()
        });
    }

    async addSpecialties(userId, specialtyId) {
        try {
            const specialtiesRef = doc(firestore, "userSpecialties", userId + ":" + specialtyId);

            const dataToSave = {
                specialty: specialtyId,
                user: userId
            };

            await setDoc(specialtiesRef, dataToSave);

            console.log("Specialty added successfully!");
        } catch (error) {
            console.error("Error adding specialty:", error);
            throw error;
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

    async updateEducation(userId, educationId, updatedData, previousData) {
        try {
            const educationRef = doc(firestore, "profiles", userId, "education", educationId);

            // 1. Подготовка данных для обновления
            const educationToUpdate = {
                ...updatedData,
            };

            if (updatedData.certificates || previousData.certificates) {
                const previousCerts = previousData.certificates || [];
                const updatedCerts = updatedData.certificates || [];

                const certsToDelete = previousCerts.filter(pCert =>
                    !updatedCerts.some(uCert => uCert.url === pCert.url)
                );

                await Promise.all(
                    certsToDelete.map(cert => {
                        if (cert.url?.startsWith('http')) {
                            return deleteObject(ref(storage, cert.url)).catch(console.warn);
                        }
                        return Promise.resolve();
                    })
                );

                const processedCerts = [];
                for (const [index, cert] of updatedCerts.entries()) {
                    if (cert.url && !cert.url.startsWith("http")) {
                        const file = await fetch(cert.url).then(res => res.blob());
                        const uploadedUrl = await this.uploadImage(
                            file,
                            userId,
                            index
                        );
                        processedCerts.push({...cert, url: uploadedUrl});
                    } else {
                        processedCerts.push(cert);
                    }
                }

                educationToUpdate.certificates = processedCerts;
            }

            await setDoc(educationRef, educationToUpdate, {merge: true});

            return educationToUpdate;

        } catch (error) {
            console.error(`Error updating education ${educationId}:`, error);
            throw error;
        }
    }


    async deleteEducation(userId, educationId, certificates = []) {
        try {
            const educationRef = doc(firestore, "profiles", userId, "education", educationId);

            if (certificates.length > 0) {
                const deletePromises = certificates.map(cert => {
                    if (cert?.url?.startsWith('http')) {
                        const fileRef = ref(storage, cert.url);
                        return deleteObject(fileRef).catch(error => {
                            console.error(`Failed to delete certificate ${cert.url}:`, error);
                        });
                    }
                    return Promise.resolve();
                });

                await Promise.all(deletePromises);
            }

            await deleteDoc(educationRef);
        } catch (error) {
            console.error("Error deleting education:", error);
            throw error;
        }
    }

    async addEducation(userId, educationData) {
        try {
            const educationRef = collection(firestore, "profiles", userId, "education");

            const newEducationRef = doc(educationRef);

            const educationToAdd = {
                ...educationData,
                id: newEducationRef.id
            };

            if (educationData.certificates && educationData.certificates.length > 0) {
                const uploadedCertificates = [];

                for (let i = 0; i < educationData.certificates.length; i++) {
                    const cert = educationData.certificates[i]
                    if (cert.url && !cert.url.startsWith("http")) {
                        try {
                            const file = await fetch(cert.url).then(res => res.blob());
                            const uploadedUrl = await this.uploadImage(file, userId, i);
                            uploadedCertificates.push({...cert, url: uploadedUrl});
                        } catch (error) {
                            console.error("Error uploading certificate:", error);
                            throw error;
                        }
                    } else {
                        uploadedCertificates.push(cert);
                    }
                }
                educationToAdd.certificates = uploadedCertificates;
            }

            await setDoc(newEducationRef, educationToAdd);
            return educationToAdd;
        } catch (error) {
            console.error("Error adding education:", error);
            throw error;
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

    async updatePortfolio(userId, portfolioId, updatedData, existingImages = []) {
        try {
            const portfolioRef = doc(firestore, "profiles", userId, "portfolio", portfolioId);

            // 1. Обработка изображений
            const imagesToProcess = updatedData.images || [];
            const processedImages = [];
            let newThumbnail = null;

            // Удаление изображений, которые были удалены из портфолио
            const existingImageUrls = existingImages.map(img => img.url);
            const currentImageUrls = imagesToProcess.map(img => img.url);
            const imagesToDelete = existingImageUrls.filter(url => !currentImageUrls.includes(url));

            await Promise.all(
                imagesToDelete.map(url => {
                    if (url.startsWith('https://firebasestorage.googleapis.com')) {
                        const fileRef = ref(storage, url);
                        return deleteObject(fileRef).catch(console.error);
                    }
                    return Promise.resolve();
                })
            );

            // Загрузка новых изображений
            for (const image of imagesToProcess) {
                if (image.url && image.url.startsWith('http')) {
                    processedImages.push(image);
                    continue;
                }

                try {
                    const file = await fetch(image.url).then(res => res.blob());
                    const uploadedUrl = await this.uploadPortfolioImage(file, userId);

                    const processedImage = {...image, url: uploadedUrl};
                    processedImages.push(processedImage);

                    // Если это изображение выбрано как thumbnail
                    if (updatedData.thumbnail === image.url) {
                        newThumbnail = uploadedUrl;
                    }
                } catch (error) {
                    console.error('Error uploading image:', error);
                    throw error;
                }
            }

            const finalThumbnail = newThumbnail || (processedImages[0]?.url) || updatedData.thumbnail;

            const portfolioData = {
                ...updatedData,
                images: processedImages,
                thumbnail: finalThumbnail,
                updatedAt: new Date().toISOString()
            };

            await setDoc(portfolioRef, portfolioData, {merge: true});

            console.log('Portfolio updated successfully!');
            return portfolioData;
        } catch (error) {
            console.error('Error updating portfolio:', error);
            throw error;
        }
    }


    async addPortfolio(userId, portfolio) {
        try {
            const portfolioRef = collection(firestore, "profiles", userId, "portfolio");

            const newPortfolioRef = doc(portfolioRef);
            portfolio.id = newPortfolioRef.id;

            let thumbnail = null;
            for (let i = 0; i < portfolio.images.length; i++) {
                try {
                    const file = await fetch(portfolio.images[i].url)
                        .then((res) => res.blob())
                        .catch((err) => {
                            console.error("Error fetching image:", err.message);
                            throw err;
                        });

                    portfolio.images[i].url = await this.uploadPortfolioImage(file, userId);

                    // Если это изображение выбрано как thumbnail, сохраняем его URL
                    if (portfolio.thumbnail && (portfolio.images[i].url === portfolio.thumbnail)) {
                        thumbnail = portfolio.images[i].url;
                    }
                } catch (error) {
                    console.error("Error uploading file:", error);
                    throw error;
                }
            }

            // Устанавливаем thumbnail (первое изображение, если не указано другое)
            portfolio.thumbnail = thumbnail || portfolio.images[0]?.url;

            await setDoc(newPortfolioRef, portfolio);

            return portfolio;
        } catch (error) {
            console.error("Error adding portfolio:", error);
            throw error;
        }
    }

    async deletePortfolio(userId, portfolioId, portfolioImages) {
        try {
            const portfolioRef = doc(firestore, "profiles", userId, "portfolio", portfolioId);
            await deleteDoc(portfolioRef);

            if (portfolioImages && portfolioImages.length > 0) {
                const deleteImagePromises = portfolioImages.map((image) => {
                    if (image.url) {
                        const fileRef = ref(storage, image.url);
                        return deleteObject(fileRef);
                    }
                    return Promise.resolve();
                });
                await Promise.all(deleteImagePromises);
            }

            console.log("Portfolio and associated images deleted successfully!");
        } catch (error) {
            console.error("Error deleting portfolio:", error);
            throw error;
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
}

export const
    extendedProfileApi = new ExtendedProfileApi();