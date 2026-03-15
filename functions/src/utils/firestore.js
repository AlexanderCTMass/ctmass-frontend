import { getFirestore } from "firebase-admin/firestore";

// Экспортируем функцию, которая будет возвращать инстанс Firestore
export const getDb = () => {
    return getFirestore();
};

export async function logSMSEvent(collection, data) {
    try {
        const db = getDb(); // Получаем инстанс при вызове
        await db.collection(collection).add({
            ...data,
            createdAt: new Date().toISOString()
        });
    } catch (error) {
        console.error(`Failed to log to ${collection}:`, error);
    }
}