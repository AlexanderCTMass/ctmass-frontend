import {
    Autocomplete,
    Button,
    CircularProgress,
    Stack,
    SvgIcon,
    TextField,
    Typography,
    Alert,
    FormControlLabel,
    Checkbox,
    Link,
    Box,
    Collapse
} from '@mui/material';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import PropTypes from 'prop-types';
import * as React from "react";
import {useState, useEffect} from "react";
import {getFirestore, collectionGroup, getDocs, collection} from "firebase/firestore";
import {useSearchParams} from "react-router-dom";

export const ProjectServiceStep = ({onBack, onNext, project, ...other}) => {
    const [specialties, setSpecialties] = useState([]);
    const [services, setServices] = useState([]);
    const [specialty, setSpecialty] = useState(null);
    const [service, setService] = useState(null);
    const [customService, setCustomService] = useState(project?.customService);
    const [loading, setLoading] = useState(true);
    const [notKnowSpecialistCategory, setNotKnowSpecialistCategory] = useState(project?.notKnowSpecialistCategory || false);

    useEffect(() => {
        const db = getFirestore();

        const fetchData = async () => {
            try {
                // Загружаем данные из коллекций
                const specialtiesSnapshot = await getDocs(collectionGroup(db, "specialties"));
                const servicesSnapshot = await getDocs(collectionGroup(db, "services"));
                const userSpecialtiesSnapshot = await getDocs(collection(db, "userSpecialties"));

                // Преобразуем данные в массив
                const specialtiesData = specialtiesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    path: doc.ref.path,
                    ...doc.data()
                }));

                const servicesData = servicesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    path: doc.ref.path,
                    ...doc.data()
                }));

                const userSpecialtiesData = userSpecialtiesSnapshot.docs.map(doc => doc.data().specialty);

                const filteredSpecialties = specialtiesData.filter(specialty =>
                    userSpecialtiesData.includes(specialty.id)
                );

                setSpecialties(filteredSpecialties);
                setServices(servicesData.filter(service => service.label && service.accepted));
            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (project) {
            setNotKnowSpecialistCategory(project.notKnowSpecialistCategory || false);

            if (project.notKnowSpecialistCategory) {
                setSpecialty(null);
                setService(null);
                setCustomService("Other services");
            } else {
                // Находим специальность по project.specialtyId в массиве specialties
                const foundSpecialty = project.specialtyId
                    ? specialties.find(s => s.id === project.specialtyId)
                    : null;

                // Находим услугу по project.serviceId в массиве services
                const foundService = project.serviceId
                    ? services.find(s => s.id === project.serviceId)
                    : null;

                setSpecialty(foundSpecialty || null);
                setService(foundService || null);
                setCustomService(project.customService || null);
            }
        }
    }, [project, specialties, services]);

    const handleSpecialtyChange = (_, newValue) => {
        setSpecialty(newValue);
        setService(null);
    };

    const handleServiceChange = (_, newValue) => {
        if (typeof newValue === 'string') {
            setService(null);
            setCustomService(newValue);
        } else if (newValue && newValue.id) {
            setService(newValue);
            setCustomService(null);
        } else {
            setService(null);
            setCustomService(null);
        }
    };

    const handleNotKnowSpecialistChange = (event) => {
        const isChecked = event.target.checked;
        setNotKnowSpecialistCategory(isChecked);
        setSpecialty(null);
        setService(null);
        setCustomService(isChecked ? "Other services" : null);
    };

    const handleOnNext = () => {
        project.specialtyId = specialty?.id || "other";
        project.serviceId = service?.id || null;
        project.customService = customService || null;
        project.title = service?.label || customService || project.title || "";
        project.notKnowSpecialistCategory = notKnowSpecialistCategory;
        onNext(project);
    };

    return (
        <Stack spacing={3} {...other}>
            <div>
                <Typography variant="h6">
                    What kind of specialty do you need a specialist in?
                </Typography>
            </div>

            <Alert severity="info">
                If you are not sure which specialist you need, or if it is not in the list of categories,{' '}
                <Link
                    component="button"
                    variant="body2"
                    onClick={() => setNotKnowSpecialistCategory(!notKnowSpecialistCategory)}
                    sx={{
                        color: 'inherit',
                        textDecoration: 'underline',
                        fontWeight: 'bold',
                        '&:hover': {
                            cursor: 'pointer'
                        }
                    }}
                >
                    just check this box
                </Link>
                <Checkbox
                    checked={notKnowSpecialistCategory}
                    onChange={handleNotKnowSpecialistChange}
                    color="primary"
                    sx={{
                        padding: '0 5px',
                        verticalAlign: 'middle'
                    }}
                />
            </Alert>

            <Collapse in={!notKnowSpecialistCategory}>
                <Box>
                    {loading ? (
                        <CircularProgress/>
                    ) : (
                        <Autocomplete
                            options={specialties}
                            getOptionLabel={(option) => option.label}
                            value={specialty}
                            onChange={handleSpecialtyChange}
                            renderInput={(params) => <TextField {...params} label="Kind of specialty"
                                                                placeholder="Electrician"/>}
                            disabled={notKnowSpecialistCategory}
                        />
                    )}
                </Box>

                <Typography variant="h6" sx={{my: 2}}>
                    What kind of service do you need?
                </Typography>

                {loading ? (
                    <CircularProgress/>
                ) : (
                    <Autocomplete
                        options={services.filter(service => service.parent === specialty?.id)}
                        getOptionLabel={(option) => option.label || option}
                        value={notKnowSpecialistCategory ? null : (service || customService)}
                        onChange={handleServiceChange}
                        onInputChange={(_, newInputValue) => {
                            if (newInputValue && !services.some(s => s.label === newInputValue)) {
                                setService(null);
                                setCustomService(newInputValue);
                            }
                        }}
                        freeSolo
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Kind of service"
                                placeholder="e.g Electrical wiring installation"
                            />
                        )}
                        disabled={!specialty || notKnowSpecialistCategory}
                    />
                )}
            </Collapse>

            <Stack alignItems="center" direction="row" spacing={2}>
                <Button
                    endIcon={(
                        <SvgIcon>
                            <ArrowRightIcon/>
                        </SvgIcon>
                    )}
                    onClick={handleOnNext}
                    variant="contained"
                    disabled={(!specialty && !notKnowSpecialistCategory) || (!service?.id && !customService && !notKnowSpecialistCategory) || loading}
                >
                    Continue
                </Button>
            </Stack>
        </Stack>
    );
};

ProjectServiceStep.propTypes = {
    onNext: PropTypes.func,
    onBack: PropTypes.func,
    project: PropTypes.object.isRequired,
};