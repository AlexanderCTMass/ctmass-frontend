import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
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
import {RegistrationFeedbackStep} from "src/sections/dashboard/specialist-profile/specialist-registration-feedback";

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
    const stepContentRef = useRef(null);

    // Функция для прокрутки вверх
    const scrollToTop = useCallback(() => {
        if (stepContentRef.current) {
            stepContentRef.current.scrollIntoView({behavior: 'smooth', block: 'start'});
        }
        window.scrollTo({top: 0, behavior: 'smooth'});
    }, []);

    // Прокрутка при изменении активного шага
    useEffect(() => {
        scrollToTop();
    }, [activeStep, scrollToTop]);

    const handleProfileChange = useCallback(async (values) => {
        if (profile.profileDataProgress > values.profileDataProgress) {
            values.profileDataProgress = profile.profileDataProgress;
        }

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
                    <div ref={stepContentRef}>
                        <SpecialistBusinessStep
                            onNext={handleNext}
                            profile={profile}
                        />
                    </div>
                )
            },
            {
                label: 'Location',
                content: (
                    <div ref={stepContentRef}>
                        <SpecialistLocationStep
                            onNext={handleNext}
                            onBack={handleBack}
                            profile={profile}
                        />
                    </div>
                )
            },
            {
                label: 'Specialties',
                content: (
                    <div ref={stepContentRef}>
                        <SpecialistServicesStep
                            onNext={(s) => {
                                handleNext(s);
                            }}
                            onBack={handleBack}
                            profile={profile}
                        />
                    </div>
                )
            },
            {
                label: 'Education',
                content: (
                    <div ref={stepContentRef}>
                        <SpecialistEducationStep
                            onNext={(s) => {
                                handleNext(s);
                            }}
                            onBack={handleBack}
                            profile={profile}
                        />
                    </div>
                )
            },
            {
                label: 'Description',
                content: (
                    <div ref={stepContentRef}>
                        <SpecialistDescriptionStep
                            onNext={(s) => {
                                handleNext(s);
                            }}
                            onBack={handleBack}
                            profile={profile}
                        />
                    </div>
                )
            },
            {
                label: 'Reviews',
                content: (
                    <div ref={stepContentRef}>
                        <SpecialistReviewsStep
                            onNext={(s) => {
                                handleNext(s);
                                // onComplete();
                            }}
                            onBack={handleBack}
                            profile={profile}
                        />
                    </div>
                )
            },
            {
                label: 'Feedback',
                content: (
                    <div ref={stepContentRef}>
                        <RegistrationFeedbackStep
                            onNext={(s) => {
                                scrollToTop();
                                onComplete();
                            }}
                            profile={profile}
                        />
                    </div>
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