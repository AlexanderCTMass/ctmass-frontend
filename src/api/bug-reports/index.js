import { firestore } from 'src/libs/firebase';
import { doc, runTransaction } from 'firebase/firestore';

export const getNextBugNumber = async () => {
    const counterRef = doc(firestore, 'meta', 'bugReportCounter');
    return await runTransaction(firestore, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        const currentCount = counterDoc.exists() ? counterDoc.data().count : 0;
        const nextCount = currentCount + 1;
        transaction.set(counterRef, { count: nextCount });
        return nextCount;
    });
};
