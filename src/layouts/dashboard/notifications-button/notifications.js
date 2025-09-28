import { useAuth } from "../../../hooks/use-auth";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { firestore } from "../../../libs/firebase";
import { getValidDate } from "src/utils/date-locale";

const PAGE_SIZE = 10;

export function notifications() {
    // eslint-disable-next-line
    const { user } = useAuth();
    return user.notificationList;
}


export function useNotifications(uid) {
    const [all, setAll] = useState([]);
    const [page, setPage] = useState(1);

    useEffect(() => {
        if (!uid) return;

        const ref = doc(firestore, "profiles", uid);
        const unsub = onSnapshot(ref, (snap) => {
            const list = Array.isArray(snap.data()?.notificationList)
                ? snap.data().notificationList
                : [];

            const uniq = Array.from(
                new Map(list.map((n) => [n.id, n])).values()
            ).sort((a, b) => getValidDate(b.createdAt) - getValidDate(a.createdAt));

            setAll(uniq);
        });

        return () => unsub();
    }, [uid]);

    const notifications = all.slice(0, PAGE_SIZE * page);
    const hasMore = all.length > notifications.length;
    const loadMore = () => hasMore && setPage((p) => p + 1);

    const totalUnread = all.filter((n) => !n.read).length;

    return { notifications, hasMore, loadMore, totalUnread }
}