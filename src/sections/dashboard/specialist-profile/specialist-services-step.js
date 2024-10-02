import PropTypes from 'prop-types';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import {Avatar, Box, Button, IconButton, Stack, SvgIcon, TextField, Tooltip, Typography} from '@mui/material';
import {useCallback, useEffect, useRef, useState} from "react";
import User01Icon from "@untitled-ui/icons-react/build/esm/User01";
import {getDownloadURL, ref, uploadBytes} from "firebase/storage";
import {storage} from "../../../libs/firebase";
import toast from "react-hot-toast";
import Slider from "@mui/material/Slider";
import * as React from "react";
import SpecialityCard from "../account/general/specialties-card";
import {SpecialtySelectForm} from "../../../components/specialty-select-form";
import CardContent from "@mui/material/CardContent";
import Card from "@mui/material/Card";
import ArchiveIcon from "@untitled-ui/icons-react/build/esm/Archive";
import {profileApi} from "../../../api/profile";
import {useDispatch, useSelector} from "../../../store";
import {thunks} from "../../../thunks/dictionary";
import {dictionaryApi} from "../../../api/dictionary";


export const SpecialistServicesStep = (props) => {
    const {profile, onNext, onBack, userSpecialties, ...other} = props;
    const [specialties, setSpecialties] = useState(userSpecialties);
    const [open, setOpen] = useState(false);
    console.log(specialties);
    const handleOnNext = async () => {
        if (userSpecialties === specialties)
            onNext();
        else {
            try {
                userSpecialties.forEach((ds) => {
                    profileApi.removeSpecialty(profile.id, ds);
                });
                const addableSpec = specialties.filter(value => !value.id.startsWith("new_"))
                const newSpecList = specialties.filter(value => value.id.startsWith("new_"));

                if (newSpecList) {
                    const newCatsList = new Set(newSpecList.map(value => value.parent).filter(value => value.id.startsWith("new_")));
                    const oldIdMap = new Map();
                    for (const value of newCatsList) {
                        let response = await dictionaryApi.addCategory({label: value.label});
                        oldIdMap.set(value.id, response.id);
                    }
                    console.log(oldIdMap);
                    for (const newSpec of newSpecList) {
                        let response = await dictionaryApi.addSpecialty({
                            label: newSpec.label,
                            parent: newSpec.parent.id.startsWith("new_") ? oldIdMap.get(newSpec.parent.id) : newSpec.parent.id
                        });
                        addableSpec.push(response);
                    }
                }

                profileApi.addSpecialties(profile.id, addableSpec);

                onNext({
                    profileDataProgress: 3
                });
            } catch (err) {
                console.log(err);
            }
        }
    }

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClickClose = () => {
        setOpen(false);
    };

    const handleSpecialtiesChange = (addedSpecialties) => {
        console.log(addedSpecialties);
        setSpecialties(addedSpecialties);
    };

    const handleRemoveSpecialty = useCallback((spec) => {
        setSpecialties((prevState) => {
            return prevState.filter((specialty) => specialty.id !== spec.id);
        });
    }, [setSpecialties]);


    return (
        <Stack
            spacing={3}
            {...other}>
            <div>
                <Typography variant="h6">
                    Specialties are categories of services that you provide.
                </Typography>
                <Typography variant="body2">
                    Now just add the specialties, and later you will be able to configure each one in the performer's
                    profile
                </Typography>
            </div>
            <Stack direction="column" spacing={2}>
                {specialties.map((spec) => (
                    <Card
                        sx={{
                            ':hover': {
                                boxShadow: (theme) => `${theme.palette.primary.main} 0 0 5px`,
                                cursor: 'pointer'
                            },
                        }}>
                        <CardContent>
                            <Stack direction="row"
                                   justifyContent="space-between"
                                   alignItems="center">
                                <Box>
                                    <Typography sx={{fontSize: 14}} color="text.secondary" gutterBottom>
                                        {spec.label}
                                    </Typography>
                                    <Typography variant="h5" component="div">
                                        {spec.label}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Tooltip title="Delete">
                                        <IconButton color={"error"} onClick={() => {
                                            handleRemoveSpecialty(spec)
                                        }}>
                                            <SvgIcon>
                                                <ArchiveIcon/>
                                            </SvgIcon>
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Stack>
                        </CardContent>

                    </Card>
                ))}
                <Button
                    variant="outlined"
                    onClick={handleClickOpen}
                >
                    Add specialities
                </Button>
                <SpecialtySelectForm open={open} selectedSpecialties={specialties} disabledSelected={false}
                                     onSpecialtyChange={handleSpecialtiesChange} onClose={handleClickClose}/>
            </Stack>
            <Stack
                alignItems="center"
                direction="row"
                spacing={2}
                sx={{pt: 2}}
            >
                <Button
                    endIcon={(
                        <SvgIcon>
                            <ArrowRightIcon/>
                        </SvgIcon>
                    )}
                    onClick={handleOnNext}
                    variant="contained"
                    disabled={!specialties}
                >
                    Continue
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
