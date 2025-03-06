import {useCallback, useRef, useState} from 'react';
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

const tabOptions = [
    {
        label: 'All',
        value: 'all'
    },
    {
        label: 'Draft',
        value: ProjectStatus.DRAFT
    },
    {
        label: 'Published',
        value: ProjectStatus.PUBLISHED,
        badge: 3
    },
    {
        label: 'In progress',
        value: ProjectStatus.IN_PROGRESS
    },
    {
        label: 'For confirmation',
        value: ProjectStatus.ON_CONFIRM,
        badge: 2
    },
    {
        label: 'Completed',
        value: ProjectStatus.COMPLETED
    },
];

export const ProjectListTabs = (props) => {
    const {
        onFiltersChange
    } = props;
    const [currentTab, setCurrentTab] = useState('all');
    const [filters, setFilters] = useState({
        state: undefined
    });

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
                {tabOptions.map((tab) => (
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
