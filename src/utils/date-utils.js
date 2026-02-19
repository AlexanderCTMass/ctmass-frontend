import { format, formatDistanceToNow } from 'date-fns';

/**
 * Безопасное форматирование даты
 * @param {any} date - Дата для форматирования (Date, timestamp, строка)
 * @param {string} formatStr - Строка формата (по умолчанию 'MMM d, yyyy')
 * @param {string} fallback - Значение по умолчанию
 * @returns {string} Отформатированная дата или fallback
 */
export const safeFormatDate = (date, formatStr = 'MMM d, yyyy', fallback = '') => {
    if (!date) return fallback;

    try {
        const dateObj = date instanceof Date ? date : new Date(date);

        // Проверяем валидность даты
        if (isNaN(dateObj.getTime())) {
            return fallback;
        }

        return format(dateObj, formatStr);
    } catch (error) {
        console.error('Error formatting date:', error);
        return fallback;
    }
};

/**
 * Безопасное форматирование относительной даты
 * @param {any} date - Дата для форматирования
 * @param {Object} options - Опции formatDistanceToNow
 * @param {string} fallback - Значение по умолчанию
 * @returns {string} Отформатированная относительная дата или fallback
 */
export const safeFormatDistanceToNow = (date, options = { addSuffix: true }, fallback = 'recently') => {
    if (!date) return fallback;

    try {
        const dateObj = date instanceof Date ? date : new Date(date);

        if (isNaN(dateObj.getTime())) {
            return fallback;
        }

        return formatDistanceToNow(dateObj, options);
    } catch (error) {
        console.error('Error formatting distance to now:', error);
        return fallback;
    }
};

/**
 * Преобразование Firebase Timestamp в Date
 * @param {any} timestamp - Firebase Timestamp или другая дата
 * @returns {Date|null} Date объект или null
 */
export const fromFirebaseTimestamp = (timestamp) => {
    if (!timestamp) return null;

    try {
        // Если это Firebase Timestamp с методом toDate
        if (timestamp.toDate && typeof timestamp.toDate === 'function') {
            return timestamp.toDate();
        }

        // Если это уже Date объект
        if (timestamp instanceof Date) {
            return timestamp;
        }

        // Если это число или строка
        const date = new Date(timestamp);
        return isNaN(date.getTime()) ? null : date;
    } catch (error) {
        console.error('Error converting Firebase timestamp:', error);
        return null;
    }
};