import {useCallback, useMemo, useState} from 'react';
import CheckIcon from '@untitled-ui/icons-react/build/esm/Check';
import {Avatar, Step, StepContent, StepLabel, Stepper, SvgIcon, Typography} from '@mui/material';
import {JobCategoryStep} from './job-category-step';
import {JobDescriptionStep} from './job-description-step';
import {JobDetailsStep} from './job-details-step';
import {JobPreview} from './job-preview';
import {JobSpecialtyStep} from "./job-specialty-step";
import {JobLocationStep} from "./job-location-step";
import {JobContactsStep} from "./job-contacts-step";
import {useAuth} from "../../../hooks/use-auth";

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

export const JobCreateForm = (props) => {
    const dictionary = props && props.dict.lastId && props.dict;
    const [activeStep, setActiveStep] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const {user} = useAuth();
    const [job, setJob] = useState({userId: user.id, phone: user.phone});


    const handleNext = useCallback((updatedJob) => {
        setJob(updatedJob);
        setActiveStep((prevState) => prevState + 1);
    }, [setJob]);

    const handleBack = useCallback(() => {
        setActiveStep((prevState) => prevState - 1);
    }, []);

    const handleComplete = useCallback(() => {
        setIsComplete(true);
    }, []);

    const steps = useMemo(() => {
        return [
            {
                label: 'Category',
                description: (job) => {
                    if (!job.category)
                        return '';

                    if (job.category === "new")
                        return job.otherCategory;

                    const byIdElement = dictionary && dictionary.categories.byId[job.category];
                    if (byIdElement)
                        return byIdElement.label;
                    return '';
                },
                content: (
                    <JobCategoryStep
                        onBack={handleBack}
                        onNext={handleNext}
                        job={job}
                    />
                )
            },
            {
                label: 'Specialty',
                description: (job) => {
                    if (!job.specialty)
                        return '';
                    if (job.category === "new")
                        return job.otherSpecialty;
                    const byIdElement = dictionary && dictionary.specialties.byId[job.specialty];
                    if (byIdElement)
                        return byIdElement.label;
                    return '';
                },
                content: (
                    <JobSpecialtyStep
                        onBack={handleBack}
                        onNext={handleNext}
                        job={job}
                    />
                )
            },
            {
                label: 'Project Details',
                content: (
                    <JobDetailsStep
                        onBack={handleBack}
                        onNext={handleNext}
                        job={job}
                    />
                )
            },
            {
                label: 'Description',
                content: (
                    <JobDescriptionStep
                        onBack={handleBack}
                        onNext={handleNext}
                        job={job}
                    />
                )
            },
            {
                label: 'Location',
                content: (
                    <JobLocationStep
                        onBack={handleBack}
                        onNext={handleNext}
                        job={job}
                    />
                )
            },
            {
                label: 'Contacts',
                content: (
                    <JobContactsStep
                        onBack={handleBack}
                        onNext={handleComplete}
                        job={job}
                    />
                )
            }
        ];
    }, [handleBack, handleNext, handleComplete, job]);

    if (isComplete) {
        return <JobPreview addedWork={job}/>;
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
                            {step.description && (<Typography
                                sx={{ml: 5}}
                                variant="caption"
                            >
                                {step.description(job)}
                            </Typography>)}
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
