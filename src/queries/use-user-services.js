import { useQuery } from '@tanstack/react-query';
import { profileApi } from 'src/api/profile';

export const userServicesKey = (userId) => ['user-services', userId];

// A user's services list. Cached one-shot read.
export const useUserServices = (userId) =>
    useQuery({
        queryKey: userServicesKey(userId),
        queryFn: () => profileApi.getUserServices(userId),
        enabled: Boolean(userId),
        staleTime: 2 * 60 * 1000
    });
