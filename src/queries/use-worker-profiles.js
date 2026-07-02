import { useQuery } from '@tanstack/react-query';
import { profileApi } from 'src/api/profile';
import { tradesApi } from 'src/api/trades';
import { roles } from 'src/roles';

const STALE = 10 * 60 * 1000;

export const workerProfilesKey = (limit) => ['profiles', 'worker', 'with-reviews', limit];
export const workerProfilesBasicKey = (limit) => ['profiles', 'worker', 'basic', limit];

// Full worker data incl. per-profile reviews/specialties + the latest trade's
// pricing (so cards can show real hourly/project prices instead of a default).
const fetchWorkerProfiles = async (limit) => {
    const workers = await profileApi.getProfilesWithReviews(roles.WORKER, limit);

    await Promise.all(
        workers.map(async (worker) => {
            try {
                const latestTrade = await tradesApi.getLatestTrade(worker.id);
                worker.pricing = latestTrade?.pricing || null;
            } catch (error) {
                worker.pricing = null;
            }
        })
    );

    return workers;
};

export const useWorkerProfiles = (limit = 12) =>
    useQuery({
        queryKey: workerProfilesKey(limit),
        queryFn: () => fetchWorkerProfiles(limit),
        staleTime: STALE
    });

// Two-stage showcase for the home page: a fast profiles-only query paints the
// cards immediately, then the enriched query (ratings/reviews) swaps in when
// ready. Both are shared/cached so hero/gallery/bests/cloud reuse one fetch each.
export const useWorkerShowcase = (limit = 12) => {
    const basic = useQuery({
        queryKey: workerProfilesBasicKey(limit),
        queryFn: () => profileApi.getProfiles(roles.WORKER, limit),
        staleTime: STALE
    });

    const enriched = useWorkerProfiles(limit);

    const data = enriched.data ?? basic.data ?? [];

    return {
        data,
        isLoading: data.length === 0 && (basic.isLoading || enriched.isLoading),
        isEnriched: Boolean(enriched.data)
    };
};
