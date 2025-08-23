import { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import SearchMdIcon from '@untitled-ui/icons-react/build/esm/SearchMd';
import {
    Badge,
    Box,
    Divider,
    InputAdornment,
    OutlinedInput,
    Stack,
    SvgIcon,
    Tab,
    Tabs,
    TextField, Typography
} from '@mui/material';
import { useUpdateEffect } from 'src/hooks/use-update-effect';
import { ProjectStatus } from "src/enums/project-state";
import { ProjectSpecialistStatus } from "src/enums/project-specialist-state";

const tabOptions = [
    /*    {
            label: 'All',
            value: 'all'
        },*/
    {
        label: 'Responded',
        value: ProjectSpecialistStatus.RESPONDED,
        role: "contractor"
    },
    {
        label: 'Published',
        value: ProjectStatus.PUBLISHED,
        // badge: 3,
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
    /*{
        label: 'Archive',
        value: ProjectStatus.ARCHIVED
    },*/
];

export const ProjectListTabs = (props) => {
    const {
        projectsCount,
        onFiltersChange,
        role,
        currentTabDefault
    } = props;
    const [currentTab, setCurrentTab] = useState();
    const [filters, setFilters] = useState({
        state: undefined
    });

    // Описания для каждого статуса
    const tabDescriptions = {
        [ProjectSpecialistStatus.RESPONDED]: "Projects you've responded to - waiting for client's decision",
        [ProjectStatus.PUBLISHED]: "Active projects visible to contractors - searching for specialists",
        [ProjectStatus.DRAFT]: "Unpublished project drafts - only visible to you and can be edited",
        [ProjectStatus.IN_PROGRESS]: "Projects currently in work - active collaboration",
        [ProjectStatus.COMPLETED]: "Completed/finished projects on the CTMASS platform",
        [ProjectStatus.ARCHIVED]: "Archived projects - historical records"
    };

    useEffect(() => {
        const value = tabOptions.find(tab => !tab.role || tab.role === role)?.value;
        handleTabsChange({}, value);
    }, [role]);

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

    return (
        <div>
            <Tabs
                indicatorColor="primary"
                onChange={handleTabsChange}
                scrollButtons="auto"
                textColor="primary"
                value={currentTab}
                variant="scrollable"
            >
                {tabOptions.filter(tab => !tab.role || tab.role === role).map((tab) => (
                    <Tab
                        key={tab.value}
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', paddingRight: 3 }}>
                                {tab.badge ?
                                    <Badge badgeContent={tab.badge} color="primary" sx={{
                                        '& .MuiBadge-badge': {
                                            transform: 'translate(22px, -50%)',
                                        },
                                    }}>
                                        {tab.label}
                                    </Badge>
                                    : tab.label}
                            </Box>
                        }
                        value={tab.value}
                    />
                ))}
            </Tabs>

            <Divider />

            {/* Блок с описанием выбранного таба */}
            {currentTab && (
                <Typography
                    variant="caption"
                    // color="text.secondary"
                    sx={{ pt: 2 }}
                >
                    {tabDescriptions[currentTab] || "Project status description"}
                </Typography>
            )}
        </div>
    );
};

ProjectListTabs.propTypes = {
    onFiltersChange: PropTypes.func
};
