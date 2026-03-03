import { alpha } from '@mui/material/styles';
import { getSiteDuration } from 'src/utils/date-locale';

export const FALLBACK_IMAGE = '/assets/avatars/defaultUser.jpg';

export const STATUS_LABELS = {
    available: 'Available',
    busy: 'Busy',
    hidden: 'Hidden',
    on_review: 'On review',
    fix_it: 'Fix it'
};

export const parseDateLike = (value) => {
    if (!value) {
        return null;
    }

    if (typeof value.toDate === 'function') {
        try {
            return value.toDate();
        } catch {
            return null;
        }
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

export const normalizeStatusKey = (status, busyUntil) => {
    const normalized = (status ?? '').toString().trim().toLowerCase();

    if (busyUntil) {
        return 'busy';
    }

    if (normalized.includes('busy')) {
        return 'busy';
    }

    if (normalized.includes('hidden')) {
        return 'hidden';
    }

    if (normalized.includes('review')) {
        return 'on_review';
    }

    if (normalized.includes('fix')) {
        return 'fix_it';
    }

    return 'available';
};

export const formatPrice = (price, priceType) => {
    if (!price) {
        return '$55/hr';
    }

    const trimmed = price.toString().trim();
    const withCurrency = trimmed.startsWith('$') ? trimmed : `$${trimmed}`;

    if (withCurrency.includes('/') || withCurrency.toLowerCase().includes('per')) {
        return withCurrency;
    }

    switch (priceType) {
        case 'project':
            return `${withCurrency} per project`;
        case 'consultation':
            return `${withCurrency} per consultation`;
        default:
            return `${withCurrency}/hr`;
    }
};

export const formatAddress = (address, location) => {
    const source = address || location?.place_name || '';
    if (!source) {
        return '';
    }

    const parts = source.split(',').map((part) => part.trim());
    if (parts.length >= 2) {
        return `${parts[0]}, ${parts[1]}`;
    }

    return source;
};

export const buildStatusStyles = (theme, statusKey) => {
    switch (statusKey) {
        case 'busy':
            return {
                bgcolor: theme.palette.error.main,
                color: theme.palette.common.white
            };
        case 'hidden':
            return {
                bgcolor: alpha(theme.palette.grey[500], 0.25),
                color: theme.palette.text.secondary
            };
        case 'on_review':
            return {
                bgcolor: alpha(theme.palette.warning.main, 0.25),
                color: theme.palette.warning.dark
            };
        case 'fix_it':
            return {
                bgcolor: theme.palette.warning.main,
                color: theme.palette.common.white
            };
        case 'available':
        default:
            return {
                bgcolor: theme.palette.success.main,
                color: theme.palette.common.white
            };
    }
};

export const extractPreviewData = (values, registrationDateOverride) => {
    const image = values.avatarUrl || FALLBACK_IMAGE;
    const title = values.tradeTitle || values.businessName || 'Your trade title';
    const specialtyLabel = values.primarySpecialtyLabel || 'Specialist';
    const locationLabel = formatAddress(values.address, values.addressLocation);
    const priceLabel = formatPrice(values.price, values.priceType);
    const ratingValue = Math.min(Math.max(Number(values.rating) || 0, 0), 5);
    const reviewsCount = Math.max(Number(values.reviewCount ?? values.reviews ?? 0), 0);
    const ratingDisplay = ratingValue.toFixed(1);
    const reviewSummary = `${reviewsCount} review${reviewsCount === 1 ? '' : 's'}`;
    const description = values.shortDescription || values.about || 'Describe your experience to inspire trust.';
    const avatarInitial = title.charAt(0).toUpperCase();
    const message = values.previewTagline || description;
    const author = values.businessName || title;
    const registrationDate = registrationDateOverride ?? parseDateLike(values.registrationAt ?? values.createdAt);
    const registrationDuration = registrationDate ? getSiteDuration(registrationDate) : null;
    const statusKey = normalizeStatusKey(values.status, values.busyUntil);
    const statusLabel = STATUS_LABELS[statusKey] || STATUS_LABELS.available;

    return {
        image,
        title,
        specialtyLabel,
        locationLabel,
        priceLabel,
        ratingValue,
        ratingDisplay,
        reviewsCount,
        reviewSummary,
        description,
        avatarInitial,
        message,
        author,
        registrationDuration,
        statusKey,
        statusLabel
    };
};