import { applyPagination } from 'src/utils/apply-pagination';
import { applySort } from 'src/utils/apply-sort';
import { deepCopy } from 'src/utils/deep-copy';
import { customer, customers, emails, invoices, logs } from './data';
import {
    addDoc, arrayUnion,
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    startAfter,
    updateDoc,
    where
} from "firebase/firestore";
import { firestore } from "../../libs/firebase";

class CustomersApi {
    async getCustomers(request = {}) {
        const { filters, page, rowsPerPage, sortBy, sortDir } = request;

        console.log(filters);
        // let data = deepCopy(customers);
        let data = [];
        // Query the first page of docs

        const first = query(collection(firestore, "profiles"),
            where("role", "not-in", ["ADMIN", "CONTENT"]),
            orderBy("role"), orderBy("name"));
        const documentSnapshots = await getDocs(first);
        documentSnapshots.forEach((doc) => {
            data.push(doc.data());
        });


        let count = data.length;

        if (typeof filters !== 'undefined') {
            data = data.filter((customer) => {
                if (typeof filters.query !== 'undefined' && filters.query !== '') {
                    let queryMatched = false;
                    const properties = ['email', 'name'];

                    properties.forEach((property) => {
                        if ((customer[property]).toLowerCase().includes(filters.query.toLowerCase())) {
                            queryMatched = true;
                        }
                    });

                    if (!queryMatched) {
                        return false;
                    }
                }

                if (typeof filters.CUSTOMER !== 'undefined') {
                    if (customer.role !== "CUSTOMER") {
                        return false;
                    }
                }

                if (typeof filters.WORKER !== 'undefined') {
                    if (customer.role !== "WORKER") {
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

    getSnap(userId) {
        const accountRef = doc(firestore, "profiles", userId);
        return getDoc(accountRef);
    }

    async getCustomer(userId) {
        const profileSnap = await this.getSnap(userId);
        if (profileSnap.exists())
            return profileSnap.data();
        return null;
    }

    async addEmail(userId, email) {
        const accountRef = doc(firestore, "profiles", userId);
        await updateDoc(accountRef, {
            emailActions: arrayUnion(email)
        });
    }

    getEmails(request) {
        return Promise.resolve(deepCopy(emails));
    }

    getInvoices(request) {
        return Promise.resolve(deepCopy(invoices));
    }

    getLogs(request) {
        return Promise.resolve(deepCopy(logs));
    }
}

export const customersApi = new CustomersApi();
