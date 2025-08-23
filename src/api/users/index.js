import debug from "debug";
import {
    arrayRemove,
    arrayUnion,
    collection, collectionGroup,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc
} from 'firebase/firestore';
import { firestore } from "src/libs/firebase";

const collectionName = 'profiles';
const usersCollection = collection(firestore, collectionName); // Коллекция пользователей
const logger = debug("[Users API]")

class UsersApi {
    // Создать пользователя

    createUser = async (userId, data) => {
        try {
            const userDoc = doc(usersCollection, userId);
            await setDoc(userDoc, { ...data, notifications: [] }); // Пустой массив для уведомлений
            logger(`User ${userId} created`);
        } catch (error) {
            logger('Error creating user:', error);
            throw error;
        }
    };

    // Прочитать данные пользователя

    getUser = async (userId) => {
        try {
            const userDoc = doc(usersCollection, userId);
            const snapshot = await getDoc(userDoc);
            if (snapshot.exists()) {
                return snapshot.data();
            } else {
                logger(`User ${userId} not found`);
                return null;
            }
        } catch (error) {
            logger('Error getting user:', error);
            throw error;
        }
    };

    // Обновить данные пользователя

    updateUser = async (userId, updates) => {
        try {
            const userDoc = doc(usersCollection, userId);
            await updateDoc(userDoc, updates);
            logger(`User ${userId} updated`);
        } catch (error) {
            logger('Error updating user:', error);
            throw error;
        }
    };

    // Удалить пользователя

    deleteUser = async (userId) => {
        try {
            const userDoc = doc(usersCollection, userId);
            await deleteDoc(userDoc);
            logger(`User ${userId} deleted`);
        } catch (error) {
            logger('Error deleting user:', error);
            throw error;
        }
    };

    // Добавить уведомление

    addNotification = async (userId, notificationKey) => {
        try {
            const userDoc = doc(usersCollection, userId);
            await updateDoc(userDoc, {
                notifications: arrayUnion(notificationKey),
            });
            logger(`Notification added to user ${userId}`);
        } catch (error) {
            logger('Error adding notification:', error);
            throw error;
        }
    };

    // Удалить уведомление

    removeNotification = async (userId, notificationKey) => {
        try {
            const userDoc = doc(usersCollection, userId);
            await updateDoc(userDoc, {
                notifications: arrayRemove(notificationKey),
            });
            logger(`Notification removed from user ${userId}`);
        } catch (error) {
            logger('Error removing notification:', error);
            throw error;
        }
    };

    addSpecialtyToUser = async (userId, specialtyId) => {
        try {
            const userDoc = doc(firestore, collectionName, userId);
            await updateDoc(userDoc, {
                specialtyIds: arrayUnion(specialtyId),
            });
            logger(`Specialty with ID ${specialtyId} added to user ${userId}`);
        } catch (error) {
            logger('Error adding specialty to user:', error);
            throw error;
        }
    };

    removeSpecialtyFromUser = async (userId, specialtyId) => {
        try {
            const userDoc = doc(firestore, collectionName, userId);
            await updateDoc(userDoc, {
                specialtyIds: arrayRemove(specialtyId),
            });
            logger(`Specialty with ID ${specialtyId} removed from user ${userId}`);
        } catch (error) {
            logger('Error removing specialty from user:', error);
            throw error;
        }
    };

    getUserWithSpecialties = async (userId) => {
        try {
            if (!userId) {
                return {};
            }
            const userDoc = doc(firestore, collectionName, userId);
            const userSnapshot = await getDoc(userDoc);
            if (!userSnapshot.exists()) {
                throw new Error(`User with ID ${userId} does not exist.`);
            }
            const userData = userSnapshot.data();

            if (!userData.specialtyIds) {
                logger("Get user", userData);
                return userData;
            }

            // const specialtiesCollection = collection(firestore, 'specialties');
            const specialtiesSnapshot = await getDocs(collectionGroup(firestore, "specialties"));
            const allSpecialties = specialtiesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

            const userSpecialties = userData.specialtyIds.map((id) =>
                allSpecialties.find((specialty) => specialty.id === id)
            );

            const newVar = { ...userData, specialties: userSpecialties };
            logger("Get user with specialties", newVar);
            return newVar;
        } catch (error) {
            logger('Error fetching user with specialties:', error);
            throw error;
        }
    };
}

export const usersApi = new UsersApi();
