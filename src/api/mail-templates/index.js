import { applyPagination } from 'src/utils/apply-pagination';
import { applySort } from 'src/utils/apply-sort';
import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore";
import { firestore } from "../../libs/firebase";

class MailTemplatesApi {
    async getMailTemplates(request = {}) {
        const { filters, page, rowsPerPage, sortBy, sortDir } = request;

        console.log(filters);
        // let data = deepCopy(mailTemplates);
        let data = [];
        // Query the first page of docs

        const first = query(collection(firestore, "mailTemplates"),
            orderBy("name"));
        const documentSnapshots = await getDocs(first);
        documentSnapshots.forEach((doc) => {
            data.push(doc.data());
        });


        let count = data.length;

        if (typeof filters !== 'undefined') {
            data = data.filter((mailTemplate) => {
                if (typeof filters.query !== 'undefined' && filters.query !== '') {
                    let queryMatched = false;
                    const properties = ['name'];

                    properties.forEach((property) => {
                        if ((mailTemplate[property]).toLowerCase().includes(filters.query.toLowerCase())) {
                            queryMatched = true;
                        }
                    });

                    if (!queryMatched) {
                        return false;
                    }
                }
                return true;
            });
            count = data.length;
        }

        if (typeof sortBy !== 'undefined' && typeof sortDir !== 'undefined') {
            data = applySort(data, sortBy, sortDir);
        }

        if (typeof page !== 'undefined' && typeof rowsPerPage !== 'undefined') {
            data = applyPagination(data, page, rowsPerPage);
        }

        return Promise.resolve({
            data,
            count
        });
    }

    getSnap(templateId) {
        const accountRef = doc(firestore, "mailTemplates", templateId);
        return getDoc(accountRef);
    }

    async getMailTemplate(templateId) {
        const profileSnap = await this.getSnap(templateId);
        if (profileSnap.exists())
            return profileSnap.data();
        return null;
    }
}

export const mailTemplatesApi = new MailTemplatesApi();
