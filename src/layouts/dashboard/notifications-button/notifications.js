import { useAuth } from "../../../hooks/use-auth";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { firestore } from "../../../libs/firebase";
import { getValidDate } from "src/utils/date-locale";

export function notifications() {
    // eslint-disable-next-line
    const { user } = useAuth();
    return user.notificationList;
}


export function useNotifications() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (!user?.id) return;

        const profileRef = doc(firestore, 'profiles', user.id);

        const unsubscribe = onSnapshot(profileRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                const data = docSnapshot.data();

                const notifications = data.notificationList || [];

                const set = new Set();
                const filtered = [];
                notifications.forEach(n => {
                    if (n.text && !set.has(n.text)) {
                        set.add(n.text);
                        filtered.push(n);
                    }
                });

                setNotifications(filtered.sort((a, b) => getValidDate(b.createdAt) - getValidDate(a.createdAt)));
            }
        });

        return () => unsubscribe();
    }, [user?.id]);

    return notifications;
}