import {deepCopy} from 'src/utils/deep-copy';
import {connections, feed, posts, profile} from './data';
import {collection, query, where, getDocs} from "firebase/firestore";
import {firestore} from "src/libs/firebase";

class ServicesFeedApi {

  getProfile(request) {
    return Promise.resolve(deepCopy(profile));
  }

  getConnections(request) {
    return Promise.resolve(deepCopy(connections));
  }

  getPosts(request) {
    return Promise.resolve(deepCopy(posts));
  }

  getFeed(request) {
    const collectionReference = collection(firestore, "completedWorks");
    const q = query(collectionReference, where("userId", "==", request.userId));
    return getDocs(q);
  }
}

export const servicesFeedApi = new ServicesFeedApi();