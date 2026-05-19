import { arrayUnion, doc, getDoc, runTransaction, updateDoc } from "firebase/firestore";
import { firestore } from "./libs/firebase";
import { v4 as uuidv4 } from 'uuid';
import { ERROR, INFO } from "src/libs/log";

function safeList(list) {
    return Array.isArray(list) ? list : [];
}

function updateNotifications(userID, updatedNotifications) {
    const profileRef = doc(firestore, "profiles", userID);
    return updateDoc(profileRef, { notificationList: updatedNotifications })
        .then(() => {
            console.log("Notifications updated");
        })
        .catch((error) => {
            ERROR("Error updating notifications", error);
        });
}

export async function markNotificationAsRead(userId, notificationId) {
    const profileRef = doc(firestore, "profiles", userId);
    return runTransaction(firestore, async (tx) => {
        const snap = await tx.get(profileRef);
        const list = Array.isArray(snap.data()?.notificationList)
            ? snap.data().notificationList
            : [];
        const updated = list.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n
        );
        tx.update(profileRef, { notificationList: updated });
    }).catch((e) => ERROR("markNotificationAsRead", e));
}

export async function removeNotification(userId, notificationId) {
    const profileRef = doc(firestore, "profiles", userId);
    const profileSnap = await getDoc(profileRef);
    const userNotifications = safeList(profileSnap.data()?.notificationList);
    const updatedNotifications = userNotifications.filter((notification) => notification.id !== notificationId);
    updateNotifications(userId, updatedNotifications)
}

export async function markAllAsReadNotifications(userID) {
    const profileRef = doc(firestore, "profiles", userID);

    try {
        const profileSnap = await getDoc(profileRef);
        const userNotifications = safeList(profileSnap.data()?.notificationList);

        const updatedNotifications = userNotifications.map((notification) => ({
            ...notification,
            read: true,
        }));

        await updateDoc(profileRef, { notificationList: updatedNotifications });

        INFO("All notifications marked as read");
    } catch (error) {
        ERROR("Error marking notifications as read", error);
    }
}


export async function sendNotificationToUser(recipientId, title, text, transaction = undefined, extra = {}) {
    const recipientRef = doc(firestore, "profiles", recipientId);
    const notification = {
        id: uuidv4(),
        createdAt: new Date().getTime(),
        read: false,
        text,
        title,
        ...extra
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
        INFO("Notification sent to recipient:", recipientId);
    } catch (error) {
        ERROR("Error sending notification:", error);
    }
}

export async function notifyNewMessage(recipientId, senderId, threadId, opts = {}) {
    if (!recipientId || !senderId) return;
    if (recipientId === senderId) return;

    let senderName = opts.senderName;
    if (!senderName) {
        if (senderId === 'system') {
            senderName = 'CTMASS support';
        } else {
            try {
                const { profileApi } = await import('src/api/profile');
                const p = await profileApi.get(senderId);
                senderName = p?.businessName || p?.name || p?.email || 'a user';
            } catch {
                senderName = 'a user';
            }
        }
    }

    const recipientRef = doc(firestore, "profiles", recipientId);
    try {
        await runTransaction(firestore, async (tx) => {
            const snap = await tx.get(recipientRef);
            const list = Array.isArray(snap.data()?.notificationList)
                ? snap.data().notificationList
                : [];
            const filtered = list.filter(
                (n) => !(n.type === 'new_message' && n.senderId === senderId)
            );
            filtered.push({
                id: `msg:${senderId}`,
                type: 'new_message',
                createdAt: Date.now(),
                read: false,
                title: 'New message',
                text: `You have a new message from <a href="#open-messenger">${senderName}</a>. Click to open the conversation.`,
                senderId,
                threadId
            });
            tx.update(recipientRef, { notificationList: filtered });
        });
        INFO("Message notification upserted for:", recipientId, "from:", senderId);
    } catch (e) {
        ERROR("notifyNewMessage", e);
    }
}

export async function clearMessageNotificationFromSender(recipientId, senderId) {
    if (!recipientId || !senderId) return;
    const recipientRef = doc(firestore, "profiles", recipientId);
    try {
        await runTransaction(firestore, async (tx) => {
            const snap = await tx.get(recipientRef);
            const list = Array.isArray(snap.data()?.notificationList)
                ? snap.data().notificationList
                : [];
            const updated = list.filter(
                (n) => !(n.type === 'new_message' && n.senderId === senderId)
            );
            tx.update(recipientRef, { notificationList: updated });
        });
    } catch (e) {
        ERROR("clearMessageNotificationFromSender", e);
    }
}

export async function removeFriendRequestNotification(recipientId, initiatorId) {
    const profileRef = doc(firestore, "profiles", recipientId);
    const profileSnap = await getDoc(profileRef);
    const list = safeList(profileSnap.data()?.notificationList);
    const updated = list.filter(n => !(n.type === 'friend_request' && n.initiatorId === initiatorId));
    await updateDoc(profileRef, { notificationList: updated });
}

export async function clearAllNotifications(userID) {
    const profileRef = doc(firestore, "profiles", userID);
    try {
        await updateDoc(profileRef, { notificationList: [] });
        INFO("All notifications removed");
    } catch (error) {
        ERROR("Error clearing notifications", error);
    }
}