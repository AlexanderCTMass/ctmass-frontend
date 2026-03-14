import { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Divider,
    Tab,
    Tabs,
    Typography
} from '@mui/material';
import { useUpdateEffect } from 'src/hooks/use-update-effect';
import { ProjectStatus } from "src/enums/project-state";
import { ProjectSpecialistStatus } from "src/enums/project-specialist-state";

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
    [ProjectSpecialistStatus.RESPONDED]: "Projects you've responded to - waiting for client's decision",
    [ProjectStatus.PUBLISHED]: "Active projects visible to contractors - searching for specialists",
    [ProjectStatus.DRAFT]: "Unpublished project drafts - only visible to you and can be edited",
    [ProjectStatus.IN_PROGRESS]: "Projects currently in work - active collaboration",
    [ProjectStatus.COMPLETED]: "Completed/finished projects on the CTMASS platform",
};

export const ProjectListTabs = (props) => {
    const {
        projectsCount,
        onFiltersChange,
        role,
        loading
    } = props;

    const [currentTab, setCurrentTab] = useState();
    const [filters, setFilters] = useState({ state: undefined });
    const autoSwitchedRef = useRef(false);

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
        const state = tab === 'all' ? undefined : tab;
        setFilters((prevState) => ({
            ...prevState,
            state
        }));
    }, []);

    const visibleTabs = tabOptions.filter(tab => !tab.role || tab.role === role);

    return (
        <Box>
            <Tabs
                indicatorColor="primary"
                onChange={handleTabsChange}
                textColor="primary"
                value={currentTab}
                variant="fullWidth"
                sx={{
                    '& .MuiTab-root': {
                        fontWeight: 500,
                        minHeight: 48,
                        borderBottom: '2px solid transparent',
                        '&.Mui-selected': {
                            fontWeight: 700
                        }
                    }
                }}
            >
                {visibleTabs.map((tab) => (
                    <Tab
                        key={tab.value}
                        label={tab.label}
                        value={tab.value}
                    />
                ))}
            </Tabs>

            <Divider />

            {currentTab && (
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ pt: 2, display: 'block' }}
                >
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
