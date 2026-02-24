import { paths } from 'src/paths';

/**
 * Определяет куда вести пользователя при клике на объявление
 * @param {string} listingId - ID объявления
 * @param {string} authorId - ID автора объявления
 * @param {Object} currentUser - Текущий пользователь
 * @returns {string} - Путь для навигации
 */
export const getListingPath = (listingId, authorId, currentUser) => {
    // Если пользователь не авторизован - в публичную часть
    if (!currentUser) {
        return paths.listings.details.replace(':listingId', listingId);
    }

    // Если пользователь - автор объявления или админ - в дашборд
    if (authorId === currentUser.id || currentUser.role === 'admin') {
        return paths.dashboard.listings.details.replace(':listingId', listingId);
    }

    // Во всех остальных случаях - в публичную часть
    return paths.listings.details.replace(':listingId', listingId);
};

/**
 * Определяет куда вести пользователя при клике на пост блога
 * @param {string} postId - ID поста
 * @param {string} authorId - ID автора поста
 * @param {Object} currentUser - Текущий пользователь
 * @returns {string} - Путь для навигации
 */
export const getBlogPostPath = (postId, authorId, currentUser) => {
    // Если пользователь не авторизован - в публичную часть
    if (!currentUser) {
        return paths.blog.details.replace(':postId', postId);
    }

    // Если пользователь - автор поста или админ - в дашборд
    if (authorId === currentUser.id || currentUser.role === 'admin') {
        return paths.dashboard.blog.postDetails.replace(':postId', postId);
    }

    // Во всех остальных случаях - в публичную часть
    return paths.blog.details.replace(':postId', postId);
};

/**
 * Проверяет, является ли пользователь автором контента
 * @param {string} authorId - ID автора
 * @param {Object} currentUser - Текущий пользователь
 * @returns {boolean} - true если пользователь автор или админ
 */
export const isAuthor = (authorId, currentUser) => {
    if (!currentUser || !authorId) return false;
    return authorId === currentUser.id || currentUser.role === 'admin';
};

/**
 * Получает правильный путь для редактирования
 * @param {string} listingId - ID объявления
 * @param {Object} currentUser - Текущий пользователь
 * @returns {string|null} - Путь для редактирования или null если нет прав
 */
export const getEditListingPath = (listingId, currentUser) => {
    if (!currentUser) return null;
    return paths.dashboard.listings.edit.replace(':listingId', listingId);
};

/**
 * Получает правильный путь для списка объявлений пользователя
 * @param {string} userId - ID пользователя
 * @param {Object} currentUser - Текущий пользователь
 * @returns {string} - Путь к списку объявлений
 */
export const getUserListingsPath = (userId, currentUser) => {
    if (!currentUser) {
        return `${paths.listings.index}?author=${userId}`;
    }

    if (userId === currentUser.id) {
        return paths.dashboard.listings.index;
    }

    return `${paths.listings.index}?author=${userId}`;
};