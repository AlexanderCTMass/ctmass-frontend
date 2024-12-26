import {
    addDoc,
    and,
    arrayRemove,
    arrayUnion,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    limit,
    or,
    orderBy,
    query,
    updateDoc,
    where,
    writeBatch
} from "firebase/firestore";
import {profileApi} from "src/api/profile";
import {firestore} from "src/libs/firebase";
import {roles} from "../../roles";

class ServicesFeedApi {


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


    getProfilesForConnections(idSet) {
        const profileReference = collection(firestore, "profiles");
        const q2 = query(profileReference,
            where("id", "in", Array.from(idSet)));

        return getDocs(q2)
    }

    deleteConnection(id) {
        return deleteDoc(doc(firestore, "connections", id));
    }

    addConnection(user1, user2, status) {
        return addDoc(collection(firestore, "connections"), {
            user1: user1,
            user2: user2,
            status: status
        });
    }

    updateConnection(id, status) {
        return updateDoc(doc(firestore, "connections", id), {
            status: status
        });
    }

    getConnection(user1, user2) {
        const collectionReference = collection(firestore, "connections");
        const q = query(collectionReference,
            and(where("user1", "==", user1),
                where("user2", "==", user2))
        );
        return getDocs(q);
    }


    getConnections(request) {
        if (!request) {
            return null;
        }
        const collectionReference = collection(firestore, "connections");
        const q = query(collectionReference,
            or(
                where("user1", "==", request.userId),
                where("user2", "==", request.userId),
            ));

        return getDocs(q);
    }

    getProjects() {
        const collectionReference = collection(firestore, "specialistPosts");
        const q = query(collectionReference, where("postType", "==", "project"));
        return getDocs(q);
    }

    getContractors() {
        const collectionReference = collection(firestore, "profiles");
        const q = query(collectionReference,
            where("role", "==", roles.WORKER),
        );
        return getDocs(q);
    }


    async getPosts(request) {
        if (!request) {
            return [];
        }
        const collectionReference = collection(firestore, "specialistPosts");
        const queryConstraints = [];
        if (request.userId) {
            queryConstraints.push(where("authorId", "==", request.userId));
            queryConstraints.push(where("contractorId", "==", request.userId));
            queryConstraints.push(where("customerId", "==", request.userId));
        }
        if (request.userEmail) {
            queryConstraints.push(where("contractorEmail", "==", request.userEmail));
            queryConstraints.push(where("customerEmail", "==", request.userEmail));
        }
        const q = query(collectionReference,
            or(...queryConstraints),
            orderBy("createdAt", "desc"));
        const docs = await getDocs(q);
        const posts = [];
        docs.forEach((doc) => {
            const id = doc.id;
            const data = doc.data();
            posts.push(
                {
                    id,
                    ...data,
                    authorAvatar: data.authorAvatar || (data.authorId === data.customerId ? data.customerAvatar : data.contractorAvatar),
                    authorName: data.authorName || (data.authorId === data.customerId ? data.customerName : data.contractorName),
                    authorEmail: data.authorEmail || (data.authorId === data.customerId ? data.customerEmail : data.contractorEmail)
                });

        });
        return posts;
    }


    async getLastPostsReviews(count) {
        const collectionReference = collection(firestore, "specialistPosts");
        const q = query(collectionReference, where("customerFeedback", "!=", false),
            orderBy("createdAt", "desc"),
            limit(count));
        const docs = await getDocs(q);
        const posts = [];
        docs.forEach((doc) => {
            const id = doc.id;
            const data = doc.data();
            posts.push(
                {
                    id,
                    ...data,
                    authorAvatar: data.authorAvatar || (data.authorId === data.customerId ? data.customerAvatar : data.contractorAvatar),
                    authorName: data.authorName || (data.authorId === data.customerId ? data.customerName : data.contractorName),
                    authorEmail: data.authorEmail || (data.authorId === data.customerId ? data.customerEmail : data.contractorEmail)
                });

        });
        return posts;
    }

    async getLastPosts(count) {
        const collectionReference = collection(firestore, "specialistPosts");
        const q = query(collectionReference,
            where("authorId", "!=", false),
            orderBy("createdAt", "desc"));
        const docs = await getDocs(q);
        const posts = [];
        let i = 0;
        docs.forEach((doc) => {
            if (i >= count) {
                // Если уже набрано достаточное количество записей, выходим из цикла
                return;
            }
            const id = doc.id;
            const data = doc.data();
            //unique users
            if (posts.filter((post) => post.authorId === data.authorId).length > 0) {
                return;
            }

            posts.push(
                {
                    id,
                    ...data,
                    authorAvatar: data.authorAvatar || (data.authorId === data.customerId ? data.customerAvatar : data.contractorAvatar),
                    authorName: data.authorName || (data.authorId === data.customerId ? data.customerName : data.contractorName),
                    authorEmail: data.authorEmail || (data.authorId === data.customerId ? data.customerEmail : data.contractorEmail)
                });
            i++; // Увеличиваем счетчик
        });
        return posts;
    }

    getPostsForCustomer(request) {
        if (!request) {
            return null;
        }
        const collectionReference = collection(firestore, "specialistPosts");
        const q = query(collectionReference,
            or(
                where("userId", "==", request.userId),
                where("customerId", "==", request.userId),
                where("customerEmail", "==", request.email),
            ),
            orderBy("createdAt", "desc"));
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