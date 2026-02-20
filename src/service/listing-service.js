import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDocs,
    getDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    runTransaction, increment
} from 'firebase/firestore';
import {ref, uploadBytes, getDownloadURL, deleteObject} from 'firebase/storage';
import {firestore, storage} from "src/libs/firebase";
import {profileService} from './profile-service';

const LISTINGS_COLLECTION = 'listings';
const LISTING_IMAGES_COLLECTION = 'listingImages';
const VIEW_HISTORY_COLLECTION = 'userViewHistory';
// Статусы объявлений
export const LISTING_STATUS = {
    ACTIVE: 'active',
    DRAFT: 'draft',
    ARCHIVED: 'archived',
    SOLD: 'sold',
    EXPIRED: 'expired'
};

// Категории объявлений
export const LISTING_CATEGORIES = [
    {value: 'electronics', label: 'Electronics'},
    {value: 'furniture', label: 'Furniture'},
    {value: 'clothing', label: 'Clothing'},
    {value: 'books', label: 'Books'},
    {value: 'sports', label: 'Sports & Outdoors'},
    {value: 'toys', label: 'Toys & Hobbies'},
    {value: 'tools', label: 'Tools & Equipment'},
    {value: 'vehicles', label: 'Vehicles'},
    {value: 'real-estate', label: 'Real Estate'},
    {value: 'services', label: 'Services'},
    {value: 'other', label: 'Other'}
];

// Типы объявлений
export const LISTING_TYPES = [
    {value: 'sale', label: 'For Sale'},
    {value: 'wanted', label: 'Wanted'},
    {value: 'trade', label: 'For Trade'},
    {value: 'free', label: 'Free'},
    {value: 'exchange', label: 'Exchange'}
];

// Условия товара
export const LISTING_CONDITIONS = [
    {value: 'new', label: 'New'},
    {value: 'like-new', label: 'Like New'},
    {value: 'excellent', label: 'Excellent'},
    {value: 'good', label: 'Good'},
    {value: 'fair', label: 'Fair'},
    {value: 'for-parts', label: 'For Parts / Not Working'}
];

class ListingService {

    // Получение объявлений пользователя
    async getUserListings(userId, status = null, maxItems = 50) {
        try {
            // Проверяем, что userId существует
            if (!userId) {
                console.warn('getUserListings called with no userId');
                return [];
            }

            let constraints = [
                where('author.id', '==', userId),
                orderBy('createdAt', 'desc')
            ];

            if (status) {
                constraints.push(where('status', '==', status));
            }

            const listingsRef = collection(firestore, LISTINGS_COLLECTION);
            const q = query(listingsRef, ...constraints, limit(maxItems));
            const querySnapshot = await getDocs(q);

            const listings = [];
            querySnapshot.forEach((doc) => {
                listings.push(this.processListingData(doc.id, doc.data()));
            });

            return listings;
        } catch (error) {
            console.error('Error getting user listings:', error);
            throw error;
        }
    }

    // Получение всех активных объявлений
    async getActiveListings(category = null, maxItems = 50) {
        try {
            let constraints = [
                where('status', '==', LISTING_STATUS.ACTIVE),
                orderBy('createdAt', 'desc')
            ];

            if (category) {
                constraints.push(where('category', '==', category));
            }

            const listingsRef = collection(firestore, LISTINGS_COLLECTION);
            const q = query(listingsRef, ...constraints, limit(maxItems));
            const querySnapshot = await getDocs(q);

            const listings = [];
            querySnapshot.forEach((doc) => {
                listings.push(this.processListingData(doc.id, doc.data()));
            });

            return listings;
        } catch (error) {
            console.error('Error getting active listings:', error);
            throw error;
        }
    }

    // Получение релевантных объявлений (по категории или другим критериям)
    async getRelevantListings(userId, excludeListingId = null, maxItems = 6) {
        try {
            // Получаем последние активные объявления, исключая свои
            const listingsRef = collection(firestore, LISTINGS_COLLECTION);
            const q = query(
                listingsRef,
                where('status', '==', LISTING_STATUS.ACTIVE),
                orderBy('createdAt', 'desc'),
                limit(maxItems + 10) // Берем немного больше для фильтрации
            );

            const querySnapshot = await getDocs(q);

            const listings = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                // Исключаем свои объявления и текущее (если указано)
                if (data.author.id !== userId && doc.id !== excludeListingId) {
                    listings.push(this.processListingData(doc.id, data));
                }
            });

            return listings.slice(0, maxItems);
        } catch (error) {
            console.error('Error getting relevant listings:', error);
            return [];
        }
    }

    // Получение объявления по ID
    async getListingById(listingId) {
        try {
            const listingRef = doc(firestore, LISTINGS_COLLECTION, listingId);
            const listingSnap = await getDoc(listingRef);

            if (listingSnap.exists()) {
                return this.processListingData(listingSnap.id, listingSnap.data());
            } else {
                throw new Error('Listing not found');
            }
        } catch (error) {
            console.error('Error getting listing:', error);
            throw error;
        }
    }

    // Создание объявления
    async createListing(listingData, user, images = []) {
        try {
            // Сначала загружаем изображения
            const imageUrls = await this.uploadListingImages(images);

            const authorName = profileService.getUserName(user);
            const authorAvatar = user.avatar || '/assets/avatars/avatar-default.png';

            const newListing = {
                title: listingData.title,
                description: listingData.description,
                price: parseFloat(listingData.price) || 0,
                priceType: listingData.priceType || 'fixed', // fixed, negotiable, free
                category: listingData.category,
                subcategory: listingData.subcategory || '',
                type: listingData.type || 'sale',
                condition: listingData.condition || '',
                location: listingData.location || '',
                coordinates: listingData.coordinates || null,
                images: imageUrls,
                status: listingData.status || LISTING_STATUS.ACTIVE,
                views: 0,
                likes: 0,
                likedBy: [],
                author: {
                    id: user.id,
                    name: authorName,
                    avatar: authorAvatar,
                    email: user.email,
                    rating: 0,
                    listingsCount: 0
                },
                contactInfo: {
                    phone: listingData.phone || '',
                    email: user.email,
                    preferContactMethod: listingData.contactMethod || 'any'
                },
                allowOffers: listingData.allowOffers !== false,
                showPhone: listingData.showPhone !== false,
                metadata: {
                    featured: false,
                    promoted: false,
                    expiresAt: this.calculateExpiryDate()
                },
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                publishedAt: listingData.status === LISTING_STATUS.ACTIVE ? serverTimestamp() : null
            };

            const docRef = await addDoc(collection(firestore, LISTINGS_COLLECTION), newListing);
            return {id: docRef.id, ...newListing};
        } catch (error) {
            console.error('Error creating listing:', error);
            throw error;
        }
    }

    // Обновление объявления
    async updateListing(listingId, listingData, user, newImages = [], imagesToRemove = []) {
        try {
            // Проверяем права
            const listing = await this.getListingById(listingId);
            if (listing.author.id !== user.id && user.role !== 'admin') {
                throw new Error('Permission denied');
            }

            const listingRef = doc(firestore, LISTINGS_COLLECTION, listingId);

            // Удаляем старые изображения
            if (imagesToRemove.length > 0) {
                await Promise.all(imagesToRemove.map(url => this.deleteImage(url)));
            }

            // Загружаем новые изображения
            let imageUrls = listing.images || [];
            if (newImages.length > 0) {
                const newUrls = await this.uploadListingImages(newImages);
                imageUrls = [...imageUrls, ...newUrls];
            }

            // Фильтруем удаленные изображения
            imageUrls = imageUrls.filter(url => !imagesToRemove.includes(url));

            const updateData = {
                ...listingData,
                images: imageUrls,
                updatedAt: serverTimestamp()
            };

            // Если статус меняется на активный, обновляем publishedAt
            if (listingData.status === LISTING_STATUS.ACTIVE && listing.status !== LISTING_STATUS.ACTIVE) {
                updateData.publishedAt = serverTimestamp();
            }

            await updateDoc(listingRef, updateData);

            return await this.getListingById(listingId);
        } catch (error) {
            console.error('Error updating listing:', error);
            throw error;
        }
    }

    // Удаление объявления
    async deleteListing(listingId, user) {
        try {
            const listing = await this.getListingById(listingId);

            // Проверяем права
            if (listing.author.id !== user.id && user.role !== 'admin') {
                throw new Error('Permission denied');
            }

            // Удаляем изображения
            if (listing.images && listing.images.length > 0) {
                await Promise.all(listing.images.map(url => this.deleteImage(url)));
            }

            await deleteDoc(doc(firestore, LISTINGS_COLLECTION, listingId));
            return true;
        } catch (error) {
            console.error('Error deleting listing:', error);
            throw error;
        }
    }

    // Загрузка изображений объявления
    async uploadListingImages(files) {
        try {
            const uploadPromises = Array.from(files).map(async (file, index) => {
                const fileName = `listings/${Date.now()}_${index}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
                const storageRef = ref(storage, fileName);

                const metadata = {
                    contentType: file.type,
                    cacheControl: 'public, max-age=31536000',
                };

                await uploadBytes(storageRef, file, metadata);
                return await getDownloadURL(storageRef);
            });

            return await Promise.all(uploadPromises);
        } catch (error) {
            console.error('Error uploading listing images:', error);
            throw error;
        }
    }

    // Удаление изображения
    async deleteImage(imageUrl) {
        try {
            const imageRef = ref(storage, imageUrl);
            await deleteObject(imageRef);
        } catch (error) {
            console.error('Error deleting image:', error);
        }
    }

    // Лайк/дизлайк объявления
    async toggleListingLike(listingId, userId, isLiking) {
        try {
            const listingRef = doc(firestore, LISTINGS_COLLECTION, listingId);

            const result = await runTransaction(firestore, async (transaction) => {
                const listingDoc = await transaction.get(listingRef);

                if (!listingDoc.exists()) {
                    throw new Error('Listing not found');
                }

                const listing = listingDoc.data();
                const likedBy = Array.isArray(listing.likedBy) ? [...listing.likedBy] : [];
                const currentLikes = typeof listing.likes === 'number' ? listing.likes : 0;

                let newLikes = currentLikes;
                let newLikedBy = [...likedBy];

                if (isLiking) {
                    if (!newLikedBy.includes(userId)) {
                        newLikedBy.push(userId);
                        newLikes = currentLikes + 1;
                    }
                } else {
                    const index = newLikedBy.indexOf(userId);
                    if (index > -1) {
                        newLikedBy.splice(index, 1);
                        newLikes = Math.max(0, currentLikes - 1);
                    }
                }

                if (newLikes !== currentLikes || JSON.stringify(newLikedBy) !== JSON.stringify(likedBy)) {
                    transaction.update(listingRef, {
                        likes: newLikes,
                        likedBy: newLikedBy
                    });
                }

                return {
                    likes: newLikes,
                    isLiked: newLikedBy.includes(userId)
                };
            });

            return result;
        } catch (error) {
            console.error('Error toggling listing like:', error);
            throw error;
        }
    }

    // Увеличение счетчика просмотров и сохранение в историю
    async incrementViews(listingId, userId = null) {
        try {
            const listingRef = doc(firestore, LISTINGS_COLLECTION, listingId);
            await updateDoc(listingRef, {
                views: increment(1)
            });

            if (userId) {
                await this.addToViewHistory(userId, listingId);
            }
        } catch (error) {
            console.error('Error incrementing views:', error);
        }
    }

    // Сохранение просмотра в историю
    async addToViewHistory(userId, listingId) {
        try {
            if (!userId || !listingId) return;

            const historyRef = collection(firestore, VIEW_HISTORY_COLLECTION);
            const q = query(
                historyRef,
                where('userId', '==', userId),
                where('listingId', '==', listingId),
                limit(1)
            );

            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                await addDoc(historyRef, {
                    userId,
                    listingId,
                    viewedAt: serverTimestamp()
                });
            } else {
                const docRef = querySnapshot.docs[0].ref;
                await updateDoc(docRef, {
                    viewedAt: serverTimestamp()
                });
            }
        } catch (error) {
            console.error('Error adding to view history:', error);
        }
    }

    // Получение истории просмотров
    async getViewHistory(userId, maxItems = 50) {
        try {
            if (!userId) return [];

            const historyRef = collection(firestore, VIEW_HISTORY_COLLECTION);
            const q = query(
                historyRef,
                where('userId', '==', userId),
                orderBy('viewedAt', 'desc'),
                limit(maxItems)
            );

            const querySnapshot = await getDocs(q);

            const history = [];
            for (const doc of querySnapshot.docs) {
                const data = doc.data();
                try {
                    const listing = await this.getListingById(data.listingId);
                    history.push({
                        historyId: doc.id,
                        viewedAt: data.viewedAt?.toDate ? data.viewedAt.toDate() : data.viewedAt,
                        listing
                    });
                } catch (error) {
                    console.error('Error fetching listing:', error);
                }
            }

            return history;
        } catch (error) {
            console.error('Error getting view history:', error);
            return [];
        }
    }

    // Удаление из истории
    async removeFromViewHistory(historyId) {
        try {
            if (!historyId) return;

            const historyRef = doc(firestore, VIEW_HISTORY_COLLECTION, historyId);
            await deleteDoc(historyRef);
            return true;
        } catch (error) {
            console.error('Error removing from history:', error);
            throw error;
        }
    }

    // Очистка всей истории
    async clearViewHistory(userId) {
        try {
            if (!userId) return;

            const historyRef = collection(firestore, VIEW_HISTORY_COLLECTION);
            const q = query(historyRef, where('userId', '==', userId));
            const querySnapshot = await getDocs(q);

            const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);

            return true;
        } catch (error) {
            console.error('Error clearing view history:', error);
            throw error;
        }
    }

    // Получение избранных объявлений
    async getFavoriteListings(userId) {
        try {
            if (!userId) return [];

            const listingsRef = collection(firestore, LISTINGS_COLLECTION);
            const q = query(
                listingsRef,
                where('likedBy', 'array-contains', userId),
                orderBy('updatedAt', 'desc')
            );

            const querySnapshot = await getDocs(q);

            const favorites = [];
            querySnapshot.forEach((doc) => {
                favorites.push(this.processListingData(doc.id, doc.data()));
            });

            return favorites;
        } catch (error) {
            console.error('Error getting favorite listings:', error);
            return [];
        }
    }

    // Получение статистики пользователя
    async getUserStats(userId) {
        try {
            const listings = await this.getUserListings(userId);

            const stats = {
                total: listings.length,
                active: listings.filter(l => l.status === LISTING_STATUS.ACTIVE).length,
                draft: listings.filter(l => l.status === LISTING_STATUS.DRAFT).length,
                sold: listings.filter(l => l.status === LISTING_STATUS.SOLD).length,
                archived: listings.filter(l => l.status === LISTING_STATUS.ARCHIVED).length,
                totalViews: listings.reduce((sum, l) => sum + (l.views || 0), 0),
                totalLikes: listings.reduce((sum, l) => sum + (l.likes || 0), 0),
                totalValue: listings
                    .filter(l => l.status === LISTING_STATUS.ACTIVE)
                    .reduce((sum, l) => sum + (l.price || 0), 0)
            };

            return stats;
        } catch (error) {
            console.error('Error getting user stats:', error);
            return {
                total: 0,
                active: 0,
                draft: 0,
                sold: 0,
                archived: 0,
                totalViews: 0,
                totalLikes: 0,
                totalValue: 0
            };
        }
    }

    // Обработка данных объявления
    processListingData(id, data) {
        return {
            id,
            ...data,
            price: data.price || 0,
            views: data.views || 0,
            likes: data.likes || 0,
            likedBy: Array.isArray(data.likedBy) ? data.likedBy : [],
            images: Array.isArray(data.images) ? data.images : [],
            title: data.title || 'Untitled',
            description: data.description || '',
            category: data.category || 'other',
            status: data.status || LISTING_STATUS.DRAFT,
            allowOffers: data.allowOffers !== false,
            showPhone: data.showPhone !== false,
            author: {
                id: data.author?.id || '',
                name: data.author?.name || 'Unknown',
                avatar: data.author?.avatar || '',
                email: data.author?.email || '',
                rating: data.author?.rating || 0,
                listingsCount: data.author?.listingsCount || 0,
                ...data.author
            },
            contactInfo: {
                phone: data.contactInfo?.phone || '',
                email: data.contactInfo?.email || data.author?.email || '',
                preferContactMethod: data.contactInfo?.preferContactMethod || 'any',
                ...data.contactInfo
            },
            metadata: {
                featured: data.metadata?.featured || false,
                promoted: data.metadata?.promoted || false,
                expiresAt: data.metadata?.expiresAt?.toDate ? data.metadata.expiresAt.toDate() : data.metadata?.expiresAt,
                ...data.metadata
            },
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
            publishedAt: data.publishedAt?.toDate ? data.publishedAt.toDate() : data.publishedAt
        };
    }

    // Расчет даты истечения (30 дней)
    calculateExpiryDate() {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        return date;
    }
}

export const listingService = new ListingService();