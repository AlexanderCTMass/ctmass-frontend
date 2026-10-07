import { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import SearchMdIcon from '@untitled-ui/icons-react/build/esm/SearchMd';
import {
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

const tabs = [
    {
        label: 'All',
        value: 'all'
    },
    {
        label: 'Customers',
        value: 'CUSTOMER'
    },
    {
        label: 'Service providers',
        value: 'WORKER'
    },
    {
        label: 'Testers',
        value: 'TESTER'
    }
];

const TAB_KEYS = ['CUSTOMER', 'WORKER', 'TESTER'];

const sortOptions = [
    {
        label: 'Registered (newest)',
        value: 'registrationAt|desc'
    },
    {
        label: 'Registered (oldest)',
        value: 'registrationAt|asc'
    },
    {
        label: 'Name (A-Z)',
        value: 'name|asc'
    },
    {
        label: 'Name (Z-A)',
        value: 'name|desc'
    }
];

const getTabFromFilters = (filters = {}) => TAB_KEYS.find((key) => filters[key]) || 'all';

export const CustomerListSearch = (props) => {
    const { filters = {}, onFiltersChange, onSortChange, sortBy, sortDir } = props;
    const [queryValue, setQueryValue] = useState(filters.query || '');
    const filtersRef = useRef(filters);
    filtersRef.current = filters;
    const currentTab = getTabFromFilters(filters);

    useEffect(() => {
        const trimmed = queryValue.trim();
        if ((filtersRef.current.query || '') === trimmed) return undefined;
        const timer = setTimeout(() => {
            onFiltersChange?.({
                ...filtersRef.current,
                query: trimmed || undefined
            });
        }, 300);
        return () => clearTimeout(timer);
    }, [queryValue, onFiltersChange]);

    const handleTabsChange = useCallback((event, value) => {
        const updatedFilters = {
            ...filtersRef.current,
            CUSTOMER: undefined,
            WORKER: undefined,
            TESTER: undefined
        };

        if (value !== 'all') {
            updatedFilters[value] = true;
        }

        onFiltersChange?.(updatedFilters);
    }, [onFiltersChange]);

    const handleQuerySubmit = useCallback((event) => {
        event.preventDefault();
        const trimmed = queryValue.trim();
        onFiltersChange?.({
            ...filtersRef.current,
            query: trimmed || undefined
        });
    }, [queryValue, onFiltersChange]);

    const handleSortChange = useCallback((event) => {
        const [nextSortBy, nextSortDir] = event.target.value.split('|');

        onSortChange?.({
            sortBy: nextSortBy,
            sortDir: nextSortDir
        });
    }, [onSortChange]);

    return (
        <>
            <Tabs
                allowScrollButtonsMobile
                indicatorColor="primary"
                onChange={handleTabsChange}
                scrollButtons="auto"
                sx={{ px: { xs: 1, sm: 3 } }}
                textColor="primary"
                value={currentTab}
                variant="scrollable"
            >
                {tabs.map((tab) => (
                    <Tab
                        key={tab.value}
                        label={tab.label}
                        value={tab.value}
                    />
                ))}
            </Tabs>
            <Divider />
            <Stack
                alignItems={{ xs: 'stretch', sm: 'center' }}
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ p: { xs: 2, sm: 3 } }}
            >
                <Box
                    component="form"
                    onSubmit={handleQuerySubmit}
                    sx={{ flexGrow: 1 }}
                >
                    <OutlinedInput
                        fullWidth
                        onChange={(event) => setQueryValue(event.target.value)}
                        placeholder="Search by name, email, phone or ID"
                        startAdornment={(
                            <InputAdornment position="start">
                                <SvgIcon>
                                    <SearchMdIcon />
                                </SvgIcon>
                            </InputAdornment>
                        )}
                        value={queryValue}
                    />
                </Box>
                <TextField
                    label="Sort by"
                    name="sort"
                    onChange={handleSortChange}
                    select
                    SelectProps={{ native: true }}
                    sx={{ minWidth: { sm: 220 } }}
                    value={`${sortBy}|${sortDir}`}
                >
                    {sortOptions.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                        >
                            {option.label}
                        </option>
                    ))}
                </TextField>
            </Stack>
        </>
    );
};

CustomerListSearch.propTypes = {
    filters: PropTypes.object,
    onFiltersChange: PropTypes.func,
    onSortChange: PropTypes.func,
    sortBy: PropTypes.string,
    sortDir: PropTypes.oneOf(['asc', 'desc'])
};
