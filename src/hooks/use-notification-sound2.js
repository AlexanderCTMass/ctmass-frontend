import { useEffect, useRef } from 'react';
import notificationSound from 'src/sounds/new_message_tone.mp3';

const useNotificationSound = (userId, beep) => {
    const audioRef = useRef(null);

    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio(notificationSound);
        }

        console.log("sound!")

        /* if (beep) {
             audioRef.current.play().catch((error) => {
                 console.error('Error sound notification:', error);
             });
         }*/
    }, [userId, beep]);
};

export default useNotificationSound;