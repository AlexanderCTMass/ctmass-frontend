import {useEffect, useState} from "react";
import useDictionary from "src/hooks/use-dictionaries";
import {profileApi} from "src/api/profile";


const useUserSpecialties = (userId) => {
    const {categories, specialties, services, loading, addService} = useDictionary();
    const [userSpecialties, setUserSpecialties] = useState([]);
    const [userServices, setUserServices] = useState([]);
    const [isFetching, setIsFetching] = useState(false);

    useEffect(() => {
        setIsFetching(false);
        const fetchData = async () => {
            // Загружаем специальности пользователя
            debugger
            const specialtiesResponse = await profileApi.getUserSpecialtiesById(userId);
            const specialtiesList = specialtiesResponse.map(uS => specialties.byId[uS.specialty])
                .filter(s => s !== undefined);

            // Загружаем услуги пользователя
            const servicesResponse = await profileApi.getUserServices(userId);

            setUserSpecialties(specialtiesList);
            setUserServices(servicesResponse);
            setIsFetching(true);
        };

        if (loading) {
            fetchData();
        }
    }, [loading]);

    return {userSpecialties, userServices, isFetching, addService};
};

export default useUserSpecialties;