import { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Tab,
    Tabs,
    Typography,
    useMediaQuery
} from '@mui/material';
import { useUpdateEffect } from 'src/hooks/use-update-effect';
import { ProjectStatus } from "src/enums/project-state";
import { ProjectSpecialistStatus } from "src/enums/project-specialist-state";
import { alpha } from '@mui/material/styles';
import { BRAND, SHADOW } from 'src/theme/ctmass-tokens';

const tabOptions = [
    {
        label: 'Responded',
        value: ProjectSpecialistStatus.RESPONDED,
        role: "contractor"
    },
    {
        label: 'Published',
        value: ProjectStatus.PUBLISHED,
        role: "customer"
    },
    {
        label: 'Draft',
        value: ProjectStatus.DRAFT,
        role: "customer",
    },
    {
        label: 'In progress',
        value: ProjectStatus.IN_PROGRESS
    },
    {
        label: 'Completed',
        value: ProjectStatus.COMPLETED
    },
];

const tabDescriptions = {
    [ProjectSpecialistStatus.RESPONDED]: "Projects you have responded to. Waiting for the client to decide.",
    [ProjectStatus.PUBLISHED]: "Live projects that contractors can see and respond to.",
    [ProjectStatus.DRAFT]: "Drafts only you can see. Finish and publish them when you are ready.",
    [ProjectStatus.IN_PROGRESS]: "Projects with a contractor on the job right now.",
    [ProjectStatus.COMPLETED]: "Finished projects. Leave a review if you have not yet.",
};

export const ProjectListTabs = (props) => {
    const { onTabChange } = props;
    const {
        projectsCount,
        onFiltersChange,
        role,
        loading
    } = props;

    const [currentTab, setCurrentTab] = useState();
    const [filters, setFilters] = useState({ state: undefined });
    const autoSwitchedRef = useRef(false);
    const smUp = useMediaQuery((theme) => theme.breakpoints.up('sm'));

    useEffect(() => {
        autoSwitchedRef.current = false;
        const value = tabOptions.find(tab => !tab.role || tab.role === role)?.value;
        handleTabsChange({}, value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [role]);

    // Auto-switch to Draft if Published tab has 0 projects after loading
    useEffect(() => {
        if (
            !loading &&
            projectsCount === 0 &&
            currentTab === ProjectStatus.PUBLISHED &&
            !autoSwitchedRef.current
        ) {
            autoSwitchedRef.current = true;
            handleTabsChange({}, ProjectStatus.DRAFT);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, projectsCount, currentTab]);

    const handleFiltersUpdate = useCallback(() => {
        onFiltersChange?.(filters);
    }, [filters, onFiltersChange]);

    useUpdateEffect(() => {
        handleFiltersUpdate();
    }, [filters, handleFiltersUpdate]);

    const handleTabsChange = useCallback((event, tab) => {
        setCurrentTab(tab);
        onTabChange?.(tab);
        const state = tab === 'all' ? undefined : tab;
        setFilters((prevState) => ({
            ...prevState,
            state
        }));
    }, [onTabChange]);

    const visibleTabs = tabOptions.filter(tab => !tab.role || tab.role === role);

    return (
        <Box>
            <Tabs
                onChange={handleTabsChange}
                value={currentTab || false}
                variant={smUp ? 'fullWidth' : 'scrollable'}
                scrollButtons={false}
                aria-label="Project status"
                sx={{
                    minHeight: 52,
                    p: 0.5,
                    mx: { xs: -2, sm: 0 },
                    px: { xs: 2, sm: 0.5 },
                    maxWidth: { sm: 560 },
                    borderRadius: { xs: 0, sm: 999 },
                    bgcolor: { xs: 'transparent', sm: alpha(BRAND.navy, 0.07) },
                    '& .MuiTabs-flexContainer': { gap: { xs: 1, sm: 0 } },
                    '& .MuiTabs-indicator': {
                        top: 0,
                        bottom: 0,
                        height: 'auto',
                        borderRadius: 999,
                        bgcolor: BRAND.navy,
                        boxShadow: SHADOW.md,
                        zIndex: 0,
                        transition: 'left .45s cubic-bezier(.2,.8,.2,1), width .45s cubic-bezier(.2,.8,.2,1)'
                    },
                    '& .MuiTab-root': {
                        position: 'relative',
                        zIndex: 1,
                        minHeight: 44,
                        minWidth: { xs: 'auto', sm: 90 },
                        px: 2.25,
                        ml: '0 !important',
                        borderRadius: 999,
                        fontSize: 14,
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        textTransform: 'none',
                        color: BRAND.navy,
                        bgcolor: { xs: alpha(BRAND.navy, 0.07), sm: 'transparent' },
                        transition: 'color .3s ease',
                        '&.Mui-selected': { color: '#FFFFFF' },
                        '&.Mui-focusVisible': { outline: `2px solid ${BRAND.green}`, outlineOffset: 2 }
                    }
                }}
            >
                {visibleTabs.map((tab) => (
                    <Tab
                        key={tab.value}
                        label={tab.label}
                        value={tab.value}
                        disableRipple
                    />
                ))}
            </Tabs>

            {currentTab && (
                <Typography sx={{ pt: 2, color: BRAND.muted, fontSize: 14, fontWeight: 500, lineHeight: 1.5 }}>
                    {tabDescriptions[currentTab] || ""}
                </Typography>
            )}
        </Box>
    );
};

ProjectListTabs.propTypes = {
    onFiltersChange: PropTypes.func,
    projectsCount: PropTypes.number,
    role: PropTypes.string,
    loading: PropTypes.bool
};
