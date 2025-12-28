import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import { firestore } from 'src/libs/firebase';

const COLLECTION = 'trades';

const normalizeStory = (input = {}, fallback = {}) => {
    const about = input.about ?? fallback.about ?? '';
    const shortDescription = input.shortDescription ?? fallback.shortDescription ?? '';

    return { about, shortDescription };
};

const mapTradeSnapshot = (snapshot) => {
    const data = snapshot.data() || {};

    const metrics = {
        viewsThisWeek: Number(data.viewsThisWeek ?? data.metrics?.viewsThisWeek ?? 0),
        totalViews: Number(data.views ?? data.metrics?.totalViews ?? 0),
        updatedAt: data.metrics?.updatedAt ?? data.updatedAt ?? null
    };

    const statusDetailsSource =
        data.statusDetails ??
        data.statusNote ??
        data.statusMessage ??
        null;

    const statusDetails =
        statusDetailsSource !== null && statusDetailsSource !== undefined
            ? statusDetailsSource
            : Array.isArray(data.moderationNotes)
                ? data.moderationNotes
                : '';

    const story = normalizeStory(data.story || {}, {
        about: data.about,
        shortDescription: data.shortDescription
    });

    return {
        id: snapshot.id,
        ownerId: data.ownerId || data.userId || null,
        title: data.title || '',
        subtitle: data.subtitle || '',
        description: data.description || '',
        avatarUrl: data.avatarUrl || '',
        rating: Number.isFinite(data.rating) ? Number(data.rating) : 0,
        views: Number.isFinite(data.views) ? Number(data.views) : metrics.totalViews,
        viewsThisWeek: metrics.viewsThisWeek,
        reviews: Number.isFinite(data.reviews) ? Number(data.reviews) : 0,
        completedProjects: Number.isFinite(data.completedProjects) ? Number(data.completedProjects) : 0,
        projectsInProgress: Number.isFinite(data.projectsInProgress) ? Number(data.projectsInProgress) : 0,
        status: data.status || 'on_review',
        statusDetails,
        statusUpdatedAt: data.statusUpdatedAt ?? data.updatedAt ?? null,
        newOrders: Number.isFinite(data.newOrders) ? Number(data.newOrders) : 0,
        primarySpecialtyId: data.primarySpecialtyId ?? data.primarySpecialty ?? '',
        primarySpecialtyLabel: data.primarySpecialtyLabel ?? data.subtitle ?? '',
        primarySpecialtyPath: data.primarySpecialtyPath ?? '',
        contact: data.contact || {},
        location: data.location || {},
        pricing: data.pricing || {},
        story,
        metrics,
        createdAt: data.createdAt ?? null,
        updatedAt: data.updatedAt ?? null
    };
};

const normalizeTradePayload = (userId, payload = {}) => {
    const now = serverTimestamp();
    const story = normalizeStory(payload.story, {
        about: payload.about,
        shortDescription: payload.shortDescription
    });

    return {
        ownerId: userId,
        title: payload.title || '',
        subtitle: payload.subtitle || '',
        description: payload.description || '',
        avatarUrl: payload.avatarUrl || '',
        rating: Number.isFinite(payload.rating) ? Number(payload.rating) : 0,
        views: Number.isFinite(payload.views) ? Number(payload.views) : 0,
        viewsThisWeek: Number.isFinite(payload.viewsThisWeek) ? Number(payload.viewsThisWeek) : 0,
        reviews: Number.isFinite(payload.reviews) ? Number(payload.reviews) : 0,
        completedProjects: Number.isFinite(payload.completedProjects) ? Number(payload.completedProjects) : 0,
        projectsInProgress: Number.isFinite(payload.projectsInProgress) ? Number(payload.projectsInProgress) : 0,
        status: payload.status || 'on_review',
        statusDetails: payload.statusDetails ?? '',
        statusUpdatedAt: now,
        newOrders: Number.isFinite(payload.newOrders) ? Number(payload.newOrders) : 0,
        primarySpecialtyId: payload.primarySpecialtyId ?? payload.primarySpecialty ?? '',
        primarySpecialtyLabel: payload.primarySpecialtyLabel ?? '',
        primarySpecialtyPath: payload.primarySpecialtyPath ?? '',
        contact: payload.contact || {},
        location: payload.location || {},
        pricing: payload.pricing || {},
        story,
        metrics: {
            viewsThisWeek: Number.isFinite(payload.viewsThisWeek) ? Number(payload.viewsThisWeek) : 0,
            totalViews: Number.isFinite(payload.views) ? Number(payload.views) : 0,
            updatedAt: now
        },
        createdAt: now,
        updatedAt: now
    };
};

const getCollectionRef = () => collection(firestore, COLLECTION);

const getTradesByUser = async (userId) => {
    if (!userId) {
        return [];
    }

    const tradesQuery = query(
        getCollectionRef(),
        where('ownerId', '==', userId),
        orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(tradesQuery);
    return snapshot.docs.map(mapTradeSnapshot);
};

const getTrade = async (tradeId) => {
    if (!tradeId) {
        throw new Error('tradeId is required to fetch a trade');
    }

    const snapshot = await getDoc(doc(firestore, COLLECTION, tradeId));
    if (!snapshot.exists()) {
        return null;
    }

    return mapTradeSnapshot(snapshot);
};

const subscribeToUserTrades = (userId, onNext, onError) => {
    if (!userId) {
        return () => undefined;
    }

    const tradesQuery = query(
        getCollectionRef(),
        where('ownerId', '==', userId),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(
        tradesQuery,
        (snapshot) => {
            const trades = snapshot.docs.map(mapTradeSnapshot);
            onNext(trades);
        },
        (error) => {
            console.error('[tradesApi] subscribeToUserTrades error:', error);
            onError?.(error);
        }
    );
};

const createTrade = async (userId, payload = {}) => {
    if (!userId) {
        throw new Error('userId is required to create a trade');
    }

    const tradeData = normalizeTradePayload(userId, payload);
    const docRef = await addDoc(getCollectionRef(), tradeData);
    return docRef.id;
};

const updateTrade = async (tradeId, payload = {}) => {
    if (!tradeId) {
        throw new Error('tradeId is required to update a trade');
    }

    const now = serverTimestamp();

    const normalized = {
        ...payload,
        updatedAt: now,
        metrics: {
            ...(payload.metrics || {}),
            updatedAt: now
        }
    };

    if (payload.status !== undefined) {
        normalized.statusUpdatedAt = now;
    }

    if (normalized.story) {
        normalized.story = normalizeStory(normalized.story);
    }

    Object.keys(normalized).forEach((key) => {
        if (normalized[key] === undefined) {
            delete normalized[key];
        }
    });

    await updateDoc(doc(firestore, COLLECTION, tradeId), normalized);
};

const removeTrade = async (tradeId) => {
    if (!tradeId) {
        throw new Error('tradeId is required to delete a trade');
    }

    await deleteDoc(doc(firestore, COLLECTION, tradeId));
};

export const tradesApi = {
    getTrade,
    getTradesByUser,
    subscribeToUserTrades,
    createTrade,
    updateTrade,
    removeTrade
};