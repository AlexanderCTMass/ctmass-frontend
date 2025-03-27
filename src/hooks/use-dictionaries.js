import {useDispatch, useSelector} from "src/store";
import {useCallback, useEffect} from "react";
import {thunks} from "src/thunks/dictionary";

const useDictionary = () => {
    const dispatch = useDispatch();
    const dictionary = useSelector((state) => state.dictionary);

    const handleDictionaryGet = useCallback(() => {
        dispatch(thunks.getDictionary({}));
    }, [dispatch]);

    useEffect(() => {
            handleDictionaryGet();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []);


    const handleAddServiceToDictionary = useCallback((service) => {
        dispatch(thunks.addService({service}));
    }, [dispatch]);

    return {
        categories: dictionary.categories,
        specialties: dictionary.specialties,
        services: dictionary.services,
        loading: dictionary.loading,
        addService: handleAddServiceToDictionary
    };
};

export default useDictionary;