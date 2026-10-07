import { applyPagination } from 'src/utils/apply-pagination';
import { applySort } from 'src/utils/apply-sort';
import { deepCopy } from 'src/utils/deep-copy';
import { emails, invoices, logs } from './data';
import {
    arrayUnion,
    collection,
    deleteField,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where
} from "firebase/firestore";
import { firestore } from "../../libs/firebase";

export const toMillis = (value) => {
    if (!value) return 0;
    if (typeof value.toMillis === 'function') return value.toMillis();
    if (typeof value.seconds === 'number') return value.seconds * 1000;
    const parsed = new Date(value).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
};

const getRegistrationMillis = (customer) => toMillis(customer.registrationAt) || toMillis(customer.createdAt);

let profilesCache = null;

class CustomersApi {
    async loadProfiles(force = false) {
        if (profilesCache && !force) {
            return profilesCache;
        }
        const first = query(collection(firestore, "profiles"),
            where("role", "not-in", ["ADMIN", "CONTENT"]),
            orderBy("role"), orderBy("name"));
        const documentSnapshots = await getDocs(first);
        const data = [];
        documentSnapshots.forEach((snap) => {
            data.push({ ...snap.data(), id: snap.data().id || snap.id });
        });
        profilesCache = data;
        return data;
    }

    hasCache() {
        return profilesCache !== null;
    }

    invalidateCache() {
        profilesCache = null;
    }

    updateCachedProfile(userId, patch) {
        if (!profilesCache) return;
        profilesCache = profilesCache.map((item) => (item.id === userId ? { ...item, ...patch } : item));
    }

    async getCustomers(request = {}, options = {}) {
        const { filters, page, rowsPerPage, sortBy, sortDir } = request;

        let data = [...await this.loadProfiles(options.force)];
        let count = data.length;

        if (typeof filters !== 'undefined') {
            data = data.filter((customer) => {
                if (typeof filters.query !== 'undefined' && filters.query !== '') {
                    const needle = filters.query.toLowerCase();
                    const queryMatched = ['email', 'name', 'phone', 'id'].some((property) =>
                        String(customer[property] || '').toLowerCase().includes(needle));

                    if (!queryMatched) {
                        return false;
                    }
                }

                if (filters.CUSTOMER && customer.role !== "CUSTOMER") {
                    return false;
                }

                if (filters.WORKER && customer.role !== "WORKER") {
                    return false;
                }

                if (filters.TESTER && !customer.isTester) {
                    return false;
                }

                return true;
            });
            count = data.length;
        }

        const direction = sortDir === 'asc' ? 1 : -1;

        if (sortBy === 'registrationAt') {
            data.sort((a, b) => (getRegistrationMillis(a) - getRegistrationMillis(b)) * direction);
        } else if (sortBy === 'name') {
            data.sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'en', { sensitivity: 'base' }) * direction);
        } else if (typeof sortBy !== 'undefined' && typeof sortDir !== 'undefined') {
            data = applySort(data, sortBy, sortDir);
        }

        if (typeof page !== 'undefined' && typeof rowsPerPage !== 'undefined') {
            data = applyPagination(data, page, rowsPerPage);
        }

        return {
            data,
            count
        };
    }

    getSnap(userId) {
        const accountRef = doc(firestore, "profiles", userId);
        return getDoc(accountRef);
    }

    async getCustomer(userId) {
        const profileSnap = await this.getSnap(userId);
        if (profileSnap.exists())
            return { ...profileSnap.data(), id: profileSnap.data().id || profileSnap.id };
        return null;
    }

    async addEmail(userId, email) {
        const accountRef = doc(firestore, "profiles", userId);
        await updateDoc(accountRef, {
            emailActions: arrayUnion(email)
        });
    }

    async setTester(userId, isTester) {
        const accountRef = doc(firestore, "profiles", userId);
        await updateDoc(accountRef, isTester
            ? { isTester: true, testerSince: serverTimestamp() }
            : { isTester: deleteField(), testerSince: deleteField() });
        this.updateCachedProfile(userId, { isTester: isTester || undefined });
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
