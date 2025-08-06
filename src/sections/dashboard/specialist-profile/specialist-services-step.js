import PropTypes from 'prop-types';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import {
    Box,
    Button,
    CircularProgress, InputAdornment,
    Stack,
    SvgIcon, TextField,
    Typography,
} from '@mui/material';
import React, {useEffect, useState} from "react";
import toast from "react-hot-toast";
import {profileApi} from "src/api/profile";
import {dictionaryApi} from "src/api/dictionary";
import {ERROR, INFO} from "src/libs/log";
import useDictionary from "src/hooks/use-dictionaries";
import useUserSpecialties from "src/hooks/use-userSpecialties";
import {SpecialtySelectForm} from "src/components/specialty-select-form";
import {SpecialtyServiceCard} from "src/sections/cabinet/profile/views/specialty-card";

export const SpecialistServicesStep = (props) => {
    const {profile, onNext, onBack, ...other} = props;
    const [specialties, setSpecialties] = useState([]);
    const [servicesMap, setServicesMap] = useState({});
    const [open, setOpen] = useState(false);
    const {userSpecialties, userServices, isFetching: isFetchingUserSpecialties} = useUserSpecialties(profile.id);
    const {specialties: dictionarySpecialties, services} = useDictionary();
    const [submitting, setSubmitting] = useState(false);
    const [hourlyRate, setHourlyRate] = useState(profile?.hourlyRate || "");

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

    const handleOnNext = async () => {
        try {
            setSubmitting(true);
            if (userSpecialties !== specialties) {
                userSpecialties.forEach((ds) => {
                    profileApi.removeSpecialty(profile.id, ds);
                });

                const addableSpec = specialties.filter(value => !value.id.startsWith("new_"));
                const newSpecList = specialties.filter(value => value.id.startsWith("new_"));

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
                    if (service.label !== '') {
                        if (!services.allIds.includes(service.service)) {
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
                    }
                })
            );


            onNext({
                hourlyRate: hourlyRate,
                profileDataProgress: 3
            });
        } catch (err) {
            ERROR(err);
            toast.error('Failed to save data');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClickClose = () => {
        setOpen(false);
    };

    const handleSpecialtiesChange = (addedSpecialties) => {
        setSpecialties((prevState) => {
            return [...prevState.filter((specialty) => specialty.id !== addedSpecialties.id), addedSpecialties];
        });

        setServicesMap(prev => ({
            ...prev,
            [addedSpecialties.id]: []
        }));
    };

    const handleRemoveSpecialty = (spec) => {
        setSpecialties(prev => prev.filter(s => s.id !== spec.id));
        setServicesMap(prev => {
            const newMap = {...prev};
            delete newMap[spec.id];
            return newMap;
        });
    };

    const handleUpdateServices = (specialtyId, services) => {
        setServicesMap(prev => ({
            ...prev,
            [specialtyId]: services
        }));
    };

    return (
        <Stack spacing={3} {...other}>
            <div>
                <Typography variant="h6">
                    Specialties and Services
                </Typography>
                <Typography variant="body2" sx={{mt: 1, mb: 1}}>
                    What's your standard hourly rate?
                </Typography>

                <TextField
                    fullWidth
                    variant="filled"
                    label="Standard hourly rate"
                    value={hourlyRate}
                    onChange={(e) => {
                        setHourlyRate(e.target.value)
                    }}
                    placeholder="e.g. 300"
                    InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        endAdornment: <InputAdornment position="end">/hr</InputAdornment>
                    }}
                />


                <Typography variant="body2" sx={{mt: 3}}>
                    Add your specialties and define services with prices for each one
                </Typography>
            </div>

            {!isFetchingUserSpecialties ? (
                <CircularProgress/>
            ) : (
                <Stack direction="column" spacing={2}>
                    {specialties.map((spec) => (
                        <SpecialtyServiceCard
                            key={spec.id}
                            spec={spec}
                            services={services}
                            initialServices={servicesMap[spec.id] || []}
                            onUpdateServices={handleUpdateServices}
                            onRemoveSpecialty={handleRemoveSpecialty}
                            initEdit={true}
                        />
                    ))}

                    <Button
                        variant="outlined"
                        onClick={handleClickOpen}
                    >
                        Add Specialties
                    </Button>

                    <SpecialtySelectForm
                        open={open}
                        selectedSpecialties={specialties}
                        disabledSelected={false}
                        onSpecialtyChange={handleSpecialtiesChange}
                        onClose={handleClickClose}
                    />
                </Stack>
            )}

            <Stack alignItems="center" direction="row" spacing={2} sx={{pt: 2}}>
                <Button
                    endIcon={(
                        <SvgIcon>
                            <ArrowRightIcon/>
                        </SvgIcon>
                    )}
                    startIcon={submitting && <CircularProgress color="inherit" size={20}/>}
                    onClick={handleOnNext}
                    variant="contained"
                    disabled={!specialties.length || submitting}
                >
                    Next
                </Button>
                <Button
                    color="inherit"
                    onClick={onBack}
                >
                    Back
                </Button>
            </Stack>
        </Stack>
    );
};

SpecialistServicesStep.propTypes = {
    onBack: PropTypes.func,
    onNext: PropTypes.func
};