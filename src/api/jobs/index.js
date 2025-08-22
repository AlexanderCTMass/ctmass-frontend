import { deepCopy } from 'src/utils/deep-copy';
import { companies, company } from './data';
import { firestore } from "../../libs/firebase";
import { collection, query, where, getDocs, orderBy, limit, startAfter } from "firebase/firestore";


class JobsApi {
    getCompanies(request) {
        return Promise.resolve(deepCopy(companies));
    }

    getCompany(request) {
        return Promise.resolve(deepCopy(company));
    }

    getJobs(request = {}) {
        const { filters, rowsPerPage, lastVisible } = request;

        let q;

        if (lastVisible) {
            if (filters.specialty.length > 0) {
                q = query(collection(firestore, "jobs"),
                    where("specialty", "in", filters.specialty),
                    orderBy("createDate", "desc"),
                    startAfter(lastVisible),
                    limit(rowsPerPage)
                );
            } else
                q = query(collection(firestore, "jobs"),
                    orderBy("createDate", "desc"),
                    startAfter(lastVisible),
                    limit(rowsPerPage)
                );
        } else {
            if (filters.specialty.length > 0) {
                q = query(collection(firestore, "jobs"),
                    where("specialty", "in", filters.specialty),
                    orderBy("createDate", "desc"),
                    limit(rowsPerPage));
            } else
                q = query(collection(firestore, "jobs"),
                    orderBy("createDate", "desc"),
                    limit(rowsPerPage)
                );
        }

        console.log(request);
        return getDocs(q);
    }

}

export const jobsApi = new JobsApi();
