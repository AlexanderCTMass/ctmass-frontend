import { useQuery } from '@tanstack/react-query';
import { profileApi } from 'src/api/profile';

export const profileKey = (profileId) => ['profile', profileId];

// Single profile document by id. Cached so repeat views / mounts don't re-read.
export const useProfile = (profileId) =>
    useQuery({
        queryKey: profileKey(profileId),
        queryFn: () => profileApi.getProfileById(profileId),
        enabled: Boolean(profileId),
        staleTime: 5 * 60 * 1000
    });
