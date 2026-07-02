import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { extendedProfileApi } from 'src/pages/cabinet/profiles/my/data/extendedProfileApi';

export const userDataKey = (profileId, hasSpecialties) => ['user-data', profileId, hasSpecialties];

// Aggregate public profile payload (profile + specialties + education + reviews +
// portfolio + friends). `specialties` (the dictionary list) only enriches friend
// labels, so it's folded into the key as a boolean and keepPreviousData avoids a
// spinner flash when the enriched refetch runs.
export const useUserData = (profileId, specialties = []) => {
    const hasSpecialties = Array.isArray(specialties) && specialties.length > 0;
    return useQuery({
        queryKey: userDataKey(profileId, hasSpecialties),
        queryFn: () => extendedProfileApi.getUserData(profileId, specialties),
        enabled: Boolean(profileId),
        staleTime: 2 * 60 * 1000,
        placeholderData: keepPreviousData
    });
};
