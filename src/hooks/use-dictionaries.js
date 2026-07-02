import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { dictionaryApi } from "src/api/dictionary";
import { objFromArray } from "src/utils/obj-from-array";

// Split into two queries so the light categories+specialties render immediately
// while the heavy "all services" collection-group scan streams in separately.
export const DICTIONARY_BASE_KEY = ['dictionary', 'base'];
export const DICTIONARY_SERVICES_KEY = ['dictionary', 'services'];

const EMPTY_SECTION = { byId: {}, allIds: [] };

const fetchDictionaryBase = async () => {
    const [categories, specialties] = await Promise.all([
        dictionaryApi.getCategories(),
        dictionaryApi.getSpecialties()
    ]);

    const categoriesById = objFromArray(categories || []);
    const specialtiesById = objFromArray(
        (specialties || []).map((specialty) => ({
            ...specialty,
            category: categoriesById[specialty.parent]
        }))
    );

    return {
        categories: { byId: categoriesById, allIds: Object.keys(categoriesById) },
        specialties: { byId: specialtiesById, allIds: Object.keys(specialtiesById) }
    };
};

const fetchServicesList = async () => {
    const services = await dictionaryApi.getServices();
    return services || [];
};

const useDictionary = () => {
    const queryClient = useQueryClient();

    const baseQuery = useQuery({
        queryKey: DICTIONARY_BASE_KEY,
        queryFn: fetchDictionaryBase,
        staleTime: Infinity,
        gcTime: Infinity
    });

    const servicesQuery = useQuery({
        queryKey: DICTIONARY_SERVICES_KEY,
        queryFn: fetchServicesList,
        staleTime: Infinity,
        gcTime: Infinity
    });

    const categories = baseQuery.data?.categories || EMPTY_SECTION;
    const specialties = baseQuery.data?.specialties || EMPTY_SECTION;

    const services = useMemo(() => {
        const list = servicesQuery.data;
        if (!list) {
            return EMPTY_SECTION;
        }
        const specialtiesById = baseQuery.data?.specialties?.byId || {};
        const byId = objFromArray(
            list.map((service) => ({
                ...service,
                specialty: specialtiesById[service.parent]
            }))
        );
        return { byId, allIds: Object.keys(byId) };
    }, [servicesQuery.data, baseQuery.data]);

    const handleAddServiceToDictionary = useCallback((service) => {
        queryClient.setQueryData(DICTIONARY_SERVICES_KEY, (old) => {
            const list = Array.isArray(old) ? old : [];
            if (list.some((item) => item.id === service.id)) {
                return list.map((item) => (item.id === service.id ? service : item));
            }
            return [...list, service];
        });
    }, [queryClient]);

    const handleAddSpecialtyToDictionary = useCallback((specialty) => {
        queryClient.setQueryData(DICTIONARY_BASE_KEY, (old) => {
            if (!old) {
                return old;
            }
            const byId = { ...old.specialties.byId, [specialty.id]: specialty };
            return { ...old, specialties: { byId, allIds: Object.keys(byId) } };
        });
    }, [queryClient]);

    return {
        categories,
        specialties,
        services,
        // Backwards-compatible inverted semantic: `loading` is true once the whole
        // dictionary (base + services) has loaded. Consumers do `if (loading) { ...use data }`.
        loading: baseQuery.isSuccess && servicesQuery.isSuccess,
        addService: handleAddServiceToDictionary,
        addSpecialty: handleAddSpecialtyToDictionary
    };
};

export default useDictionary;
