import { useEffect, useRef } from 'react';
import notificationSound from 'src/sounds/new_message_tone.mp3';

const useNotificationSound = (userId, messages) => {
    const audioRef = useRef(null);
    const lastPlayedRef = useRef(0);

    useEffect(() => {
        if (!audioRef.current) {
            try {
                audioRef.current = new Audio(notificationSound);
            } catch (e) {
                // for Safari
                audioRef.current = null
            }
        }

        if (!messages || !Array.isArray(messages) || !userId) return;

        const now = Date.now();
        const hasIncomingUnread = messages?.some(m => m.senderId !== userId && !m.isRead);

        console.log("sound!")

        if (hasIncomingUnread && audioRef.current && now - lastPlayedRef.current > 1500) {
            audioRef.current.play().catch(() => {
                console.warn('Notification sound blocked by browser until user interaction');
            });
            lastPlayedRef.current = now;
        }
    }, [userId, messages]);
};

export default useNotificationSound;