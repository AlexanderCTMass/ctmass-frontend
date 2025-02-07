import { Autocomplete, Button, CircularProgress, Stack, SvgIcon, TextField, Typography } from '@mui/material';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import PropTypes from 'prop-types';
import * as React from "react";
import { useState, useEffect } from "react";
import { getFirestore, collectionGroup, getDocs } from "firebase/firestore";
import { useSearchParams } from "react-router-dom";

export const ProjectServiceStep = ({ onBack, onNext, project, ...other }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [specialties, setSpecialties] = useState([]);
    const [services, setServices] = useState([]);
    const [specialty, setSpecialty] = useState(null);
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const db = getFirestore();

        const fetchData = async () => {
            try {
                const specialtiesSnapshot = await getDocs(collectionGroup(db, "specialties"));
                const servicesSnapshot = await getDocs(collectionGroup(db, "services"));

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

                setSpecialties(specialtiesData);
                setServices(servicesData);
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
            setSpecialty(project.specialty || null);
            setService(project.service || null);
        }
    }, [project]);

    useEffect(() => {
        if (service?.path) {
            setSearchParams(prev => {
                const newParams = new URLSearchParams(prev);
                newParams.set("servicePath", service.path);
                return newParams;
            });
        }
    }, [service, setSearchParams]);

    const handleSpecialtyChange = (_, newValue) => {
        setSpecialty(newValue);
        setService(null);
    };

    const handleServiceChange = (_, newValue) => {
        setService(newValue);
    };

    const handleOnNext = () => {
        onNext({
            ...project,
            specialty,
            service
        });
    };

    return (
        <Stack spacing={3} {...other}>
            <div>
                <Typography variant="h6">
                    What kind of specialty do you need a specialist in?
                </Typography>
            </div>

            {loading ? (
                <CircularProgress />
            ) : (
                <Autocomplete
                    options={specialties}
                    getOptionLabel={(option) => option.label}
                    value={specialty}
                    onChange={handleSpecialtyChange}
                    renderInput={(params) => <TextField {...params} label="Kind of specialty" placeholder="Electrician" />}
                />
            )}

            <div>
                <Typography variant="h6">
                    What kind of service do you need?
                </Typography>
            </div>

            {loading ? (
                <CircularProgress />
            ) : (
                <Autocomplete
                    options={services.filter(service => service.parent === specialty?.id)}
                    getOptionLabel={(option) => option.label}
                    value={service}
                    onChange={handleServiceChange}
                    onInputChange={(_, newInputValue) => {
                        if (newInputValue && !services.some(s => s.label === newInputValue)) {
                            setService({ label: newInputValue });
                        }
                    }}
                    freeSolo
                    renderInput={(params) => <TextField {...params} label="Kind of service" placeholder="e.g Electrical wiring installation" />}
                    disabled={!specialty}
                />
            )}

            <Stack alignItems="center" direction="row" spacing={2}>
                <Button
                    endIcon={(
                        <SvgIcon>
                            <ArrowRightIcon />
                        </SvgIcon>
                    )}
                    onClick={handleOnNext}
                    variant="contained"
                    disabled={!specialty || !service || loading}
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
