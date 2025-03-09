import locale from 'date-fns/locale/en-US';
import dayjs from "dayjs";

const formatDistanceLocale = {
    lessThanXSeconds: '{{count}}s',
    xSeconds: '{{count}}s',
    halfAMinute: '30s',
    lessThanXMinutes: '{{count}}m',
    xMinutes: '{{count}}m',
    aboutXHours: '{{count}}h',
    xHours: '{{count}}h',
    xDays: '{{count}}d',
    aboutXWeeks: '{{count}}w',
    xWeeks: '{{count}}w',
    aboutXMonths: '{{count}}m',
    xMonths: '{{count}}m',
    aboutXYears: '{{count}}y',
    xYears: '{{count}}y',
    overXYears: '{{count}}y',
    almostXYears: '{{count}}y'
};

export const customLocale = {
    ...locale,
    formatDistance: (token, count, options) => {
        options = options || {};

        const result = formatDistanceLocale[token].replace('{{count}}', count);

        if (options.addSuffix) {
            if (options.comparison > 0) {
                return 'in ' + result;
            } else {
                return result + ' ago';
            }
        }

        return result;
    }
};


export function formatDateRange(startDate, endDate) {
    const start = dayjs(startDate);
    const end = dayjs(endDate);

    if (start.isSame(end, 'date')) {
        return `${start.format('MMM D YYYY')}`;
    }

    if (start.isSame(end, 'month')) {
        // Один месяц: показываем месяц один раз
        return `${start.format('MMM D')} – ${end.format('D YYYY')}`;
    } else {
        if (start.isSame(end, 'year')) {
            // Один месяц: показываем месяц один раз
            return `${start.format('MMM D')} – ${end.format('MMM D YYYY')}`;
        } else {
            // Разные месяцы или годы: показываем полный диапазон
            return `${start.format('MMM D YYYY')} – ${end.format('MMM D YYYY')}`;
        }
    }
}

export function getSiteDuration(createdAt) {
    const now = new Date();
    const createdDate = new Date(createdAt);

    // Вычисляем разницу в миллисекундах и переводим её в дни
    const diffTime = now - createdDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Логика формирования текстовки
    if (diffDays < 1) {
        return "On СTMASS since today";
    } else if (diffDays === 1) {
        return "On СTMASS since yesterday";
    } else if (diffDays >= 2 && diffDays < 7) {
        return "On СTMASS for a week";
    } else if (diffDays < 30) {
        return `On СTMASS for a month`;
    } else {
        const diffMonths = Math.floor(diffDays / 30);
        const diffYears = Math.floor(diffMonths / 12);

        if (diffMonths < 12) {
            return `On СTMASS for ${diffMonths} ${declineWord(diffMonths, ["month", "months"])}`;
        } else {
            return `On СTMASS since ${createdAt.getFullYear()}`;
        }
    }
}

// Вспомогательная функция для правильного склонения слов
function declineWord(number, words) {
    return number === 1 ? words[0] : words[1];
}

export const isValidDate = (date) => {
    return date && !isNaN(new Date(date).getTime());
};

export const getValidDate = (date) => {
    if (!date)
        return null;
    return isValidDate(date) ? new Date(date) : date.toDate()
}

export const wrapDayjs = (date) => {
    if (!date)
        return null;
    return dayjs(getValidDate(date));
}