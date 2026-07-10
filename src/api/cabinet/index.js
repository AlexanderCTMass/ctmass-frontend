import {
    arrayRemove,
    arrayUnion,
    doc,
    getDoc,
    serverTimestamp,
    setDoc
} from 'firebase/firestore';
import { firestore } from 'src/libs/firebase';
import { normalizeUSPhone, formatUSPhoneForDisplay } from 'src/utils/validation/phone';

const COLLECTION = 'profiles';

const mapFirestoreToProfile = (userId, data = {}) => {
    const rawAddress = data.address;
    let primaryAddress = '';
    let primaryAddressLocation = null;
    if (typeof rawAddress === 'string') {
        primaryAddress = rawAddress;
    } else if (rawAddress && typeof rawAddress === 'object') {
        primaryAddressLocation = rawAddress.location || null;
        primaryAddress = rawAddress.location?.place_name || rawAddress.place_name || '';
    }

    return {
    id: userId,
    avatar: data.avatar || '',
    fullName: data.name || '',
    displayName: data.displayName || '',
    primaryEmail: data.email || '',
    secondaryEmail: data.secondaryEmail || '',
    emailVerified: Boolean(data.emailVerified),
    phoneCountry: data.phoneCountry || 'US',
    phoneNumber: formatUSPhoneForDisplay(data.phone) || '',
    phoneVerified: Boolean(data.phoneVerified),
    aiAvatarGenerationsLeft: data.aiAvatarGenerationsLeft ?? 5,
    companyName: data.businessName || '',
    professionalRole: data.professionalRole || '',
    shortBio: data.bio || '',
    primaryAddress,
    primaryAddressLocation,
    timeZone: data.timeZone || '(GMT-05:00) Eastern Time (US & Canada)',
    faq: Array.isArray(data.faq)
        ? data.faq.map((item) => ({
            id: item?.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `faq-${Math.random().toString(36).slice(2)}-${Date.now()}`),
            question: item?.question || '',
            answer: item?.answer || ''
        }))
        : [],
    socialGroups: Array.isArray(data.socialGroups) ? data.socialGroups : [],
    notificationPreferences: data.notificationPreferences || {}
    };
};

const mapProfileToFirestore = (values = {}) => {
    const addressLocation = values.primaryAddressLocation && typeof values.primaryAddressLocation === 'object'
        ? values.primaryAddressLocation
        : null;
    const address = addressLocation
        ? { location: addressLocation }
        : (values.primaryAddress ? { location: { place_name: values.primaryAddress } } : '');

    const payload = {
        avatar: values.avatar || '',
        name: values.fullName || '',
        displayName: values.displayName || '',
        email: values.primaryEmail || '',
        secondaryEmail: values.secondaryEmail || '',
        phoneCountry: values.phoneCountry || 'US',
        phone: normalizeUSPhone(values.phoneNumber) || '',
        businessName: values.companyName || '',
        professionalRole: values.professionalRole || '',
        bio: values.shortBio || '',
        address,
        timeZone: values.timeZone || '',
        faq: (values.faq || []).map((item) => ({
            id: item.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `faq-${Math.random().toString(36).slice(2)}-${Date.now()}`),
            question: item.question || '',
            answer: item.answer || ''
        })),
        socialGroups: Array.isArray(values.socialGroups) ? values.socialGroups : []
    };

    Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) {
            delete payload[key];
        }
    });

    return payload;
};

class CabinetApi {
    async getProfileInformation(userId) {
        if (!userId) {
            throw new Error('User id is required');
        }

        const ref = doc(firestore, COLLECTION, userId);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
            await setDoc(ref, { id: userId, createdAt: serverTimestamp() }, { merge: true });
            return mapFirestoreToProfile(userId);
        }

        return mapFirestoreToProfile(userId, snap.data());
    }

    async saveProfileInformation(userId, values) {
        if (!userId) {
            throw new Error('User id is required');
        }

        const ref = doc(firestore, COLLECTION, userId);
        const payload = {
            ...mapProfileToFirestore(values),
            updatedAt: serverTimestamp()
        };

        await setDoc(ref, payload, { merge: true });
    }

    async updateSocialGroups(userId, groups) {
        if (!userId) {
            throw new Error('User id is required');
        }

        const ref = doc(firestore, COLLECTION, userId);
        await setDoc(
            ref,
            {
                socialGroups: Array.isArray(groups) ? groups : [],
                socialGroupsUpdatedAt: serverTimestamp()
            },
            { merge: true }
        );
    }

    async updateAvatar(userId, avatarUrl) {
        if (!userId) {
            throw new Error('User id is required');
        }

        const ref = doc(firestore, COLLECTION, userId);
        await setDoc(
            ref,
            {
                avatar: avatarUrl || '',
                avatarUpdatedAt: serverTimestamp()
            },
            { merge: true }
        );
    }

    async updatePrimaryAddress(userId, addressLocation) {
        if (!userId) {
            throw new Error('User id is required');
        }

        const safeLocation = addressLocation
            ? JSON.parse(JSON.stringify(addressLocation))
            : null;

        const ref = doc(firestore, COLLECTION, userId);
        await setDoc(
            ref,
            {
                address: safeLocation ? { location: safeLocation } : '',
                addressUpdatedAt: serverTimestamp()
            },
            { merge: true }
        );
    }

    async saveFcmToken(userId, token) {
        if (!userId || !token) {
            return;
        }

        const ref = doc(firestore, COLLECTION, userId);
        await setDoc(
            ref,
            {
                fcmTokens: arrayUnion(token),
                fcmTokensUpdatedAt: serverTimestamp()
            },
            { merge: true }
        );
    }

    async removeFcmToken(userId, token) {
        if (!userId || !token) {
            return;
        }

        const ref = doc(firestore, COLLECTION, userId);
        await setDoc(
            ref,
            {
                fcmTokens: arrayRemove(token)
            },
            { merge: true }
        );
    }

    async updateAiAvatarQuota(userId, generationsLeft) {
        if (!userId) {
            throw new Error('User id is required');
        }

        const normalized = Number.isFinite(generationsLeft)
            ? Math.max(0, Math.floor(generationsLeft))
            : 0;

        const ref = doc(firestore, COLLECTION, userId);
        await setDoc(
            ref,
            {
                aiAvatarGenerationsLeft: normalized,
                aiAvatarGenerationsUpdatedAt: serverTimestamp()
            },
            { merge: true }
        );
    }

    async getNotificationPreferences(userId) {
        const profile = await this.getProfileInformation(userId);
        return {
            id: userId,
            email: profile.primaryEmail,
            notificationPreferences: profile.notificationPreferences || {}
        };
    }

    async updateNotificationPreferences(userId, preferences) {
        const ref = doc(firestore, COLLECTION, userId);
        await setDoc(
            ref,
            {
                notificationPreferences: preferences || {},
                notificationPreferencesUpdatedAt: serverTimestamp()
            },
            { merge: true }
        );
    }
}

export const cabinetApi = new CabinetApi();