import {getAuth} from "firebase-admin/auth";

export async function verifyAuthToken(authHeader) {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new Error("Unauthorized: No token provided");
    }

    const idToken = authHeader.split("Bearer ")[1];
    try {
        return await getAuth().verifyIdToken(idToken);
    } catch (error) {
        throw new Error(`Unauthorized: ${error.message}`);
    }
}

// Функция для проверки админа - принимает db как аргумент
export async function checkAdminAccess(uid, db) {
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists || userDoc.data().role !== "admin") {
        throw new Error("Forbidden: Admin access required");
    }
    return true;
}