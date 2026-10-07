import { onValue, ref, set, update } from 'firebase/database';
import { deleteObject, getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import { database, storage } from 'src/libs/firebase';
import { DEFAULT_PLACEMENT_SETTINGS } from 'src/constants/partner-ads';

const ADMIN_PATH = 'partnerAds/admin/banners';
const PUBLIC_PATH = 'partnerAds/public/banners';
const SETTINGS_PATH = 'partnerAds/public/settings';
const STATS_PATH = 'partnerAdStats';
const STORAGE_ROOT = 'partner-banners';

const PUBLIC_FIELDS = [
    'id',
    'title',
    'subtitle',
    'ctaLabel',
    'targetUrl',
    'layout',
    'imageUrl',
    'imageDarkUrl',
    'placements',
    'startAt',
    'endAt',
    'priority',
    'partnerName',
    'updatedAt'
];

const generateId = (existingIds) => {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let id;
    do {
        id = 'BN-' + Array.from({ length: 5 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
    } while (existingIds.has(id));
    return id;
};

const toPublic = (banner) => {
    const result = {};
    PUBLIC_FIELDS.forEach((field) => {
        if (banner[field] !== undefined && banner[field] !== '') result[field] = banner[field];
    });
    return result;
};

const isPublishable = (banner, now = Date.now()) =>
    banner.status === 'active' &&
    Boolean(banner.imageUrl) &&
    Object.keys(banner.placements || {}).length > 0 &&
    (!banner.endAt || banner.endAt > now);

const extensionFor = (file) => {
    if (file.type === 'image/png') return 'png';
    if (file.type === 'image/webp') return 'webp';
    return 'jpg';
};

const uploadCreative = async (bannerId, variant, file) => {
    const path = `${STORAGE_ROOT}/${bannerId}/${variant}-${Date.now()}.${extensionFor(file)}`;
    const fileRef = storageRef(storage, path);
    await uploadBytes(fileRef, file, {
        contentType: file.type,
        cacheControl: 'public,max-age=31536000,immutable'
    });
    const url = await getDownloadURL(fileRef);
    return { path, url };
};

const removeStorageFile = async (path) => {
    if (!path) return;
    try {
        await deleteObject(storageRef(storage, path));
    } catch (error) {
        if (error?.code !== 'storage/object-not-found') throw error;
    }
};

const normalizeBanner = (id, raw) => ({
    id,
    title: raw.title || '',
    subtitle: raw.subtitle || '',
    ctaLabel: raw.ctaLabel || '',
    targetUrl: raw.targetUrl || '',
    layout: raw.layout || 'split',
    imageUrl: raw.imageUrl || '',
    imagePath: raw.imagePath || '',
    imageDarkUrl: raw.imageDarkUrl || '',
    imageDarkPath: raw.imageDarkPath || '',
    placements: raw.placements || {},
    startAt: raw.startAt || null,
    endAt: raw.endAt || null,
    priority: raw.priority || 0,
    status: raw.status || 'draft',
    partnerName: raw.partnerName || '',
    partnerWebsite: raw.partnerWebsite || '',
    partnerEmail: raw.partnerEmail || '',
    budgetUsd: raw.budgetUsd ?? null,
    notes: raw.notes || '',
    createdAt: raw.createdAt || null,
    createdBy: raw.createdBy || '',
    updatedAt: raw.updatedAt || null,
    updatedBy: raw.updatedBy || '',
    archivedAt: raw.archivedAt || null,
    statusBeforeArchive: raw.statusBeforeArchive || ''
});

const writeBanner = async (banner) => {
    const updates = {
        [`${ADMIN_PATH}/${banner.id}`]: banner,
        [`${PUBLIC_PATH}/${banner.id}`]: isPublishable(banner) ? toPublic(banner) : null
    };
    await update(ref(database), updates);
};

export const partnerAdsApi = {
    subscribeBanners(onData, onError) {
        return onValue(
            ref(database, ADMIN_PATH),
            (snapshot) => {
                const value = snapshot.val() || {};
                onData(Object.entries(value).map(([id, raw]) => normalizeBanner(id, raw)));
            },
            onError
        );
    },

    subscribeStats(onData, onError) {
        return onValue(ref(database, STATS_PATH), (snapshot) => onData(snapshot.val() || {}), onError);
    },

    subscribeSettings(onData, onError) {
        return onValue(
            ref(database, SETTINGS_PATH),
            (snapshot) => {
                const value = snapshot.val() || {};
                const merged = {};
                Object.entries(DEFAULT_PLACEMENT_SETTINGS).forEach(([key, defaults]) => {
                    merged[key] = { ...defaults, ...(value[key] || {}) };
                });
                onData(merged);
            },
            onError
        );
    },

    async saveSettings(settings) {
        await set(ref(database, SETTINGS_PATH), settings);
    },

    async saveBanner({ existing, values, lightFile, darkFile, removeDark, user, existingIds }) {
        const now = Date.now();
        const id = existing?.id || generateId(existingIds);
        const banner = {
            ...(existing || {}),
            ...values,
            id,
            updatedAt: now,
            updatedBy: user?.email || ''
        };
        if (!existing) {
            banner.createdAt = now;
            banner.createdBy = user?.email || '';
        }

        const staleFiles = [];
        if (lightFile) {
            const uploaded = await uploadCreative(id, 'light', lightFile);
            if (existing?.imagePath) staleFiles.push(existing.imagePath);
            banner.imageUrl = uploaded.url;
            banner.imagePath = uploaded.path;
        }
        if (darkFile) {
            const uploaded = await uploadCreative(id, 'dark', darkFile);
            if (existing?.imageDarkPath) staleFiles.push(existing.imageDarkPath);
            banner.imageDarkUrl = uploaded.url;
            banner.imageDarkPath = uploaded.path;
        } else if (removeDark && existing?.imageDarkPath) {
            staleFiles.push(existing.imageDarkPath);
            banner.imageDarkUrl = '';
            banner.imageDarkPath = '';
        }

        await writeBanner(banner);
        await Promise.all(staleFiles.map((path) => removeStorageFile(path).catch(() => undefined)));
        return banner;
    },

    async setStatus(banner, status, user) {
        await writeBanner({
            ...banner,
            status,
            updatedAt: Date.now(),
            updatedBy: user?.email || ''
        });
    },

    async archive(banner, user) {
        await writeBanner({
            ...banner,
            status: 'archived',
            statusBeforeArchive: banner.status,
            archivedAt: Date.now(),
            updatedAt: Date.now(),
            updatedBy: user?.email || ''
        });
    },

    async restore(banner, user) {
        await writeBanner({
            ...banner,
            status: banner.statusBeforeArchive === 'active' ? 'paused' : banner.statusBeforeArchive || 'draft',
            statusBeforeArchive: '',
            archivedAt: null,
            updatedAt: Date.now(),
            updatedBy: user?.email || ''
        });
    },

    async remove(banner) {
        await update(ref(database), {
            [`${ADMIN_PATH}/${banner.id}`]: null,
            [`${PUBLIC_PATH}/${banner.id}`]: null,
            [`${STATS_PATH}/${banner.id}`]: null
        });
        await Promise.all(
            [banner.imagePath, banner.imageDarkPath].map((path) => removeStorageFile(path).catch(() => undefined))
        );
    }
};
