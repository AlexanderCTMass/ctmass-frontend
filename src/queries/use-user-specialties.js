import { useQuery } from '@tanstack/react-query';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from 'src/libs/firebase';

const fetchUserSpecialtyIds = async () => {
    const snapshot = await getDocs(collection(firestore, 'userSpecialties'));
    // Raw list of specialty ids (with duplicates) — callers use it both for
    // membership checks and popularity counts.
    return snapshot.docs.map((doc) => doc.data().specialty);
};

export const userSpecialtyIdsKey = ['userSpecialties', 'ids'];

// Which specialties actually have specialists behind them. Used to filter the
// specialty pickers on the home page and the project creation flow.
export const useUserSpecialtyIds = () =>
    useQuery({
        queryKey: userSpecialtyIdsKey,
        queryFn: fetchUserSpecialtyIds,
        staleTime: 10 * 60 * 1000
    });
