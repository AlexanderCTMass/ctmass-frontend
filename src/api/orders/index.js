import {order, orders} from './data';
import {deepCopy} from 'src/utils/deep-copy';
import {applyPagination} from 'src/utils/apply-pagination';
import {applySort} from 'src/utils/apply-sort';
import {collection, getDocs, orderBy, query, where} from "firebase/firestore";
import {firestore} from "../../libs/firebase";

class OrdersApi {
    async getOrders(request = {}, customerId) {
        const {filters, page, rowsPerPage, sortBy, sortDir} = request;

        // let data = deepCopy(orders);
        let data = [];
        // Query the first page of docs


        const first = customerId ?
            query(collection(firestore, "jobs"),
                where("userId", "==", customerId),
                orderBy("createDate")) :
            query(collection(firestore, "jobs"),
                orderBy("createDate"));
        const documentSnapshots = await getDocs(first);
        documentSnapshots.forEach((doc) => {
            const items = doc.data();
            data.push({...items, number: doc.id, id: doc.id});
        });


        let count = data.length;

        if (typeof filters !== 'undefined') {
            data = data.filter((order) => {
                if (typeof filters.query !== 'undefined' && filters.query !== '') {
                    // Checks only the order number, but can be extended to support other fields, such as customer
                    // name, email, etc.
                    const containsQuery = (order.number || '')
                        .toLowerCase()
                        .includes(filters.query.toLowerCase());

                    if (!containsQuery) {
                        return false;
                    }
                }

                if (typeof filters.status !== 'undefined') {
                    const statusMatched = order.status === filters.status;

                    if (!statusMatched) {
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

    getOrder(request = {}) {
        return Promise.resolve(deepCopy(order));
    }
}

export const ordersApi = new OrdersApi();
