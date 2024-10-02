import {useCallback, useEffect, useMemo, useState} from 'react';
import CheckIcon from '@untitled-ui/icons-react/build/esm/Check';
import {Avatar, Stack, Step, StepContent, StepLabel, Stepper, SvgIcon, Typography} from '@mui/material';
import {useAuth} from "../../../hooks/use-auth";
import {SpecialistBusinessStep} from "./specialist-business-step";
import {profileApi} from "../../../api/profile";
import toast from "react-hot-toast";
import {SpecialistAddressStep} from "./specialist-address-step";
import {SpecialistServicesStep} from "./specialist-services-step";
import {SpecialistPreview} from "./specialist-preview";
import {SpecialistDescriptionStep} from "./specialist-description-step";
import {useDispatch, useSelector} from "../../../store";
import {thunks} from "../../../thunks/dictionary";

const StepIcon = (props) => {
    const {active, completed, icon} = props;

    const highlight = active || completed;

    return (
        <Avatar
            sx={{
                height: 40,
                width: 40,
                ...(highlight && {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText'
                })
            }}
            variant="rounded"
        >
            {completed
                ? (
                    <SvgIcon>
                        <CheckIcon/>
                    </SvgIcon>
                )
                : icon}
        </Avatar>
    );
};


const useUserSpecialties = (userId) => {
    const dispatch = useDispatch();
    const {categories, specialties} = useSelector((state) => state.dictionary);
    const [userSpecialties, setUserSpecialties] = useState([]);

    useEffect(() => {
        async function fetchData() {
            const newVar = await profileApi.getUserSpecialtiesById(userId);
            setUserSpecialties(newVar);
        }

        fetchData();
    }, [userId]);

    useEffect(() => {
            dispatch(thunks.getDictionary());
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [userSpecialties]);

    console.log(userSpecialties);
    return userSpecialties.map((uS) => {
        return specialties.byId[uS.specialty];
    })
};

export const SpecialistCreateForm = (props) => {
    const {user} = useAuth();
    const [profile, setProfile] = useState(user);
    const [activeStep, setActiveStep] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    const userSpecialties = useUserSpecialties(profile.id);

    const handleProfileChange = useCallback(async (values) => {
        await profileApi.update(profile.id, values);
        setProfile(await profileApi.get(profile.id));
    }, [profile]);

    const handleNext = useCallback((changedProfile) => {
        try {
            if (changedProfile) {
                handleProfileChange(changedProfile);
            }
            setActiveStep((prevState) => prevState + 1);
        } catch (error) {
            console.error(err);
            toast.error('Something went wrong!');
        }
    }, [handleProfileChange])


    const handleBack = useCallback(() => {
        setActiveStep((prevState) => prevState - 1);
    }, []);

    const handleComplete = useCallback(() => {
        setIsComplete(true);
    }, []);


    const steps = useMemo(() => {
                return [
                    {
                        label: 'Business info',
                        content: (
                            <SpecialistBusinessStep
                                onNext={handleNext}
                                profile={profile}
                            />
                        )
                    },
                    {
                        label: 'Address',
                        content: (
                            <SpecialistAddressStep
                                onNext={handleNext}
                                onBack={handleBack}
                                profile={profile}
                            />
                        )
                    },
                    {
                        label: 'Specialties',
                        content: (
                            <SpecialistServicesStep
                                onNext={(s) => {
                                    handleNext(s);
                                }}
                                onBack={handleBack}
                                profile={profile}
                                userSpecialties={userSpecialties}
                            />
                        )
                    },
                    {
                        label: 'Description',
                        content: (
                            <SpecialistDescriptionStep
                                onNext={(s) => {
                                    handleNext(s);
                                    handleComplete();
                                }}
                                onBack={handleBack}
                                profile={profile}
                            />
                        )
                    }
                ];
            },
            [handleBack, handleNext, handleComplete, profile]
        )
    ;

    if (isComplete) {
        return <SpecialistPreview profile={profile} />;
    }

    return (
        <Stepper
            activeStep={activeStep}
            orientation="vertical"
            sx={{
                '& .MuiStepConnector-line': {
                    borderLeftColor: 'divider',
                    borderLeftWidth: 2,
                    ml: 1
                }
            }}
        >
            {steps.map((step, index) => {
                const isCurrentStep = activeStep === index;

                return (
                    <Step key={step.label}>
                        <StepLabel StepIconComponent={StepIcon}>
                            <Typography
                                sx={{ml: 2}}
                                variant="overline"
                            >
                                {step.label}
                            </Typography>
                        </StepLabel>
                        <StepContent
                            sx={{
                                borderLeftColor: 'divider',
                                borderLeftWidth: 2,
                                ml: '20px',
                                ...(isCurrentStep && {
                                    py: 4
                                })
                            }}
                        >
                            {step.content}
                        </StepContent>
                    </Step>
                );
            })}
        </Stepper>
    );
};
