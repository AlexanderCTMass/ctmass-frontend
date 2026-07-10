import { usePushNotifications } from 'src/hooks/use-push-notifications';

// Headless: registers/refreshes the FCM token for the logged-in user and shows
// foreground push toasts. Mount only when a user is authenticated.
export const PushNotificationsManager = ({ userId }) => {
    usePushNotifications(userId);
    return null;
};
