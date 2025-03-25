import {useCallback, useMemo, useState} from 'react';
import CheckIcon from '@untitled-ui/icons-react/build/esm/Check';
import {Avatar, Step, StepContent, StepLabel, Stepper, SvgIcon, Typography} from '@mui/material';
import {useAuth} from "src/hooks/use-auth";
import {SpecialistBusinessStep} from "./specialist-business-step";
import {profileApi} from "src/api/profile";
import toast from "react-hot-toast";
import {SpecialistServicesStep} from "./specialist-services-step";
import {SpecialistDescriptionStep} from "./specialist-description-step";
import {roles} from "src/roles";
import {ERROR} from "src/libs/log";
import {SpecialistLocationStep} from "src/sections/dashboard/specialist-profile/specialist-location-step";
import {SpecialistEducationStep} from "src/sections/dashboard/specialist-profile/specialist-education-step";
import {SpecialistReviewsStep} from "src/sections/dashboard/specialist-profile/specialist-review-step";

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

export const SpecialistCreateForm = (props) => {
    const {onComplete} = props;
    const {user} = useAuth();
    const [profile, setProfile] = useState(user);
    const [activeStep, setActiveStep] = useState(0);
    const [isComplete, setIsComplete] = useState(false);


    const handleProfileChange = useCallback(async (values) => {
        await profileApi.update(profile.id, {...values, role: roles.WORKER, serviceProvided: true});
        setProfile(await profileApi.get(profile.id));
    }, [profile]);

    const handleNext = useCallback((changedProfile) => {
        try {
            if (changedProfile) {
                handleProfileChange(changedProfile);
            }
            setActiveStep((prevState) => prevState + 1);
        } catch (error) {
            ERROR(error);
            toast.error('Error while changing profile!');
        }
    }, [handleProfileChange])

    const handleBack = useCallback(() => {
        setActiveStep((prevState) => prevState - 1);
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
                label: 'Location',
                content: (
                    <SpecialistLocationStep
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
                    />
                )
            },
            {
                label: 'Education',
                content: (
                    <SpecialistEducationStep
                        onNext={(s) => {
                            handleNext(s);
                        }}
                        onBack={handleBack}
                        profile={profile}
                    />
                )
            },
            {
                label: 'Description',
                content: (
                    <SpecialistDescriptionStep
                        onNext={(s) => {
                            handleNext(s);
                        }}
                        onBack={handleBack}
                        profile={profile}
                    />
                )
            },
            {
                label: 'Reviews',
                content: (
                    <SpecialistReviewsStep
                        onNext={(s) => {
                            handleNext(s);
                            onComplete();
                        }}
                        onBack={handleBack}
                        profile={profile}
                    />
                )
            }
        ];
    }, [handleBack, handleNext, onComplete, profile]);

    return (
        <>
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
        </>
    );
};