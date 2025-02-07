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
import {ProjectDescriptionStep} from "./create/project-description-step";
import {ProjectDetailsStep} from "./create/project-details-step";
import {ProjectLocationStep} from "./create/project-location-step";
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
    const {project} = props;
    const [activeStep, setActiveStep] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const {user} = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!project)
            return;

        if (!project.specialty || !project.service) {
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
            setActiveStep(4);
        }

    }, [project]);

    const handleNext = useCallback(async (updatedProject, complete = false) => {
        debugger
        if (project.userId) {
            if (project.id) {
                projectsApi.updateProject(project.id, updatedProject)
                    .then(r => {
                        if (!complete) {
                            setActiveStep((prevState) => prevState + 1)
                        } else {
                            // emailSender.sendAdmin_newOrder(project, user).then(r => {
                            // });
                            const data = {
                                createdAt: serverTimestamp(),
                                authorId: project.userId,

                                customerId: user.id,
                                customerEmail: user.email,
                                customerName: user.businessName || user.name,
                                customerAvatar: user.avatar || '',

                                title: project.title,
                                startDate: project.start,
                                endDate: project.end,
                                description: project.description,

                                specialties: [],
                                finalDescription: '',
                                photos: [],
                                existingPhotos: [],

                                // address: project.location || '',
                                comments: [],

                                postType: "project",
                                projectStatus: ProjectStatus.PUBLISHED
                            };
                            addDoc(collection(firestore, "specialistPosts"), data).then(r => {
                                const postId = r.id;
                                setIsComplete(true);
                                wait(1000).then(r => router.replace(paths.dashboard.specialistProfile.index));
                            });
                        }
                    });
            } else {
                await projectsApi.createProject({
                    ...project,
                    state: complete ? ProjectStatus.PUBLISHED : ProjectStatus.DRAFT
                });
            }
        } else {
            projectsLocalApi.storeProject({...project, ...updatedProject});
            if (!complete) {
                setActiveStep((prevState) => prevState + 1)
            }
        }
        if (complete) {
            projectsLocalApi.deleteProject();
            window.location.href = paths.dashboard.index;
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
                )
            }
        ];
    }, [handleBack, handleNext, project]);

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
