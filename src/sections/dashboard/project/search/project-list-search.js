import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Box,
    Button,
    Card,
    Checkbox,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    Divider,
    Drawer,
    FormControlLabel,
    IconButton,
    Stack,
    Typography,
    useMediaQuery
} from '@mui/material';
import { useAuth } from "src/hooks/use-auth";
import { SpecialtySelectForm } from "src/components/specialty-select-form";
import ChevronDownIcon from "@untitled-ui/icons-react/build/esm/ChevronDown";
import { usePopover } from "src/hooks/use-popover";
import { DateRangePicker } from "@mui/x-date-pickers-pro";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { formatDateRange } from "src/utils/date-locale";
import useDictionary from "src/hooks/use-dictionaries";
import { profileApi } from "src/api/profile";
import { ERROR, INFO } from "src/libs/log";
import { useUpdateEffect } from "src/hooks/use-update-effect";
import { AddressAutoCompleteWithPolygon } from "src/components/address/AddressAutoCompleteWithPolygon";
import FilterListIcon from '@mui/icons-material/FilterList';

var ChipField;
(function (FilterField) {
    FilterField['SPECIALTY'] = { label: 'Specialty', id: 'specialty' };
    FilterField['SHOW_NOT_INTERESTED'] = { label: undefined, id: 'showNotInterested' };
    FilterField['ISO_DATA'] = { label: 'Region', id: 'isoData' };
    FilterField['PERIOD'] = { label: 'Project Period', id: 'projectPeriod' };
    FilterField['LOCATION'] = { label: 'Location', id: 'location' };
})(ChipField || (ChipField = {}));

function createChip(value, displayValue, filterField) {
    return {
        label: filterField.label,
        field: filterField.id,
        value: value,
        displayValue: displayValue
    };
}

const useSpecialistDefaultFilters = () => {
    const { specialties, loading } = useDictionary();
    const { user } = useAuth();
    const [filters, setFilters] = useState([])
    const [initialized, setInitialized] = useState(false);

    const fetchDefaultFilters = async () => {
        setInitialized(false);
        const filtersInLocalStorage = getFiltersInLocalStorage();
        if (filtersInLocalStorage) {
            INFO("Fetch filters from local storage", filtersInLocalStorage);
            setFilters(filtersInLocalStorage);
        } else {
            INFO("Start fetch user specialties for", user.id, specialties);
            const userSpecialtiesData = await profileApi.getUserSpecialtiesById(user.id);

            const userSpec = userSpecialtiesData.map(uS => ({
                ...uS,
                id: uS.specialty,
                label: specialties.byId[uS.specialty]?.label
            }));
            INFO("User specialties:", userSpec);
            let newFilters = userSpec.map(spec => createChip(spec, spec.label, ChipField.SPECIALTY));

            newFilters = [...newFilters, createChip(true, null, ChipField.SHOW_NOT_INTERESTED)]

            setFilters(newFilters);
        }
        setInitialized(true);
    }

    useEffect(() => {
        if (user && loading && !initialized) {
            fetchDefaultFilters();
        }
    }, [user, loading]);

    useEffect(() => {
        INFO("initialized", initialized);
    }, [initialized]);

    return { filters, initialized, fetchDefaultFilters };
};

const updateFiltersInLocalStorage = (filters) => {
    try {
        window.localStorage.setItem(window.location.href, JSON.stringify(filters));
    } catch (e) {
        ERROR("Error updateFiltersInLocalStorage", e);
    }
};

const getFiltersInLocalStorage = () => {
    try {
        return JSON.parse(window.localStorage.getItem(window.location.href));
    } catch (e) {
        ERROR("Error updateFiltersInLocalStorage", e);
    }
};

export const ProjectListSearch = (props) => {
    const { projectsCount, onFiltersChange, onDefaultFiltersInitialized, periodEnabled = false, ...other } = props;
    const popover = usePopover();
    const datePopover = usePopover();
    const locationPopover = usePopover();
    const [location, setLocation] = useState(null);
    const [isoData, setIsoData] = useState(null);
    const defaultFilters = useSpecialistDefaultFilters();
    const smUp = useMediaQuery((theme) => theme.breakpoints.up('sm'));
    const [drawerOpen, setDrawerOpen] = useState(false); // Состояние для открытия/закрытия Drawer

    const [chips, setChips] = useState([]);

    useUpdateEffect(() => {
        if (defaultFilters.initialized) {
            INFO("setChips", defaultFilters.filters);
            setChips(defaultFilters.filters);
        }
    }, [defaultFilters.initialized]);

    const handleChipsUpdate = useCallback(() => {
        const filters = {
            specialties: [],
            regionFilter: undefined,
            showNotInterested: false
        };

        INFO("chips", chips);
        chips.forEach((chip) => {
            switch (chip.field) {
                case ChipField.SPECIALTY.id:
                    filters.specialties.push(chip.value);
                    break;
                case ChipField.ISO_DATA.id:
                    filters.regionFilter = chip.value;
                    break;
                case ChipField.SHOW_NOT_INTERESTED.id:
                    filters.showNotInterested = chip.value;
                    break;
                default:
                    break;
            }
        });
        INFO("filters", filters);

        updateFiltersInLocalStorage(chips);
        onFiltersChange?.(filters);
        onDefaultFiltersInitialized?.(true);
    }, [chips, onFiltersChange]);

    useUpdateEffect(() => {
        handleChipsUpdate();
    }, [chips, handleChipsUpdate]);

    const handleShowNotInterested = () => {
        setChips((prevChips) => {
            if (!prevChips.some(chip => chip.field === ChipField.SHOW_NOT_INTERESTED.id)) {
                INFO("New value for filter " + ChipField.SHOW_NOT_INTERESTED.id, true);
                return [...prevChips, createChip(true, null, ChipField.SHOW_NOT_INTERESTED)];
            }

            return prevChips.map(chip => {
                if (chip.field === ChipField.SHOW_NOT_INTERESTED.id) {
                    chip.value = !chip.value;
                    INFO("New value for filter " + ChipField.SHOW_NOT_INTERESTED.id, chip.value);
                    return chip;
                }
                return chip;
            })
        });
    }

    const handleDefaultFiltersRefresh = () => {
        window.localStorage.removeItem(window.location.href);
        defaultFilters.fetchDefaultFilters();
    }

    const handleChipDelete = useCallback((deletedChip) => {
        setChips((prevChips) => prevChips.filter((chip) => chip.field !== deletedChip.field || chip.value !== deletedChip.value));
    }, []);

    const handleSpecialtyChange = useCallback((value) => {
        setChips((prevChips) => [
            ...prevChips,
            createChip(value, value.label, ChipField.SPECIALTY)
        ]);
    }, []);

    const handleProjectPeriodChange = useCallback((newValue) => {
        setChips((prevChips) => {
            const newPeriod = { startDate: newValue[0], endDate: newValue[1] };
            const filteredChips = prevChips.filter((chip) => chip.field !== ChipField.PERIOD.id);
            return [
                ...filteredChips,
                createChip(newPeriod, formatDateRange(newPeriod?.startDate?.toDate(), newPeriod?.endDate?.toDate()), ChipField.PERIOD)
            ];
        });
        datePopover.handleClose();
    }, [datePopover]);

    const handleLocationChange = useCallback((location, isoData) => {
        INFO("LOCATION CHANGE", { location, isoData })
        setLocation(location);
        setIsoData(isoData)
    }, []);

    const handleApplyLocationFilters = useCallback(() => {
        setChips((prevChips) => [
            ...prevChips.filter(chip => (chip.field !== ChipField.LOCATION.id && chip.field !== ChipField.ISO_DATA.id)),
            createChip(location, location.place_name, ChipField.LOCATION),
            createChip(isoData, `${isoData.profile} [${isoData.minutes} min]`, ChipField.ISO_DATA)
        ]);
        locationPopover.handleClose();
    }, [locationPopover]);

    const projectPeriod = useMemo(() => {
        const period = chips.find((chip) => chip.field === ChipField.PERIOD.id)?.value || {};
        return [period.startDate || null, period.endDate || null];
    }, [chips]);

    const toggleDrawer = () => {
        setDrawerOpen((prev) => !prev);
    };

    return (
        <>
            {!smUp && (
                <IconButton
                    onClick={toggleDrawer}
                    sx={{
                        position: 'fixed',
                        left: 16,
                        top: 170,
                        zIndex: 1200,
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText',
                        boxShadow: 2,
                    }}
                >
                    <FilterListIcon />
                </IconButton>
            )}

            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={toggleDrawer}
                sx={{
                    '& .MuiDrawer-paper': {
                        width: '280px', // Ширина Drawer
                        p: 2,
                    },
                }}
            >
                <Card sx={{ height: '100%' }}>
                    <Stack alignItems="center" direction="row" flexWrap="wrap" spacing={2} sx={{ p: 1 }}>
                        <Button color="inherit" endIcon={<ChevronDownIcon />} onClick={popover.handleOpen}>
                            Specialties
                        </Button>
                        <SpecialtySelectForm
                            open={popover.open}
                            selectedSpecialties={chips.filter(chip => chip.field === ChipField.SPECIALTY.id)
                                .map(chip => chip.value)}
                            onSpecialtyChange={handleSpecialtyChange}
                            onClose={popover.handleClose}
                            disabledSelected={false}
                        />

                        {periodEnabled && (
                            <Button color="inherit" endIcon={<ChevronDownIcon />} onClick={datePopover.handleOpen}>
                                Project Period
                            </Button>
                        )}
                        <Button color="inherit" endIcon={<ChevronDownIcon />} onClick={locationPopover.handleOpen}>
                            Location
                        </Button>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={chips.find(chip => chip.field === ChipField.SHOW_NOT_INTERESTED.id)?.value || false}
                                    onChange={handleShowNotInterested}
                                />
                            }
                            label="Show not interested"
                            sx={{
                                '& .MuiFormControlLabel-label': {
                                    fontSize: '14px',
                                    fontWeight: 'medium'
                                },
                            }}
                        />
                        <Box sx={{ flexGrow: 1 }} />
                        <Button
                            color="warning"
                            onClick={handleDefaultFiltersRefresh}
                        >
                            Default filters
                        </Button>
                    </Stack>

                    <Divider />

                    {chips.length > 0 ? (
                        <Stack alignItems="center" direction="row" flexWrap="wrap" gap={1} sx={{ p: 2 }}>
                            {chips.filter(c => c.label).map((chip, index) => (
                                <Chip key={index} label={`${chip.label}: ${chip.displayValue}`}
                                      onDelete={() => handleChipDelete(chip)} variant="outlined" />
                            ))}
                            <Box sx={{ flexGrow: 1 }} />
                            <Typography
                                color="text.secondary"
                                component="p"
                                variant="overline"
                            >
                                Projects found: {projectsCount}
                            </Typography>
                        </Stack>
                    ) : (
                        <Box sx={{ p: 2.5 }}>
                            <Typography color="text.secondary" variant="subtitle2">
                                No filters applied
                            </Typography>
                        </Box>
                    )}
                </Card>
            </Drawer>

            {smUp && ( // На больших экранах Card отображается как обычно
                <Card {...other}>
                    <Stack alignItems="center" direction="row" flexWrap="wrap" spacing={2} sx={{ p: 1 }}>
                        <Button color="inherit" endIcon={<ChevronDownIcon />} onClick={popover.handleOpen}>
                            Specialties
                        </Button>
                        <SpecialtySelectForm
                            open={popover.open}
                            selectedSpecialties={chips.filter(chip => chip.field === ChipField.SPECIALTY.id)
                                .map(chip => chip.value)}
                            onSpecialtyChange={handleSpecialtyChange}
                            onClose={popover.handleClose}
                            disabledSelected={false}
                        />

                        {periodEnabled && (
                            <Button color="inherit" endIcon={<ChevronDownIcon />} onClick={datePopover.handleOpen}>
                                Project Period
                            </Button>
                        )}
                        <Button color="inherit" endIcon={<ChevronDownIcon />} onClick={locationPopover.handleOpen}>
                            Location
                        </Button>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={chips.find(chip => chip.field === ChipField.SHOW_NOT_INTERESTED.id)?.value || false}
                                    onChange={handleShowNotInterested}
                                />
                            }
                            label="Show not interested"
                            sx={{
                                '& .MuiFormControlLabel-label': {
                                    fontSize: '14px',
                                    fontWeight: 'medium'
                                },
                            }}
                        />
                        <Box sx={{ flexGrow: 1 }} />
                        <Button
                            color="warning"
                            onClick={handleDefaultFiltersRefresh}
                        >
                            Default filters
                        </Button>
                    </Stack>

                    <Divider />

                    {chips.length > 0 ? (
                        <Stack alignItems="center" direction="row" flexWrap="wrap" gap={1} sx={{ p: 2 }}>
                            {chips.filter(c => c.label).map((chip, index) => (
                                <Chip key={index} label={`${chip.label}: ${chip.displayValue}`}
                                      onDelete={() => handleChipDelete(chip)} variant="outlined" />
                            ))}
                            <Box sx={{ flexGrow: 1 }} />
                            <Typography
                                color="text.secondary"
                                component="p"
                                variant="overline"
                            >
                                Projects found: {projectsCount}
                            </Typography>
                        </Stack>
                    ) : (
                        <Box sx={{ p: 2.5 }}>
                            <Typography color="text.secondary" variant="subtitle2">
                                No filters applied
                            </Typography>
                        </Box>
                    )}
                </Card>
            )}

            <Dialog open={datePopover.open} onClose={datePopover.handleClose}>
                <DialogContent>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateRangePicker
                            startText="Start Date"
                            endText="End Date"
                            value={projectPeriod}
                            onChange={handleProjectPeriodChange}
                        />
                    </LocalizationProvider>
                </DialogContent>
                <DialogActions>
                    <Button onClick={datePopover.handleClose}>Cancel</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={locationPopover.open} onClose={locationPopover.handleClose} fullScreen={!smUp}>
                <DialogContent>
                    <AddressAutoCompleteWithPolygon
                        location={chips.find(c => c.field === ChipField.LOCATION.id)?.value}
                        isoData={chips.find(c => c.field === ChipField.ISO_DATA.id)?.value}
                        withMap={true}
                        handleSuggestionClick={handleLocationChange} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleApplyLocationFilters}>Apply</Button>
                    <Button onClick={locationPopover.handleClose} color={"error"}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};