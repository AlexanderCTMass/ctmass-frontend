import { addDoc, collection, doc, getDoc, getDocs, serverTimestamp, updateDoc } from "firebase/firestore";
import { firestore } from "src/libs/firebase";


class JobApi {
    getJobsMap() {
        return getDocs(collection(firestore, "jobs"));
    }

    async get() {
        await this.getJobsMap();
    }

    async getById(id) {
        return await getDoc(doc(firestore, "jobs", id));
    }

    async addJob(job) {
        job.createDate = serverTimestamp();
        const jobsRef = await addDoc(collection(firestore, "jobs"), job);
        return jobsRef.id;
    }

    update(jobsId, attr) {
        let accountRef = doc(firestore, "jobs", jobsId);
        updateDoc(accountRef, attr);
    }
}

export const jobApi = new JobApi();