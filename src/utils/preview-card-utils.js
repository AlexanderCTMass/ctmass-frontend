// Функция для преобразования worker в data согласно контракту VerticalPreviewCard
import {getSiteDuration} from "src/utils/date-locale";

export const mapWorkerToPreviewData = (worker, theme) => {
    const {
        id,
        businessName,
        name,
        avatar,
        specialties = [],
        address,
        hourlyRate,
        rating,
        reviewCount,
        busyUntil,
        registrationAt,
        status // если есть прямое поле статуса
    } = worker;

    // Форматирование адреса
    const formatAddress = (address) => {
        if (!address || Object.keys(address).length === 0) {
            return '';
        }

        if (address?.location?.place_name) {
            const placeParts = address.location.place_name.split(', ');
            if (placeParts.length >= 2) {
                return `${placeParts[0]}, ${placeParts[1].split(' ')[0]}`;
            }
            return address.location.place_name;
        }

        return '';
    };

    // Форматирование специализаций
    const formatSpecialtyLabel = (specialties) => {
        if (specialties?.length > 0) {
            return specialties
                .filter(spec => spec)
                .slice(0, 3)
                .map(spec => spec.label || spec)
                .join(', ') + (specialties.length > 3 ? '...' : '');
        }
        return 'Specialist';
    };

    // Определение статуса
    const getStatusKey = () => {
        if (busyUntil) return 'busy';
        if (status) {
            const statusLower = status.toLowerCase();
            if (statusLower.includes('hidden')) return 'hidden';
            if (statusLower.includes('review')) return 'on_review';
            if (statusLower.includes('fix')) return 'fix_it';
        }
        return 'available';
    };

    const statusKey = getStatusKey();

    // Маппинг статус ключей в метки
    const statusLabels = {
        available: 'Available',
        busy: 'Busy',
        hidden: 'Hidden',
        on_review: 'On review',
        fix_it: 'Fix it'
    };

    // Форматирование цены
    const formatPriceLabel = () => {
        if (!hourlyRate) return '$55/hr';
        return `$${hourlyRate}/hr`;
    };

    // Получение инициалов
    const getInitials = () => {
        const title = businessName || name || '';
        return title.charAt(0).toUpperCase();
    };

    // Форматирование рейтинга
    const ratingValue = Math.min(Math.max(Number(rating) || 0, 0), 5);
    const reviewsCount = Math.max(Number(reviewCount) || 0, 0);

    // Форматирование длительности регистрации
    const getRegistrationDuration = () => {
        if (!registrationAt) return null;
        try {
            const date = registrationAt.toDate ? registrationAt.toDate() : new Date(registrationAt);
            return getSiteDuration(date);
        } catch {
            return null;
        }
    };

    return {
        image: avatar || '/assets/avatars/defaultUser.jpg',
        title: businessName || name || 'Your trade title',
        specialtyLabel: formatSpecialtyLabel(specialties),
        locationLabel: formatAddress(address),
        priceLabel: formatPriceLabel(),
        ratingValue: ratingValue,
        ratingDisplay: ratingValue.toFixed(1),
        reviewsCount: reviewsCount,
        avatarInitial: getInitials(),
        registrationDuration: getRegistrationDuration(),
        statusKey: statusKey,
        statusLabel: statusLabels[statusKey] || 'Available'
    };
};


// Функция для преобразования specialist в data согласно контракту VerticalPreviewCard
export const mapSpecialistToPreviewData = (specialist, theme) => {
    const {
        id,
        businessName,
        name,
        avatar,
        specialties = [],
        specialtyLabels = [],
        address,
        hourlyRate,
        rating,
        reviewsLength,
        reviewCount,
        busyUntil,
        registrationAt,
        status,
        gallery,
        completedProjects,
        commonContacts,
        description,
        since
    } = specialist;

    // Форматирование адреса
    const formatAddress = (address) => {
        if (!address || Object.keys(address).length === 0) {
            return '';
        }

        if (address?.location?.place_name) {
            const placeParts = address.location.place_name.split(', ');
            if (placeParts.length >= 2) {
                return `${placeParts[0]}, ${placeParts[1].split(' ')[0]}`;
            }
            return address.location.place_name;
        }

        return '';
    };

    // Форматирование специализаций (используем specialtyLabels если есть, иначе specialties)
    const formatSpecialtyLabel = () => {
        if (specialtyLabels?.length > 0) {
            return specialtyLabels
                .filter(spec => spec)
                .slice(0, 3)
                .join(', ') + (specialtyLabels.length > 3 ? '...' : '');
        }

        if (specialties?.length > 0) {
            return specialties
                .filter(spec => spec)
                .slice(0, 3)
                .map(spec => spec.label || spec)
                .join(', ') + (specialties.length > 3 ? '...' : '');
        }

        return 'Specialist';
    };

    // Определение статуса
    const getStatusKey = () => {
        if (busyUntil) return 'busy';
        if (status) {
            const statusLower = status.toLowerCase();
            if (statusLower.includes('hidden')) return 'hidden';
            if (statusLower.includes('review')) return 'on_review';
            if (statusLower.includes('fix')) return 'fix_it';
        }
        return 'available';
    };

    const statusKey = getStatusKey();

    // Маппинг статус ключей в метки
    const statusLabels = {
        available: 'Available',
        busy: 'Busy',
        hidden: 'Hidden',
        on_review: 'On review',
        fix_it: 'Fix it'
    };

    // Форматирование цены
    const formatPriceLabel = () => {
        if (!hourlyRate) return '$55/hr';
        return `$${hourlyRate}/hr`;
    };

    // Получение инициалов
    const getInitials = () => {
        const title = businessName || name || '';
        return title.charAt(0).toUpperCase();
    };

    // Форматирование рейтинга
    const ratingValue = Math.min(Math.max(Number(rating) || 0, 0), 5);
    const reviewsCount = Math.max(Number(reviewsLength || reviewCount) || 0, 0);

    // Форматирование длительности регистрации
    const getRegistrationDuration = () => {
        if (!registrationAt && !since) return null;
        try {
            const date = registrationAt?.toDate
                ? registrationAt.toDate()
                : since
                    ? new Date(since)
                    : new Date(registrationAt);
            return getSiteDuration(date);
        } catch {
            return null;
        }
    };

    // Дополнительные поля, которые могут быть полезны
    const additionalData = {
        completedProjects: completedProjects || 0,
        commonContacts: commonContacts || 0,
        description: description || '',
        gallery: gallery || [],
        hasGallery: gallery?.length > 0
    };

    return {
        image: avatar || '/assets/avatars/defaultUser.jpg',
        title: businessName || name || 'Your trade title',
        specialtyLabel: formatSpecialtyLabel(),
        locationLabel: formatAddress(address),
        priceLabel: formatPriceLabel(),
        ratingValue: ratingValue,
        ratingDisplay: ratingValue.toFixed(1),
        reviewsCount: reviewsCount,
        avatarInitial: getInitials(),
        registrationDuration: getRegistrationDuration(),
        statusKey: statusKey,
        statusLabel: statusLabels[statusKey] || 'Available',
        // Дополнительные поля для расширенного использования
        ...additionalData
    };
};