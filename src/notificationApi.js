import {arrayUnion, doc, getDoc, updateDoc} from "firebase/firestore";
import {firestore} from "./libs/firebase";
import {v4 as uuidv4} from 'uuid';


export function updateNotifications(userID, updatedNotifications) {
    const profileRef = doc(firestore, "profiles", userID);
    updateDoc(profileRef, {notificationList: updatedNotifications})
        .then(() => {
            console.log("Notifications updated");
        })
        .catch((error) => {
            console.error("Error updating notifications");
        });
}

export async function removeNotification(userId, notificationId) {
    const profileRef = doc(firestore, "profiles", userId);
    const profileSnap = await getDoc(profileRef);
    const userNotifications = profileSnap.data().notificationList
    const updatedNotifications = userNotifications.filter((notification) => notification.id !== notificationId);

    updateNotifications(userId, updatedNotifications)

}

export async function markAllAsReadNotifications(userID) {
    const profileRef = doc(firestore, "profiles", userID);

    try {
        const profileSnap = await getDoc(profileRef);
        const userNotifications = profileSnap.data().notificationList || [];

        const updatedNotifications = userNotifications.map((notification) => ({
            ...notification,
            read: true,
        }));

        await updateDoc(profileRef, {notificationList: updatedNotifications});

        console.log("All notifications marked as read");

    } catch (error) {
        console.error("Error marking notifications as read", error);
    }
}

export async function sendNotificationToUser(recipientId, notification) {
    const recipientRef = doc(firestore, "profiles", recipientId);
    notification.id = uuidv4();
    notification.createdAt = new Date();
    notification.read = false

    try {
        await updateDoc(recipientRef, {
            notificationList: arrayUnion(notification)
        });
        console.log("Notification sent to recipient:", recipientId);
    } catch (error) {
        console.error("Error sending notification:", error);
    }
}