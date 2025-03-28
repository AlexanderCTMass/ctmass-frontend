import {ProfileSpecialtiesHeader} from "src/pages/cabinet/profiles/my/servicesAndPrices/ProfileSpecialtiesHeader";
import React, {useCallback, useEffect, useState} from "react";
import {Button, CircularProgress, Stack} from "@mui/material";
import {SpecialtyServiceCard} from "src/sections/cabinet/profile/views/specialty-card";
import {SpecialtySelectForm} from "src/components/specialty-select-form";
import useUserSpecialties from "src/hooks/use-userSpecialties";
import useDictionary from "src/hooks/use-dictionaries";
import {profileApi} from "src/api/profile";
import {dictionaryApi} from "src/api/dictionary";
import {ERROR, INFO} from "src/libs/log";
import toast from "react-hot-toast";

export const SpecialtiesView = (props) => {
    const {isMyProfile, profile} = props;

    const [specialties, setSpecialties] = useState([]);
    const [servicesMap, setServicesMap] = useState({});
    const [open, setOpen] = useState(false);
    const {userSpecialties, userServices, isFetching: isFetchingUserSpecialties} = useUserSpecialties(profile?.id);
    const {specialties: dictionarySpecialties, services: dictionaryServices} = useDictionary();
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isFetchingUserSpecialties) {
            setSpecialties(userSpecialties);
            const initialServicesMap = {};
            userSpecialties.forEach(spec => {
                initialServicesMap[spec.id] = userServices
                    .filter(service => service.specialtyId === spec.id)
                    .map(service => ({
                        id: service.id,
                        service: service.serviceId,
                        price: service.price,
                        priceType: service.priceType,
                        specialtyId: service.specialtyId,
                    }));
            });
            setServicesMap(initialServicesMap);
        }
    }, [isFetchingUserSpecialties, userSpecialties, userServices]);

    const handleOnSaved = useCallback(async (newSpecialties) => {
        try {
            INFO("Saving...", specialties, newSpecialties, servicesMap);
            setSubmitting(true);
            if (!newSpecialties) {
                newSpecialties = [...specialties];
            }

            if (userSpecialties !== newSpecialties) {
                userSpecialties.forEach((ds) => {
                    profileApi.removeSpecialty(profile.id, ds);
                });

                const addableSpec = newSpecialties.filter(value => !value.id.startsWith("new_"));
                const newSpecList = newSpecialties.filter(value => value.id.startsWith("new_"));

                if (newSpecList.length > 0) {
                    const newCatsList = new Set(newSpecList.map(value => value.parent).filter(value => value.id.startsWith("new_")));
                    const oldIdMap = new Map();

                    for (const value of newCatsList) {
                        let response = await dictionaryApi.addCategory({label: value.label});
                        oldIdMap.set(value.id, response.id);
                    }

                    for (const newSpec of newSpecList) {
                        let response = await dictionaryApi.addSpecialty({
                            label: newSpec.label,
                            parent: newSpec.parent.id.startsWith("new_") ? oldIdMap.get(newSpec.parent.id) : newSpec.parent.id
                        });
                        addableSpec.push(response);
                    }
                }

                await profileApi.addSpecialties(profile.id, addableSpec);
            }

            const allServices = Object.values(servicesMap).flat();
            const currentServiceIds = userServices.map(s => s.id);

            await Promise.all(
                currentServiceIds.map(id =>
                    profileApi.removeService(id)
                ));

            await Promise.all(
                allServices.map(service => {
                    if (!dictionaryServices.allIds.includes(service.service)) {
                        return dictionaryApi.addService({
                            label: service.service,
                            accepted: false
                        }, service.specialtyId, dictionarySpecialties.byId[service.specialtyId].parent).then(newService => {
                            return profileApi.addService(
                                profile.id,
                                service.specialtyId,
                                newService.id,
                                service.price,
                                service.priceType
                            );
                        });
                    } else {
                        return profileApi.addService(
                            profile.id,
                            service.specialtyId,
                            service.service,
                            service.price,
                            service.priceType
                        );
                    }
                })
            );
            toast.success('Successfully saved');
        } catch (err) {
            ERROR(err);
            toast.error('Failed to save data');
        } finally {
            setSubmitting(false);
        }
    }, [specialties, servicesMap]);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClickClose = () => {
        setOpen(false);
    };

    const handleSpecialtiesChange = async (addedSpecialties) => {
        setSpecialties((prevState) => {
            return [...prevState.filter((specialty) => specialty.id !== addedSpecialties.id), addedSpecialties];
        });

        setServicesMap(prev => ({
            ...prev,
            [addedSpecialties.id]: []
        }));

        // Автосохранение после добавления
        try {
            await handleOnSaved([...specialties, addedSpecialties]);
        } catch (err) {
            ERROR(err);
            toast.error('Failed to save after adding specialty');
        }
    }

    const handleRemoveSpecialty = async (spec) => {
        setSpecialties(prev => prev.filter(s => s.id !== spec.id));
        setServicesMap(prev => {
            const newMap = {...prev};
            delete newMap[spec.id];
            return newMap;
        });
        try {
            await handleOnSaved([...specialties.filter(s => s.id !== spec.id)]);
        } catch (err) {
            ERROR(err);
            toast.error('Failed to save after adding specialty');
        }
    };

    const handleUpdateServices = async (specialtyId, services) => {
        setServicesMap(prev => ({
            ...prev,
            [specialtyId]: services
        }));
    };


    return <>
        <ProfileSpecialtiesHeader isMyProfile={isMyProfile}
                                  openAddServiceDialog={handleClickOpen}/>
        {!isFetchingUserSpecialties ? (
            <CircularProgress/>
        ) : (
            <Stack direction="column" spacing={2}>
                {specialties.map((spec) => (
                    <SpecialtyServiceCard
                        key={spec.id}
                        spec={spec}
                        services={dictionaryServices}
                        initialServices={servicesMap[spec.id] || []}
                        onUpdateServices={handleUpdateServices}
                        onRemoveSpecialty={handleRemoveSpecialty}
                        onSave={handleOnSaved}
                    />
                ))}


                <SpecialtySelectForm
                    open={open}
                    selectedSpecialties={specialties}
                    disabledSelected={false}
                    onSpecialtyChange={handleSpecialtiesChange}
                    onClose={handleClickClose}
                    onChange={handleOnSaved}
                />
            </Stack>
        )}
    </>

}