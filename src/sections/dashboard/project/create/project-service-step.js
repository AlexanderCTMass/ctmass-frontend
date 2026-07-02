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
import XIcon from '@untitled-ui/icons-react/build/esm/X';
import PropTypes from 'prop-types';
import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { SpecialistMiniPreview } from "src/sections/components/specialist/specialist-mini-preview";
import { profileApi } from "src/api/profile";
import { projectsLocalApi } from "src/api/projects/project-local-storage";
import useDictionary from "src/hooks/use-dictionaries";
import { useUserSpecialtyIds } from "src/queries/use-user-specialties";

export const ProjectServiceStep = ({ onBack, onNext, project, ...other }) => {
    const { loading: dictionaryReady, specialties: dictionarySpecialties, services: dictionaryServices } = useDictionary();
    const { data: userSpecialtyIds = [], isLoading: userSpecialtiesLoading } = useUserSpecialtyIds();

    const specialties = useMemo(
        () => Object.values(dictionarySpecialties.byId).filter((specialty) =>
            userSpecialtyIds.includes(specialty.id)
        ),
        [dictionarySpecialties, userSpecialtyIds]
    );

    const services = useMemo(
        () => Object.values(dictionaryServices.byId).filter((service) => service.label && service.accepted),
        [dictionaryServices]
    );

    const loading = !dictionaryReady || userSpecialtiesLoading;

    const [specialty, setSpecialty] = useState(null);
    const [service, setService] = useState(null);
    const [customService, setCustomService] = useState(project?.customService);
    const [notKnowSpecialistCategory, setNotKnowSpecialistCategory] = useState(project?.notKnowSpecialistCategory || false);
    const [proposerUser, setProposerUser] = useState();
    const [message, setMessage] = useState(project?.proposerMessage || "");

    useEffect(() => {
        const calAssink = async () => {
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

            if (project.proposerUserId) {
                const proposerUser = await profileApi.get(project.proposerUserId);
                if (proposerUser) {
                    setProposerUser(proposerUser);
                }
            }
        }
        if (project) {
            calAssink();
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

    const handleRemoveProposer = () => {
        setProposerUser(null);
        setMessage("");
        if (project) {
            delete project.proposerUserId;
            delete project.proposerMessage;
            delete project.proposerUser;
            projectsLocalApi.storeProject(project);
        }
    };

    const handleOnNext = () => {
        project.specialtyId = specialty?.id || "other";
        project.serviceId = service?.id || null;
        project.customService = customService || null;
        project.title = service?.label || customService || project.title || "";
        project.notKnowSpecialistCategory = notKnowSpecialistCategory;
        project.proposerMessage = message || "";
        onNext(project);
    };

    return (
        <Stack spacing={3} {...other}>
            {proposerUser && (
                <>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                        <Typography variant="h6">
                            The specialist to whom the project will be offered
                        </Typography>
                        <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            startIcon={<SvgIcon fontSize="small"><XIcon /></SvgIcon>}
                            onClick={handleRemoveProposer}
                            sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
                        >
                            Remove
                        </Button>
                    </Stack>
                    <SpecialistMiniPreview specialist={proposerUser} />
                    <div>
                        <Typography variant="h6">
                            Your message to the specialist
                        </Typography>
                    </div>
                    <TextField
                        multiline
                        fullWidth
                        minRows={3}
                        maxRows={7}
                        value={message}
                        onChange={(event) => { setMessage(event.target.value) }}
                        placeholder={"Message"}
                    />
                </>
            )}

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
                        <CircularProgress />
                    ) : (
                        <Autocomplete
                            options={specialties}
                            getOptionLabel={(option) => option.label}
                            value={specialty}
                            onChange={handleSpecialtyChange}
                            renderInput={(params) => <TextField {...params} label="Kind of specialty"
                                placeholder="Electrician" />}
                            disabled={notKnowSpecialistCategory}
                        />
                    )}
                </Box>

                <Typography variant="h6" sx={{ my: 2 }}>
                    What kind of service do you need?
                </Typography>

                {loading ? (
                    <CircularProgress />
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
                            <ArrowRightIcon />
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