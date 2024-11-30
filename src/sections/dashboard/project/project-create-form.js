import {useCallback, useEffect, useMemo, useState} from 'react';
import CheckIcon from '@untitled-ui/icons-react/build/esm/Check';
import {Avatar, Step, StepContent, StepLabel, Stepper, SvgIcon, Typography} from '@mui/material';
import {useAuth} from "../../../hooks/use-auth";
import {paths} from "../../../paths";
import {useRouter} from "../../../hooks/use-router";
import {emailSender} from "../../../libs/email-sender";
import {ProjectLocationStep} from "./create/project-location-step";
import {ProjectDescriptionStep} from "./create/project-description-step";
import {ProjectDetailsStep} from "./create/project-details-step";
import {ProjectCustomerStep} from "./create/project-customer-step";
import {ProjectPreview} from "./create/project-preview";

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

export const ProjectCreateForm = (props) => {
    const dictionary = props && props.dict.lastId && props.dict;
    const [activeStep, setActiveStep] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const {user} = useAuth();
    const [project, setProject] = useState({customer: user.id});
    const router = useRouter();


    const handleNext = useCallback((updatedProject) => {
        setProject(updatedProject);
        setActiveStep((prevState) => prevState + 1);
    }, [setProject]);

    const handleBack = useCallback(() => {
        setActiveStep((prevState) => prevState - 1);
    }, []);

    const handleComplete = useCallback(() => {
        emailSender.sendAdmin_newOrder(project, user).then(r => {
        });
        setIsComplete(true);
    }, []);

    const steps = useMemo(() => {
        return [
            {
                label: 'Project Details',
                content: (
                    <ProjectDetailsStep
                        // onBack={handleBack}
                        onNext={handleNext}
                        project={project}
                    />
                )
            },
            {
                label: 'Description',
                content: (
                    <ProjectDescriptionStep
                        onBack={handleBack}
                        onNext={handleNext}
                        project={project}
                    />
                )
            },
            {
                label: 'Location',
                content: (
                    <ProjectLocationStep
                        onBack={handleBack}
                        onNext={handleComplete}
                        project={project}
                    />
                )
            }/*,
            {
                label: 'Contacts',
                content: (
                    <ProjectCustomerStep
                        onBack={handleBack}
                        onNext={handleComplete}
                        project={project}
                    />
                )
            }*/
        ];
    }, [handleBack, handleNext, handleComplete, project]);

    if (isComplete) {
        return <ProjectPreview project={project}/>;
        // window.location.href = paths.dashboard.orders;
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
                                {step.description(project)}
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
