import { alpha } from '@mui/material/styles';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { getSiteDuration } from 'src/utils/date-locale';
import { PROFESSIONAL_ROLE_OPTIONS } from 'src/constants/professional-role-options';

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

// Icon + colour for the price chip, so hourly / project / consultation are
// visually distinguishable across every preview card.
export const getPriceMeta = (priceType) => {
    if (priceType === 'project') {
        return { color: 'info', Icon: WorkOutlineRoundedIcon };
    }
    if (priceType === 'consultation') {
        return { color: 'secondary', Icon: ChatBubbleOutlineIcon };
    }
    return { color: 'warning', Icon: AccessTimeRoundedIcon };
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

export const getProfessionalRoleLabel = (value) => {
    if (!value) {
        return '';
    }

    const match = PROFESSIONAL_ROLE_OPTIONS.find((option) => option.value === value);
    return match?.label || '';
};

export const buildSpecialtyList = (items, max = 6) => {
    if (!Array.isArray(items)) {
        return [];
    }

    return items
        .map((item) => (typeof item === 'string' ? item : item?.label))
        .map((label) => (label ? label.toString().trim() : ''))
        .filter(Boolean)
        .slice(0, max);
};

const stripPlatformPrefix = (value) => (value || '').toString().replace(/^on\s+\S*tmass\s*/i, '').trim();

const pluralizeReviews = (count) => `${count} review${count === 1 ? '' : 's'}`;

export const buildPreviewHighlight = (data) => {
    if (data?.highlight) {
        return data.highlight;
    }

    const rating = Number(data?.ratingValue) || 0;
    const reviews = Number(data?.reviewsCount) || 0;

    if (rating >= 4.5 && reviews >= 3) {
        return { label: 'Top rated', caption: pluralizeReviews(reviews), tone: 'warning', icon: 'star' };
    }

    return null;
};

export const buildPreviewFeatures = (data) => {
    if (Array.isArray(data?.features) && data.features.length > 0) {
        return data.features.slice(0, 4);
    }

    const projects = Number(data?.completedProjects) || 0;
    const features = [];

    if (data?.registrationDuration) {
        features.push({
            label: 'On CTMASS',
            caption: stripPlatformPrefix(data.registrationDuration),
            tone: 'success',
            icon: 'shield'
        });
    }

    if (projects > 0) {
        features.push({
            label: `${projects} project${projects === 1 ? '' : 's'}`,
            caption: 'completed',
            tone: 'info',
            icon: 'work'
        });
    }

    return features.slice(0, 4);
};

export const extractPreviewData = (values, registrationDateOverride) => {
    const image = values.avatarUrl || FALLBACK_IMAGE;
    const title = values.tradeTitle || values.businessName || 'Your trade title';
    const specialtyLabel = values.primarySpecialtyLabel || 'Specialist';
    const locationLabel = formatAddress(values.address, values.addressLocation);
    const priceLabel = formatPrice(values.price, values.priceType);
    const priceType = values.priceType || 'hourly';
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
    const roleLabel = getProfessionalRoleLabel(values.professionalRole);
    const specialtyList = values.specialtyList?.length
        ? buildSpecialtyList(values.specialtyList)
        : buildSpecialtyList(specialtyLabel.split(',').map((part) => part.trim()));
    const traits = Array.isArray(values.traits) ? values.traits.filter(Boolean) : [];

    return {
        image,
        title,
        specialtyLabel,
        specialtyList,
        roleLabel,
        traits,
        locationLabel,
        priceLabel,
        priceType,
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