import {useCallback, useEffect, useRef, useState} from 'react';
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
    TextField
} from '@mui/material';
import {useUpdateEffect} from 'src/hooks/use-update-effect';
import {ProjectStatus} from "src/enums/project-state";
import {ProjectSpecialistStatus} from "src/enums/project-specialist-state";

const tabOptions = [
    /*    {
            label: 'All',
            value: 'all'
        },*/
    /*{
        label: 'Draft',
        value: ProjectStatus.DRAFT,
        role: "customer",
        hideIfEmpty: true
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
        role, currentTabDefault
    } = props;
    const [currentTab, setCurrentTab] = useState();
    const [filters, setFilters] = useState({
        state: undefined
    });

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
                            <Box sx={{display: 'flex', alignItems: 'center', paddingRight: 3}}>
                                {tab.badge ?
                                    <Badge badgeContent={tab.badge} color="primary" sx={{
                                        '& .MuiBadge-badge': { // Стили для внутреннего span
                                            transform: 'translate(22px, -50%)', // Сдвигаем вправо и выравниваем по вертикали
                                        },
                                    }}>
                                        {tab.label}
                                    </Badge>
                                    : tab.label}
                            </Box>
                        }
                        value={tab.value}
                        // sx={{paddingRight: 3}}
                    />
                ))}
            </Tabs>
            <Divider/>
        </div>
    );
};

ProjectListTabs.propTypes = {
    onFiltersChange: PropTypes.func
};
