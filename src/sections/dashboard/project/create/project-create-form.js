import {Avatar, Step, StepContent, StepLabel, Stepper, SvgIcon, Typography} from '@mui/material';
import CheckIcon from '@untitled-ui/icons-react/build/esm/Check';
import {addDoc, collection, serverTimestamp} from "firebase/firestore";
import {useCallback, useEffect, useMemo, useState} from 'react';
import toast from "react-hot-toast";
import {projectsApi} from "src/api/projects";
import {projectsLocalApi} from "src/api/projects/project-local-storage";
import {ProjectStatus} from "src/enums/project-state";
import {useAuth} from "src/hooks/use-auth";
import {useRouter} from "src/hooks/use-router";
import {emailSender} from "src/libs/email-sender";
import {firestore} from "src/libs/firebase";
import {paths} from "src/paths";
import {ProjectCustomerStep} from "src/sections/dashboard/project/create/project-customer-step";
import {ProjectServiceStep} from "src/sections/dashboard/project/create/project-service-step";
import {wait} from "src/utils/wait";
import {ProjectDescriptionStep} from "./project-description-step";
import {ProjectDetailsStep} from "./project-details-step";
import {ProjectLocationStep} from "./project-location-step";
import {ProjectPreview} from "./project-preview";
import {projectFlow} from "src/flows/project/project-flow";

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

export const
    ProjectCreateForm = (props) => {
        const {project} = props;
        const [activeStep, setActiveStep] = useState(0);
        const [isComplete, setIsComplete] = useState(false);
        const {user} = useAuth();
        const router = useRouter();

        useEffect(() => {
            if (!project)
                return;

            if (!project.specialtyId || (!project.serviceId && !project.customService)) {
                setActiveStep(0);
            } else if (!project.title || !project.projectMaximumBudget || !project.projectStartType) {
                setActiveStep(1);
            } else if (project.projectStartType === 'period' && !project.start) {
                setActiveStep(1);
            } else if (!project.description) {
                setActiveStep(2);
            } else if (!project.location) {
                setActiveStep(3);
            } else {
                setActiveStep(user ? 3 : 4);
            }

        }, [project]);

        const handleNext = useCallback(async (updatedProject, complete = false) => {
            if (!complete) {
                projectsLocalApi.storeProject({...project, ...updatedProject});
                setActiveStep((prevState) => prevState + 1)
            } else {
                await projectFlow.create(project, user);
                toast.custom("Project published complete");
                setIsComplete(true);
                wait(1000).then(r => router.replace(paths.cabinet.projects.index));
            }
        }, [project, user]);

        const handleBack = useCallback(() => {
            setActiveStep((prevState) => prevState - 1);
        }, []);


        const steps = useMemo(() => {
            return [
                {
                    label: 'Service',
                    content: (
                        <ProjectServiceStep
                            // onBack={handleBack}
                            onNext={handleNext}
                            project={project}
                        />
                    )
                },
                {
                    label: 'Project Details',
                    content: (
                        <ProjectDetailsStep
                            onBack={handleBack}
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
                    label: 'Address',
                    content: (
                        <ProjectLocationStep
                            onBack={handleBack}
                            onNext={handleNext}
                            user={user}
                            project={project}
                        />
                    )
                },
                {
                    label: 'Contacts',
                    content: (
                        <ProjectCustomerStep
                            onBack={handleBack}
                            onNext={handleNext}
                            project={project}
                        />
                    ),
                    notAuth: user != null
                }
            ];
        }, [handleBack, handleNext, project]);

        if (isComplete) {
            return <ProjectPreview project={project}/>;
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
                {steps.filter(step => !step.notAuth).map((step, index) => {
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
