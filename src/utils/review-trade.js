import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { firestore } from 'src/libs/firebase';
import { canonicalTradeLabel, findTrade } from 'src/constants/trade-taxonomy';

export const resolveReviewTradeId = async (contractorId, projectId) => {
    if (!contractorId) return null;
    try {
        let specialtyLabel = '';
        if (projectId) {
            const projectSnap = await getDoc(doc(firestore, 'projects', projectId));
            const project = projectSnap.exists() ? projectSnap.data() : {};
            if (typeof project.tradeId === 'string' && project.tradeId) {
                return project.tradeId;
            }
            specialtyLabel = project.specialtyLabel || project.subtitle || '';
        }
        const snapshot = await getDocs(query(collection(firestore, 'trades'), where('ownerId', '==', contractorId)));
        const trades = snapshot.docs.map((tradeDoc) => {
            const data = tradeDoc.data();
            return {
                id: tradeDoc.id,
                label: data.primarySpecialtyLabel || data.subtitle || '',
                services: Array.isArray(data.services) ? data.services : []
            };
        });
        if (trades.length === 0) return null;
        const target = findTrade(specialtyLabel);
        const wanted = target?.label ?? specialtyLabel;
        const exact = trades.find((trade) => canonicalTradeLabel(trade.label) === wanted);
        if (exact) return exact.id;
        const byService = trades.find((trade) => trade.services.includes(wanted));
        if (byService) return byService.id;
        const sameGroup = target
            ? trades.find((trade) => findTrade(trade.label)?.groupId === target.groupId)
            : null;
        return (sameGroup ?? trades[0]).id;
    } catch (error) {
        return null;
    }
};
