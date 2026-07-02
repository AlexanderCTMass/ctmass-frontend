import { useQuery } from '@tanstack/react-query';
import { reelsApi } from 'src/api/reels';

export const userReelsKey = (userId) => ['reels', 'by-user', userId];

// A user's reels. Cached so the overview doesn't re-fetch on every mount;
// add/delete update the cache directly via setQueryData.
export const useUserReels = (userId) =>
    useQuery({
        queryKey: userReelsKey(userId),
        queryFn: () => reelsApi.getUserReels(userId),
        enabled: Boolean(userId),
        staleTime: 5 * 60 * 1000
    });
