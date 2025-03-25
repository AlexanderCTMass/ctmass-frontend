import PropTypes from 'prop-types';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import {
    Avatar,
    Box,
    Button,
    CircularProgress,
    IconButton,
    Stack,
    SvgIcon,
    TextField,
    Tooltip,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    MenuItem,
    InputAdornment
} from '@mui/material';
import {useCallback, useEffect, useRef, useState} from "react";
import User01Icon from "@untitled-ui/icons-react/build/esm/User01";
import {getDownloadURL, ref, uploadBytes} from "firebase/storage";
import {storage} from "src/libs/firebase";
import toast from "react-hot-toast";
import Slider from "@mui/material/Slider";
import * as React from "react";
import SpecialityCard from "../account/general/specialties-card";
import {SpecialtySelectForm} from "src/components/specialty-select-form";
import CardContent from "@mui/material/CardContent";
import Card from "@mui/material/Card";
import ArchiveIcon from "@untitled-ui/icons-react/build/esm/Archive";
import AddIcon from "@untitled-ui/icons-react/build/esm/Plus";
import DeleteIcon from "@untitled-ui/icons-react/build/esm/Delete";
import {profileApi} from "src/api/profile";
import {useDispatch, useSelector} from "src/store";
import {thunks} from "src/thunks/dictionary";
import {dictionaryApi} from "src/api/dictionary";
import {ERROR, INFO} from "src/libs/log";
import useDictionary from "src/hooks/use-dictionaries";
import {v4 as uuidv4} from 'uuid';

const useUserSpecialties = (userId) => {
    const {categories, specialties, services, loading} = useDictionary();
    const [userSpecialties, setUserSpecialties] = useState([]);
    const [userServices, setUserServices] = useState([]);
    const [isFetching, setIsFetching] = useState(false);

    useEffect(() => {
        setIsFetching(false);
        const fetchData = async () => {
            // Загружаем специальности пользователя
            const specialtiesResponse = await profileApi.getUserSpecialtiesById(userId);
            const specialtiesList = specialtiesResponse.map(uS => specialties.byId[uS.specialty]);

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

    return {userSpecialties, userServices, isFetching};
};

export const SpecialistServicesStep = (props) => {
    const {profile, onNext, onBack, ...other} = props;
    const [specialties, setSpecialties] = useState([]);
    const [servicesMap, setServicesMap] = useState({}); // {specialtyId: [{id, label, price}, ...]}
    const [open, setOpen] = useState(false);
    const {userSpecialties, userServices, isFetching: isFetchingUserSpecialties} = useUserSpecialties(profile.id);
    const {specialties: dictionarySpecialties, services} = useDictionary();
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        INFO("dic", services)
    }, [services]);

    useEffect(() => {
        if (isFetchingUserSpecialties) {
            setSpecialties(userSpecialties);

            // Инициализируем карту услуг по специальностям
            const initialServicesMap = {};
            userSpecialties.forEach(spec => {
                initialServicesMap[spec.id] = userServices
                    .filter(service => service.specialtyId === spec.id)
                    .map(service => ({
                        id: service.id,
                        service: service.serviceId,
                        price: service.price,
                        specialtyId: service.specialtyId,
                        isCustom: !services.allIds.includes(service.serviceId) // Определяем кастомные услуги
                    }));
            });
            INFO("INIT SERVICE MAP", userSpecialties, userServices, initialServicesMap);

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

            // Обрабатываем пользовательские услуги
            await Promise.all(
                allServices.map(service => {
                    // Если услуга не из списка (пользовательский ввод)
                    if (!services.allIds.includes(service.service)) {
                        // Создаем новую услугу в словаре
                        return dictionaryApi.addService({
                            label: service.service,
                            accepted: false
                        }, service.specialtyId, dictionarySpecialties.byId[service.specialtyId].parent).then(newService => {
                            // Добавляем связь с профилем
                            return profileApi.addService(
                                profile.id,
                                service.specialtyId,
                                newService.id,
                                service.price
                            );
                        });
                    } else {
                        // Обычная услуга из списка
                        return profileApi.addService(
                            profile.id,
                            service.specialtyId,
                            service.service,
                            service.price
                        );
                    }
                })
            );

            onNext({
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

        // Инициализируем пустой массив услуг для новой специальности
        setServicesMap(prev => ({
            ...prev,
            [addedSpecialties.id]: []
        }));
    };

    const handleRemoveSpecialty = useCallback((spec) => {
        setSpecialties(prev => prev.filter(s => s.id !== spec.id));

        // Удаляем услуги для этой специальности
        setServicesMap(prev => {
            const newMap = {...prev};
            delete newMap[spec.id];
            return newMap;
        });
    }, []);

    const handleAddService = (specialtyId) => {
        setServicesMap(prev => ({
            ...prev,
            [specialtyId]: [
                ...(prev[specialtyId] || []),
                {
                    id: uuidv4(),
                    service: '',
                    price: '',
                    specialtyId,
                    isCustom: false
                }
            ]
        }));
    };

    const handleRemoveService = (specialtyId, serviceId) => {
        setServicesMap(prev => ({
            ...prev,
            [specialtyId]: prev[specialtyId].filter(s => s.id !== serviceId)
        }));
    };

    const handleServiceChange = (specialtyId, serviceId, field, value) => {
        setServicesMap(prev => ({
            ...prev,
            [specialtyId]: prev[specialtyId].map(service =>
                service.id === serviceId ? {...service, [field]: value} : service
            )
        }));
    };

    return (
        <Stack spacing={3} {...other}>
            <div>
                <Typography variant="h6">
                    Specialties and Services
                </Typography>
                <Typography variant="body2">
                    Add your specialties and define services with prices for each one
                </Typography>
            </div>

            {!isFetchingUserSpecialties ? (
                <CircularProgress/>
            ) : (
                <Stack direction="column" spacing={2}>
                    {specialties.map((spec) => (
                        <Card key={spec.id}
                              sx={{':hover': {boxShadow: (theme) => `${theme.palette.primary.main} 0 0 5px`}}}>
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Typography sx={{fontSize: 14}} color="text.secondary" gutterBottom>
                                            {spec.category?.label}
                                        </Typography>
                                        <Typography variant="h5" component="div">
                                            {spec.label}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Tooltip title="Delete specialty">
                                            <IconButton color="error" onClick={() => handleRemoveSpecialty(spec)}>
                                                <SvgIcon>
                                                    <ArchiveIcon/>
                                                </SvgIcon>
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Stack>

                                <Box sx={{mt: 2}}>
                                    <Table size="small" sx={{
                                        '& .MuiTableCell-root': {
                                            padding: '8px',
                                            borderBottom: 'none'
                                        },
                                        '& .MuiTableRow-root': {
                                            '&:last-child td': {
                                                borderBottom: 'none'
                                            }
                                        }
                                    }}>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell width="350px">Service</TableCell>
                                                <TableCell width="130px" align="center">Price</TableCell>
                                                <TableCell width="30px" align="right"></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {(servicesMap[spec.id] || []).map((service) => (
                                                <TableRow key={service.id} hover>
                                                    <TableCell>
                                                        {service.isCustom ? (
                                                            <TextField
                                                                fullWidth
                                                                size="small"
                                                                variant="outlined"
                                                                margin="none"
                                                                value={service.service}
                                                                onChange={(e) => handleServiceChange(spec.id, service.id, 'service', e.target.value)}
                                                                onBlur={() => {
                                                                    if (!service.service) {
                                                                        // Если поле пустое, удаляем кастомную услугу
                                                                        handleRemoveService(spec.id, service.id);
                                                                    }
                                                                }}
                                                                sx={{
                                                                    '& .MuiOutlinedInput-root': {
                                                                        height: '32px'
                                                                    }
                                                                }}
                                                                InputProps={{
                                                                    endAdornment: (
                                                                        <InputAdornment position="end">

                                                                            <IconButton
                                                                                size="small"
                                                                                onClick={() => handleRemoveService(spec.id, service.id)}
                                                                            >
                                                                                <Tooltip title="Delete service">
                                                                                    <SvgIcon fontSize="small">
                                                                                        <DeleteIcon/>
                                                                                    </SvgIcon>
                                                                                </Tooltip>
                                                                            </IconButton>
                                                                        </InputAdornment>
                                                                    )
                                                                }}
                                                            />
                                                        ) : (
                                                            <TextField
                                                                select
                                                                fullWidth
                                                                size="small"
                                                                variant="outlined"
                                                                margin="none"
                                                                value={service.service}
                                                                onChange={(e) => {
                                                                    if (e.target.value === 'custom') {
                                                                        // Переключаемся в режим кастомного ввода
                                                                        handleServiceChange(spec.id, service.id, 'isCustom', true);
                                                                        handleServiceChange(spec.id, service.id, 'service', '');
                                                                    } else {
                                                                        handleServiceChange(spec.id, service.id, 'service', e.target.value);
                                                                    }
                                                                }}
                                                                sx={{
                                                                    '& .MuiOutlinedInput-root': {
                                                                        height: '32px'
                                                                    }
                                                                }}
                                                            >
                                                                {services.allIds
                                                                    .filter(id => {
                                                                        const isSameSpecialty = services.byId[id].parent === spec.id;
                                                                        const isAlreadyAdded = servicesMap[spec.id]?.some(s => s.service === id && s.id !== service.id);
                                                                        return isSameSpecialty && !isAlreadyAdded;
                                                                    })
                                                                    .map((id) => (
                                                                        <MenuItem key={id} value={id} dense>
                                                                            {services.byId[id].label}
                                                                        </MenuItem>
                                                                    ))}
                                                                <MenuItem value="custom" dense>
                                                                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                                                                        <AddIcon fontSize="small" sx={{mr: 1}}/>
                                                                        Add custom service
                                                                    </Box>
                                                                </MenuItem>
                                                                {services.allIds
                                                                        .filter(id => services.byId[id].parent === spec.id)
                                                                        .length > 0 &&
                                                                    servicesMap[spec.id]?.length >= services.allIds
                                                                        .filter(id => services.byId[id].parent === spec.id)
                                                                        .length && (
                                                                        <MenuItem disabled>
                                                                            All available services for this specialty
                                                                            have been added
                                                                        </MenuItem>
                                                                    )}
                                                            </TextField>
                                                        )}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <TextField
                                                            type="number"
                                                            size="small"
                                                            variant="outlined"
                                                            margin="none"
                                                            value={service.price}
                                                            onChange={(e) => handleServiceChange(spec.id, service.id, 'price', Number(e.target.value))}
                                                            InputProps={{
                                                                inputProps: {
                                                                    min: 0,
                                                                    style: {
                                                                        // Отключаем стрелки в браузерах WebKit
                                                                        '-moz-appearance': 'textfield', // Firefox
                                                                        '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                                                                            '-webkit-appearance': 'none', // Chrome, Safari
                                                                            margin: 0,
                                                                        },
                                                                    },
                                                                },
                                                                startAdornment: <InputAdornment
                                                                    position="start">$</InputAdornment>,
                                                                sx: {
                                                                    width: '100%',
                                                                    height: '32px',
                                                                    // Добавляем стили для InputBase
                                                                    '& input[type=number]': {
                                                                        '-moz-appearance': 'textfield', // Firefox
                                                                    },
                                                                    '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
                                                                        '-webkit-appearance': 'none', // Chrome, Safari
                                                                        margin: 0,
                                                                    },
                                                                }
                                                            }}
                                                            sx={{
                                                                maxWidth: '100px',
                                                                // Дублируем стили для TextField
                                                                '& .MuiOutlinedInput-input': {
                                                                    '-moz-appearance': 'textfield',
                                                                    '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                                                                        '-webkit-appearance': 'none',
                                                                        margin: 0,
                                                                    },
                                                                }
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => handleRemoveService(spec.id, service.id)}
                                                            sx={{padding: '4px'}}
                                                        >
                                                            <SvgIcon fontSize="small">
                                                                <DeleteIcon/>
                                                            </SvgIcon>
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                    <Button
                                        startIcon={<AddIcon/>}
                                        onClick={() => handleAddService(spec.id)}
                                        sx={{mt: 1}}
                                        size="small"
                                    >
                                        Add Service
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
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
