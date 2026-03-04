import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    query,
    where,
    serverTimestamp,
    updateDoc,
    increment,
    arrayUnion,
    arrayRemove
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { firestore, storage } from 'src/libs/firebase';

class ReelsApi {
    async getUserReels(userId) {
        if (!userId) return [];

        try {
            const q = query(
                collection(firestore, 'reels'),
                where('userId', '==', userId)
            );

            const snapshot = await getDocs(q);
            const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
            return docs.sort((a, b) => {
                const aTime = a.createdAt?.seconds ?? 0;
                const bTime = b.createdAt?.seconds ?? 0;
                return bTime - aTime;
            });
        } catch (error) {
            console.error('[ReelsApi] getUserReels error:', error);
            return [];
        }
    }

    async uploadFile(file, type, userId) {
        const ext = file.name ? file.name.split('.').pop() : 'bin';
        const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const path = `reels/${userId}/${type}/${fileName}`;
        const storageRef = ref(storage, path);

        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        return { url, path };
    }

    async incrementViews(reelId) {
        await updateDoc(doc(firestore, 'reels', reelId), {
            views: increment(1)
        });
    }

    async toggleLike(reelId, userId, liked) {
        await updateDoc(doc(firestore, 'reels', reelId), {
            likes: increment(liked ? 1 : -1),
            likedBy: liked ? arrayUnion(userId) : arrayRemove(userId)
        });
    }

    async addReel(userId, { title, description, preview, previewPath, content }) {
        const reelData = {
            userId,
            title: title || '',
            description: description || '',
            preview,
            previewPath,
            content,
            views: 0,
            likes: 0,
            likedBy: [],
            createdAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(firestore, 'reels'), reelData);
        return { id: docRef.id, ...reelData };
    }

    async deleteReel(reelId, previewPath, contentItems) {
        await deleteDoc(doc(firestore, 'reels', reelId));

        const pathsToDelete = [
            previewPath,
            ...((contentItems || []).map((item) => item.path).filter(Boolean))
        ].filter(Boolean);

        await Promise.all(
            pathsToDelete.map((p) =>
                deleteObject(ref(storage, p)).catch(() => {})
            )
        );
    }
}

export const reelsApi = new ReelsApi();
