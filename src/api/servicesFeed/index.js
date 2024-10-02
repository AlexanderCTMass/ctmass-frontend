import {deepCopy} from 'src/utils/deep-copy';
import {connections, feed, posts, profile} from './data';
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    writeBatch,
    orderBy,
    updateDoc,
    arrayUnion,
    arrayRemove, getDoc
} from "firebase/firestore";
import {firestore, storage} from "src/libs/firebase";
import {ref} from "firebase/storage";

class ServicesFeedApi {

    getProfile(request) {
        return Promise.resolve(deepCopy(profile));
    }

    getConnections(request) {
        return Promise.resolve(deepCopy(connections));
    }

    liker(docId, post, userId) {
        let userSpecRef = doc(firestore, "completedWorks", docId);
        const batch = writeBatch(firestore);
        let temp = post;
        temp.likeUserIds = [...post.likeUserIds, userId]

        batch.set(userSpecRef, temp);
        batch.commit();
    }

    disliker(docId, post, userId) {
        let userSpecRef = doc(firestore, "completedWorks", docId);
        const batch = writeBatch(firestore);
        let temp = post;
        let likeMass = [];
        for (let i = 0; i < post.likeUserIds.length; i++) {
            if (post.likeUserIds[i] !== userId)
                likeMass = [...likeMass, post.likeUserIds[i]]
        }
        temp.likeUserIds = likeMass

        batch.set(userSpecRef, temp);
        batch.commit();
    }

    getFeed(request) {
        const collectionReference = collection(firestore, "completedWorks");
        const q = query(collectionReference, where("userId", "==", request.userId));
        return getDocs(q);
    }

    getPosts(request) {
        const collectionReference = collection(firestore, "specialistPosts");
        const q = query(collectionReference, where("userId", "==", request.userId), orderBy("createdAt", "desc"));
        return getDocs(q);
    }

    getPost(id) {
        const postRef = doc(firestore, "specialistPosts", id);
        const docSnap = getDoc(postRef);
        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            return null;
        }
    }

    like(postId, userId) {
        const postRef = doc(firestore, "specialistPosts", postId);
        updateDoc(postRef, {
            likes: arrayUnion(userId)
        });
    }

    unlike(postId, userId) {
        const postRef = doc(firestore, "specialistPosts", postId);
        updateDoc(postRef, {
            likes: arrayRemove(userId)
        });
    }

    getReviews(request) {
        const collectionReference = collection(firestore, "specialistPosts");
        const q = query(collectionReference, where("userId", "==", request.userId),
            where("type", "==", request.type));


        return getDocs(q);
    }
}

export const servicesFeedApi = new ServicesFeedApi();