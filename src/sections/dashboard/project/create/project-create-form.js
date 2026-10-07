import {
    Box,
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
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from "react-hot-toast";
import { projectsApi } from "src/api/projects";
import { projectsLocalApi } from "src/api/projects/project-local-storage";
import { cabinetApi } from "src/api/cabinet";
import { CUSTOMER_UPSELL_KEY } from "src/components/onboarding-upsell-modal";
import { ERROR } from "src/libs/log";
import { ProjectStatus } from "src/enums/project-state";
import { useAuth } from "src/hooks/use-auth";
import { useRouter } from "src/hooks/use-router";
import { emailSender } from "src/libs/email-sender";
import { firestore } from "src/libs/firebase";
import { paths } from "src/paths";
import { ProjectCustomerStep } from "src/sections/dashboard/project/create/project-customer-step";
import { ProjectServiceStep } from "src/sections/dashboard/project/create/project-service-step";
import { wait } from "src/utils/wait";
import { ProjectDescriptionStep } from "./project-description-step";
import { ProjectDetailsStep } from "./project-details-step";
import { ProjectLocationStep } from "./project-location-step";
import { ProjectPreview } from "./project-preview";
import { projectFlow } from "src/flows/project/project-flow";
import * as React from "react";
import useDictionary from "src/hooks/use-dictionaries";
import { ProjectStartTypes } from "src/enums/project-start-type";
import { formatDateRange, getValidDate } from "src/utils/date-locale";
import { alpha } from '@mui/material/styles';
import { BRAND, FONT, SHADOW } from 'src/theme/ctmass-tokens';
import { formScopeSx } from 'src/components/ctmass-ui';

const persistProfileAddressIfMissing = async (userId, location) => {
    if (!userId || !location) {
        return;
    }

    try {
        const profile = await cabinetApi.getProfileInformation(userId);
        const hasAddress = Boolean(profile?.primaryAddress || profile?.primaryAddressLocation);
        if (!hasAddress) {
            await cabinetApi.updatePrimaryAddress(userId, location);
        }
    } catch (error) {
        ERROR("Failed to persist profile address from project", error);
    }
};

const StepIcon = (props) => {
    const { active, completed, icon } = props;

    return (
        <Box
            sx={{
                width: 40,
                height: 40,
                borderRadius: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: FONT.display,
                fontWeight: 800,
                fontSize: 16,
                transition: 'background-color .3s ease, color .3s ease, box-shadow .3s ease',
                bgcolor: completed ? alpha(BRAND.green, 0.14) : active ? BRAND.navy : alpha(BRAND.navy, 0.07),
                color: completed ? BRAND.green : active ? '#FFFFFF' : alpha(BRAND.navy, 0.5),
                boxShadow: active ? SHADOW.md : 'none'
            }}
        >
            {completed
                ? (
                    <SvgIcon fontSize="small">
                        <CheckIcon />
                    </SvgIcon>
                )
                : icon}
        </Box>
    );
};

export const
    ProjectCreateForm = (props) => {
        const { project } = props;
        const [activeStep, setActiveStep] = useState(0);
        const [isComplete, setIsComplete] = useState(false);
        const { user } = useAuth();
        const router = useRouter();
        const { categories, specialties, services, loading, addService } = useDictionary();


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
                projectsLocalApi.storeProject({ ...project, ...updatedProject });
                setActiveStep((prevState) => prevState + 1)
            } else if (!moderate) {
                setIsComplete(true);
                router.replace(paths.request.complete);
                await projectFlow.create(project, user);
                await persistProfileAddressIfMissing(user?.id, project.location);
                toast.custom("Project published complete");
                window.localStorage.setItem(CUSTOMER_UPSELL_KEY, '1');
                router.replace(paths.cabinet.projects.index);
                projectsLocalApi.deleteProject();
            } else {
                setIsComplete(true);
                router.replace(paths.request.complete);
                await projectFlow.moderate(project);
                toast.success("Project sent for moderation", { duration: 2000 });
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
                    label: 'Project details',
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


        const visibleSteps = steps.filter(step => !step.notAuth);

        return (
            <>
                <Backdrop
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    open={isComplete}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>
                <Box sx={{ mb: { xs: 3, md: 4 } }}>
                    <Stack direction="row" alignItems="baseline" justifyContent="space-between" sx={{ mb: 1 }}>
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: BRAND.navy, fontVariantNumeric: 'tabular-nums' }}>
                            Step {Math.min(activeStep + 1, visibleSteps.length)} of {visibleSteps.length}
                        </Typography>
                        <Typography sx={{ fontSize: 13, fontWeight: 500, color: BRAND.muted }}>
                            Saved on this device as you go
                        </Typography>
                    </Stack>
                    <Box
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={visibleSteps.length}
                        aria-valuenow={Math.min(activeStep + 1, visibleSteps.length)}
                        sx={{ height: 6, borderRadius: 999, bgcolor: alpha(BRAND.navy, 0.08), overflow: 'hidden' }}
                    >
                        <Box
                            sx={{
                                height: '100%',
                                borderRadius: 999,
                                bgcolor: BRAND.green,
                                transformOrigin: 'left',
                                transform: `scaleX(${Math.min(activeStep + 1, visibleSteps.length) / visibleSteps.length})`,
                                transition: 'transform .5s cubic-bezier(.2,.8,.2,1)'
                            }}
                        />
                    </Box>
                </Box>
                <Stepper
                    activeStep={activeStep}
                    orientation="vertical"
                    sx={{
                        ...formScopeSx,
                        '& .MuiStepConnector-root': { ml: '19px' },
                        '& .MuiStepConnector-line': {
                            borderLeftColor: alpha(BRAND.navy, 0.12),
                            borderLeftWidth: 2,
                            minHeight: 18
                        },
                        '& .MuiStepLabel-root': { py: 0.5 },
                        '& .MuiStepLabel-iconContainer': { pr: 0 }
                    }}
                >
                    {visibleSteps.map((step, index) => {
                        const isCurrentStep = activeStep === index;
                        const summary = step.description ? step.description(project).filter(Boolean) : [];

                        return (
                            <Step key={step.label}>
                                <StepLabel StepIconComponent={StepIcon}>
                                    <Box sx={{ ml: 2, minWidth: 0 }}>
                                        <Typography
                                            sx={{
                                                fontFamily: FONT.display,
                                                fontWeight: 700,
                                                fontSize: { xs: 17, md: 18 },
                                                letterSpacing: '-0.01em',
                                                color: isCurrentStep || index < activeStep ? BRAND.navy : alpha(BRAND.navy, 0.5)
                                            }}
                                        >
                                            {step.label}
                                        </Typography>
                                        {!isCurrentStep && summary.length > 0 && (
                                            <Typography sx={{ fontSize: 13, fontWeight: 500, color: BRAND.muted, overflowWrap: 'anywhere' }}>
                                                {summary.join(', ')}
                                            </Typography>
                                        )}
                                    </Box>
                                </StepLabel>
                                <StepContent
                                    sx={{
                                        borderLeftColor: alpha(BRAND.navy, 0.12),
                                        borderLeftWidth: 2,
                                        ml: '19px',
                                        pl: { xs: 2.5, md: 4 },
                                        pr: 0,
                                        ...(isCurrentStep && {
                                            pt: 2,
                                            pb: 3
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
