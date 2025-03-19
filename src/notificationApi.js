import {arrayUnion, doc, getDoc, updateDoc} from "firebase/firestore";
import {firestore} from "./libs/firebase";
import {v4 as uuidv4} from 'uuid';
import {ERROR} from "src/libs/log";


function updateNotifications(userID, updatedNotifications) {
    const profileRef = doc(firestore, "profiles", userID);
    updateDoc(profileRef, {notificationList: updatedNotifications})
        .then(() => {
            console.log("Notifications updated");
        })
        .catch((error) => {
            ERROR("Error updating notifications");
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
        ERROR("Error marking notifications as read", error);
    }
}


export async function sendNotificationToUser(recipientId, title, text, transaction = undefined) {

    const recipientRef = doc(firestore, "profiles", recipientId);
    const notification = {
        id: uuidv4(),
        createdAt: new Date().getTime(),
        read: false,
        text: text,
        title: title
    }

    try {
        const data = {
            notificationList: arrayUnion(notification)
        };

        if (transaction) {
            transaction.update(recipientRef, data)
        } else {
            await updateDoc(recipientRef, data);
        }
        ERROR("Notification sent to recipient:", recipientId);
    } catch (error) {
        ERROR("Error sending notification:", error);
    }
}