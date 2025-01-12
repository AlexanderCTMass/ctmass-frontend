import {useAuth} from "../../../hooks/use-auth";
import {useEffect, useState} from "react";
import {doc, onSnapshot } from "firebase/firestore";
import {firestore} from "../../../libs/firebase";

export function notifications() {
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
                setNotifications(data.notificationList || []);
            }
        });

        return () => unsubscribe();
    }, [user?.id]);

    return notifications;
}