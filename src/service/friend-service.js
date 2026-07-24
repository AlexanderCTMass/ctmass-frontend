import { extendedProfileApi } from 'src/pages/cabinet/profiles/my/data/extendedProfileApi';
import { profileApi } from 'src/api/profile';
import { sendNotificationToUser } from 'src/notificationApi';
import { emailService } from 'src/service/email-service';

const APP_HOST = process.env.REACT_APP_HOST_FOR_ENV || process.env.REACT_APP_HOST_P || '';

async function notifyOwnerByEmail(currentUser, targetUserId) {
    try {
        const owner = await profileApi.getProfileById(targetUserId);
        if (!owner?.email) {
            return;
        }
        await emailService.sendConnectNotificationToOwner({
            ownerEmail: owner.email,
            ownerName: owner.displayName || owner.businessName || owner.name || 'there',
            scannerName:
                currentUser.displayName || currentUser.name || currentUser.businessName || 'A CTMASS member',
            email: currentUser.email,
            phone: currentUser.phone,
            location: currentUser.address?.location?.place_name,
            manageUrl: `${APP_HOST}/dashboard/overview`
        });
    } catch (e) {
        console.error('Failed to send owner connect email', e);
    }
}

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

        await notifyOwnerByEmail(currentUser, targetUserId);
    }

    await profileApi.upsertConnectionWithCategories(
        currentUser.id,
        targetUserId,
        cats
    );
}