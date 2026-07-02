import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { cabinetApi } from 'src/api/cabinet';

export const profileInformationKey = (userId) => ['profile-information', userId];

// Cabinet profile document (form-shaped). Read on Profile Settings and on the
// trade-create prefill, so caching it avoids a refetch every time those pages mount.
export const useProfileInformation = (userId) =>
    useQuery({
        queryKey: profileInformationKey(userId),
        queryFn: () => cabinetApi.getProfileInformation(userId),
        enabled: Boolean(userId),
        staleTime: 5 * 60 * 1000
    });

// Helper so write paths (save / avatar / address) can refresh the cache after a mutation.
export const useInvalidateProfileInformation = (userId) => {
    const queryClient = useQueryClient();
    return useCallback(
        () => queryClient.invalidateQueries({ queryKey: profileInformationKey(userId) }),
        [queryClient, userId]
    );
};
