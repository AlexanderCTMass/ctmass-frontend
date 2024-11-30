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