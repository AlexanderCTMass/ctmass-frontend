import { extendedProfileApi } from 'src/pages/cabinet/profiles/my/data/extendedProfileApi';
import { profileApi } from 'src/api/profile';
import { sendNotificationToUser } from 'src/notificationApi';

export async function sendFriendRequestWithCategories(
    currentUser,
    targetUserId,
    cats = []
) {
    const status = await profileApi.getFriendshipStatus(
        currentUser.id,
        targetUserId
    );

    if (!status) {
        await extendedProfileApi.addFriend(currentUser.id, targetUserId);

        const openAnchor = '#open=friendRequests';
        const text = `You have a friend request from <b>${currentUser.displayName ||
            currentUser.name ||
            currentUser.email
            }</b>.<br/><a href="${openAnchor}">Open friend requests</a>`;

        await sendNotificationToUser(
            targetUserId,
            'New friend request',
            text,
            undefined,
            { type: 'friend_request', initiatorId: currentUser.id }
        );
    }

    await profileApi.upsertConnectionWithCategories(
        currentUser.id,
        targetUserId,
        cats
    );
}