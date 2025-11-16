import { useEffect } from 'react';
import { useAuth } from 'src/hooks/use-auth';
import { sendFriendRequestWithCategories } from 'src/service/friend-service';
import toast from 'react-hot-toast';

export const QrConnect = () => {
    const { user } = useAuth();

    useEffect(() => {
        if (!user?.id) {
            return;
        }

        const raw = localStorage.getItem('qrConnect');
        if (!raw) {
            return;
        }

        let payload;
        try {
            payload = JSON.parse(raw);
        } catch (error) {
            console.error('Failed to parse stored QR connect payload', error);
            localStorage.removeItem('qrConnect');
            return;
        }

        const { targetUserId, cats = [] } = payload || {};

        if (!targetUserId || targetUserId === user.id) {
            localStorage.removeItem('qrConnect');
            return;
        }

        let cancelled = false;

        (async () => {
            try {
                await sendFriendRequestWithCategories(
                    user,
                    targetUserId,
                    Array.isArray(cats) ? cats : []
                );
                if (!cancelled) {
                    toast.success('Request sent ✅');
                }
            } catch (error) {
                console.error('Failed to send deferred friend request', error);
                if (!cancelled) {
                    toast.error('Could not send connect request. Please try again.');
                }
            } finally {
                localStorage.removeItem('qrConnect');
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [user?.id]);

    return null;
};