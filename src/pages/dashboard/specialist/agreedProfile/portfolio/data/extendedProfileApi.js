import {firestore, storage} from "src/libs/firebase";
import {collection, deleteDoc, doc, getDoc, getDocs, or, query, setDoc, where, writeBatch} from "firebase/firestore";
import {dictionaryApi} from "../../../../../../api/dictionary/index";
import {deleteObject, getDownloadURL, ref, uploadBytes} from "firebase/storage";
import toast from "react-hot-toast";
import {v4 as uuidv4} from "uuid";


class ExtendedProfileApi {

    async getUserData(userId) {
        try {
            const [profile, specialties, education, reviews, portfolio, friends] = await Promise.all([
                this.getProfile(userId),
                this.getUserSpecialties(userId),
                this.getEducation(userId),
                this.getReviews(userId),
                this.getPortfolio(userId),
                this.getFriends(userId),
            ]);

            return {profile, specialties, education, reviews, portfolio, friends};
        } catch (error) {
            console.error("Error fetching user data:", error);
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
            console.error("Error fetching profile:", error);
            throw error;
        }
    }

    async getFriends(userId) {
        try {
            const friendsRef = collection(firestore, "friends");
            const querySnapshot = await getDocs(
                query(friendsRef, or(where("user1", "==", userId), where("user2", "==", userId)))
            );

            const friends = [];
            querySnapshot.forEach((doc) => {
                friends.push(doc.data());
            });

            return friends; // Возвращаем массив друзей
        } catch (error) {
            console.error("Error fetching friends:", error);
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
            console.error("Error fetching portfolio:", error);
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

            return reviews; // Возвращаем массив отзывов
        } catch (error) {
            console.error("Error fetching reviews:", error);
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

            return education; // Возвращаем массив образований
        } catch (error) {
            console.error("Error fetching education:", error);
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


            // 2. Получаем ID специализаций
            const specialtyIds = specialties.map(item => item.specialty);

            // 3. Получаем детали специализаций из API
            const allSpecialties = await dictionaryApi.getSpecialties();
            const specs = allSpecialties.filter(s => specialtyIds.includes(s.id.toString()));

            // 4. Сопоставляем данные и формируем результат
            const result = specialties.map(specialty => {
                // Находим соответствующую деталь специализации
                const specDetail = specs?.find(spec => spec.id === specialty.specialty);

                // Если деталь найдена, возвращаем объект в нужном формате
                return {
                    specialty: specialty?.specialty, // ID специализации
                    name: specDetail?.label, // Название специализации
                    services: specialties?.services || [] // Услуги
                };
            });

            return result; // Возвращаем массив специализаций
        } catch (error) {
            console.error("Error fetching specialties:", error);
            throw error;
        }
    }

    async updateProfile(userId, profileData, batch) {
        const profileRef = doc(firestore, "profiles", userId);
        batch.set(profileRef, profileData, {merge: true});
    }

    async deleteProfile(userId) {
        const profileRef = doc(firestore, "profiles", userId);
        await deleteDoc(profileRef);
    }

    async updateSpecialties(specialties, batch, userId) {
        const specialtiesRef = collection(firestore, "userSpecialties");
        for (const specialty of specialties) {
            const specialtyRef = doc(specialtiesRef, userId + ":" + specialty.specialty);
            batch.set(specialtyRef, specialty);
        }
    }

    async deleteSpecialties(userId, batch) {
        const specialtiesRef = collection(firestore, "userSpecialties");
        const specialtiesSnapshot = await getDocs(query(specialtiesRef, where("user", "==", userId)));
        specialtiesSnapshot.forEach((doc) => batch.delete(doc.ref));
    }

    dataURLtoBlob(dataURL) {
        const arr = dataURL.split(','); // Разделяем строку на части
        const mime = arr[0].match(/:(.*?);/)[1]; // Получаем MIME-тип
        const bstr = atob(arr[1]); // Декодируем base64
        let n = bstr.length;
        const u8arr = new Uint8Array(n); // Создаем массив байт

        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }

        return new Blob([u8arr], {type: mime}); // Создаем Blob
    }

    async updateEducation(userId, education, batch) {
        const educationRef = collection(firestore, "profiles", userId, "education");

        for (const edu of education) {
            if (edu.isDeleted) {
                // Удаляем запись и связанные изображения
                await this.deleteEducationItem(userId, edu.id);
                continue; // Пропускаем дальнейшую обработку
            }

            const eduRef = edu.id ? doc(educationRef, edu.id) : doc(educationRef);

            // Если ID был сгенерирован, сохраняем его обратно в объект edu
            if (!edu.id) {
                edu.id = eduRef.id;
            }

            // Если есть certificates
            if (edu.certificates && edu.certificates.length > 0) {
                for (let i = 0; i < edu.certificates.length; i++) {
                    const cert = edu.certificates[i];

                    if (cert.url && !cert.url.startsWith("http")) {
                        try {
                            const file = await fetch(cert.url)
                                .then((res) => res.blob())
                                .catch((err) => {
                                    console.error("Error fetching image:", err.message);
                                    throw err;
                                });

                            cert.url = await this.uploadImage(file, userId, i);
                        } catch (error) {
                            console.error("Error uploading file:", error);
                            throw error;
                        }
                    }
                }
            }

            // Обновляем документ в Firestore
            batch.set(eduRef, edu);
        }
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

            // Удаляем связанные изображения из Storage
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
                    console.error("Error deleting images from Storage:", error);
                    throw error;
                }
            }

            // Удаляем документ из Firestore
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

    async deleteReviews(userId, batch) {
        const reviewsRef = collection(firestore, "profiles", userId, "reviews");
        const reviewsSnapshot = await getDocs(reviewsRef);
        reviewsSnapshot.forEach((doc) => batch.delete(doc.ref));
    }

    async updatePortfolio(userId, portfolio, batch) {
        const portfolioRef = collection(firestore, "profiles", userId, "portfolio");
        for (const item of portfolio) {
            const itemRef = item.id.toString() ? doc(portfolioRef, item.id.toString()) : doc(portfolioRef);

            // Если ID был сгенерирован, сохраняем его обратно в объект
            if (!item.id) {
                item.id = itemRef.id;
            }

            if (item.images && item.images.length > 0) {
                let thumbnail = null;
                for (let i = 0; i < item.images.length; i++) {
                    if (!item.images[i].url.startsWith("http")) {
                        const file = await fetch(item.images[i].url)
                            .then((res) => res.blob())
                            .catch((err) => {
                                console.error("Error fetching image:", err.message);
                                throw err;
                            });
                        if (item.thumbnail && (item.images[i].url === item.thumbnail)) {
                            item.images[i].url = await this.uploadPortfolioImage(file, userId);
                            thumbnail = item.images[i].url;
                        } else {
                            item.images[i].url = await this.uploadPortfolioImage(file, userId);
                        }
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

    async addFriend(user1Id, user2Id) {
        const friendsRef = collection(firestore, "friends");
        const friendId = user1Id < user2Id ? `${user1Id}_${user2Id}` : `${user2Id}_${user1Id}`;
        const friendRef = doc(friendsRef, friendId);
        await setDoc(friendRef, {user1Id, user2Id});
    }

    async removeFriend(user1Id, user2Id) {
        const friendsRef = collection(firestore, "friends");
        const friendId = user1Id < user2Id ? `${user1Id}_${user2Id}` : `${user2Id}_${user1Id}`;
        const friendRef = doc(friendsRef, friendId);
        await deleteDoc(friendRef);
    }

    async updateUserData(userId, updates) {
        try {
            const batch = writeBatch(firestore);

            if (updates.profile)
                await this.updateProfile(userId, updates.profile, batch);
            if (updates.specialties)
                await this.updateSpecialties(updates.specialties, batch, userId);
            if (updates.education)
                await this.updateEducation(userId, updates.education, batch);
            if (updates.portfolio && updates.portfolio.length > 0)
                await this.updatePortfolio(userId, updates.portfolio, batch);

            await batch.commit();
        } catch (error) {
            console.error("Error updating user data:", error);
            throw error;
        }
    }
}

export const
    extendedProfileApi = new ExtendedProfileApi();
