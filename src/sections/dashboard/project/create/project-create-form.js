import {
    Avatar,
    Backdrop,
    CircularProgress, Stack,
    Step,
    StepContent,
    StepLabel,
    Stepper,
    SvgIcon,
    Typography
} from '@mui/material';
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
import * as React from "react";
import useDictionary from "src/hooks/use-dictionaries";
import {ProjectStartTypes} from "src/enums/project-start-type";
import {formatDateRange, getValidDate} from "src/utils/date-locale";

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
        const {categories, specialties, services, loading, addService} = useDictionary();


        useEffect(() => {
            if (!project)
                return;

            if (!project.specialtyId || (!project.serviceId && !project.customService)) {
                setActiveStep(0);
            } else if (!project.title || !project.projectStartType) {
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

        const handleNext = useCallback(async (updatedProject, complete = false, moderate = false) => {
            if (!complete) {
                projectsLocalApi.storeProject({...project, ...updatedProject});
                setActiveStep((prevState) => prevState + 1)
            } else if (!moderate) {
                setIsComplete(true);
                router.replace(paths.request.complete);
                await projectFlow.create(project, user);
                toast.custom("Project published complete");
                router.replace(paths.cabinet.projects.index);
                projectsLocalApi.deleteProject();
            } else {
                setIsComplete(true);
                router.replace(paths.request.complete);
                await projectFlow.moderate(project);
                toast.success("Project sent for moderation", {duration: 2000});
                router.replace(paths.index);
                projectsLocalApi.deleteProject();
            }
        }, [project, user]);

        const handleBack = useCallback(() => {
            setActiveStep((prevState) => prevState - 1);
        }, []);


        const steps = useMemo(() => {
                    return [
                        {
                            label: 'Specialty',
                            content: (
                                <ProjectServiceStep
                                    // onBack={handleBack}
                                    onNext={handleNext}
                                    project={project}
                                />
                            ),
                            description: (project) => {
                                if (!project.specialtyId && (!project.serviceId || !project.customService)) {
                                    return [];
                                }
                                return [specialties.byId[project.specialtyId]?.label,
                                    project.serviceId ? services.byId[project.serviceId]?.label : project.customService]
                            }
                        },
                        {
                            label: 'Project Details',
                            content: (
                                <ProjectDetailsStep
                                    onBack={handleBack}
                                    onNext={handleNext}
                                    project={project}
                                />
                            ),
                            description: (project) => {
                                const result = [];

                                // Добавляем title, если он есть
                                if (project?.title) {
                                    result.push(project.title);
                                }

                                // Обрабатываем projectStartType
                                if (project?.projectStartType) {
                                    if (project.projectStartType === 'period') {
                                        const startDate = getValidDate(project.start);
                                        const endDate = getValidDate(project.end);
                                        if (startDate || endDate) {
                                            result.push(`Period: ${formatDateRange(startDate, endDate)}`);
                                        }
                                    } else {
                                        const startTypeLabel = ProjectStartTypes.find(item => item.value === project.projectStartType)?.label;
                                        if (startTypeLabel) {
                                            result.push(startTypeLabel);
                                        }
                                    }
                                }

                                return result;
                            }
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
                            ),
                            description: (project) => {
                                if (!project.location) {
                                    return [];
                                }
                                return [project.location.place_name]
                            }

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
                    ]
                        ;
                }, [handleBack, handleNext, project, specialties, services, user]
            )
        ;


        return (
            <>
                <Backdrop
                    sx={{color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1}}
                    open={isComplete}
                >
                    <CircularProgress color="inherit"/>
                </Backdrop>
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
                                    <Stack direction="column" spacing={0} sx={{ml: 2}}>
                                        <Typography
                                            variant="overline"
                                        >
                                            {step.label}
                                        </Typography>
                                        {step.description && (
                                            <Stack direction="row" spacing={1} divider={<span>·</span>}>
                                                {step.description(project).map(item =>
                                                    <Typography
                                                        variant="caption"
                                                    >
                                                        {item}
                                                    </Typography>)}
                                            </Stack>)}
                                    </Stack>
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
    }
;
