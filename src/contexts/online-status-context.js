import React, {createContext, useContext, useEffect, useState} from "react";
import {collection, doc, onSnapshot, serverTimestamp, setDoc} from "firebase/firestore";
import {firestore} from "src/libs/firebase";
import {useAuth} from "src/hooks/use-auth";
import {getValidDate} from "src/utils/date-locale";
import {INFO} from "src/libs/log";


const OnlineStatusContext = createContext();

export const OnlineStatusProvider = ({children}) => {
    const [isOnline, setIsOnline] = useState(false);
    const {user} = useAuth();
    const [onlineUsers, setOnlineUsers] = useState({});

    const userId = user?.id || undefined;

    const updateOnlineStatus = async (userId, status) => {
        const userRef = doc(firestore, "profiles", userId);
        await setDoc(userRef, {isOnline: status, lastSeen: serverTimestamp()}, {merge: true});
    };

    useEffect(() => {
        if (!userId) return;

        const userRef = doc(firestore, "profiles", userId);
        const unsubscribe = onSnapshot(userRef, (doc) => {
            if (doc.exists()) {
                setIsOnline(doc.data().isOnline);
            }
        });

        return () => unsubscribe();
    }, [userId]);

    useEffect(() => {
        const usersRef = collection(firestore, "profiles");
        const unsubscribe = onSnapshot(usersRef, (snapshot) => {
            const statuses = {};
            snapshot.forEach((doc) => {
                statuses[doc.id] = doc.data().isOnline;
            });
            setOnlineUsers(statuses);
        });

        return () => unsubscribe();
    }, []);


    useEffect(() => {
        if (userId) {
            updateOnlineStatus(userId, true);
        }

        return () => {
            if (userId) {
                updateOnlineStatus(userId, false);
            }
        };
    }, [userId]);

    useEffect(() => {
        if (!userId) return;

        // Обновление статуса при закрытии вкладки
        const handleBeforeUnload = () => {
            INFO("handleBeforeUnload")
            updateOnlineStatus(userId, false);
        };

        // Обновление статуса при скрытии вкладки
        const handleVisibilityChange = () => {
            const hidden = document.visibilityState === "hidden";
            INFO("handleVisibilityChange", hidden)
            updateOnlineStatus(userId, !hidden);
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [userId]);

    return (
        <OnlineStatusContext.Provider value={{isOnline, onlineUsers}}>
            {children}
        </OnlineStatusContext.Provider>
    );
};

export const useOnlineStatus = () => {
    return useContext(OnlineStatusContext);
};