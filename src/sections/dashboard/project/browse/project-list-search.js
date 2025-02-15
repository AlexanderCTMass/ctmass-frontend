import * as React from 'react';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {Box, Button, Card, Chip, Divider, Stack, Typography} from '@mui/material';
import {useDispatch, useSelector} from "../../../../store";
import {thunks} from "../../../../thunks/dictionary";
import {useUpdateEffect} from "../../../../hooks/use-update-effect";
import {useAuth} from "../../../../hooks/use-auth";
import {SpecialtySelectForm} from "../../../../components/specialty-select-form";
import ChevronDownIcon from "@untitled-ui/icons-react/build/esm/ChevronDown";
import {usePopover} from "../../../../hooks/use-popover";

import {DateRangePicker} from "@mui/x-date-pickers-pro";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";

const useCategories = () => {
    const dispatch = useDispatch();
    const {categories, specialties} = useSelector((state) => state.dictionary);

    useEffect(() => {
        dispatch(thunks.getCategories({}));
    }, [dispatch]);

    return [];
};

export const ProjectListSearch = (props) => {
    const {onFiltersChange, ...other} = props;
    const {user} = useAuth();
    const popover = usePopover();
    const specialtyOptions = useCategories();

    // Состояние чипсов
    const [chips, setChips] = useState(user?.specialties?.map(spec => ({
        label: 'Specialty',
        field: 'specialty',
        value: spec,
        displayValue: spec.label
    })) || []);

    // Фильтрация при изменении чипсов
    const handleChipsUpdate = useCallback(() => {
        const filters = { specialty: [], projectPeriod: null };

        chips.forEach((chip) => {
            switch (chip.field) {
                case 'specialty':
                    filters.specialty.push(chip.value.id);
                    break;
                case 'projectPeriod':
                    filters.projectPeriod = chip.value;
                    break;
                default:
                    break;
            }
        });

        onFiltersChange?.(filters);
    }, [chips, onFiltersChange]);

    useUpdateEffect(() => {
        handleChipsUpdate();
    }, [chips, handleChipsUpdate]);

    // Удаление чипсов
    const handleChipDelete = useCallback((deletedChip) => {
        setChips(prevChips => prevChips.filter(chip => chip.field !== deletedChip.field || chip.value !== deletedChip.value));
    }, []);

    // Добавление специальности
    const handleSpecialtyChange = useCallback((value) => {
        setChips(prevChips => [
            ...prevChips.filter(chip => chip.field !== 'specialty'),
            {
                label: 'Specialty',
                field: 'specialty',
                value,
                displayValue: value.label
            }
        ]);
    }, []);

    // Обработчик выбора периода
    const handleProjectPeriodChange = useCallback((newValue) => {
        setChips(prevChips => {
            const newPeriod = { startDate: newValue[0], endDate: newValue[1] };

            // Удаляем старый чип
            const filteredChips = prevChips.filter(chip => chip.field !== 'projectPeriod');

            return [...filteredChips, {
                label: 'Project Period',
                field: 'projectPeriod',
                value: newPeriod,
                displayValue: `${newPeriod?.startDate?.toLocaleDateString() || 'Start'} - ${newPeriod?.endDate?.toLocaleDateString() || 'End'}`
            }];
        });
    }, []);

    // Текущее значение периода
    const projectPeriod = useMemo(() => {
        const period = chips.find(chip => chip.field === 'projectPeriod')?.value || {};
        return [period.startDate || null, period.endDate || null];
    }, [chips]);

    return (

            <Card {...other}>
                <Stack alignItems="center" direction="row" flexWrap="wrap" spacing={2} sx={{ p: 1 }}>
                    <Button color="inherit" endIcon={<ChevronDownIcon />} onClick={popover.handleOpen}>
                        Specialties
                    </Button>
                    <SpecialtySelectForm open={popover.open} selectedSpecialties={chips.filter(chip => chip.field === 'specialty').map(chip => chip.value)}
                                         onSpecialtyChange={handleSpecialtyChange} onClose={popover.handleClose} disabledSelected={false} />

                    {/* Выбор диапазона дат */}
                    <LocalizationProvider dateAdapter={AdapterDayjs}><DateRangePicker
                        startText="Start Date"
                        endText="End Date"
                        value={projectPeriod}
                        onChange={handleProjectPeriodChange}
                        renderInput={(startProps, endProps) => (
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <input {...startProps.inputProps} placeholder="Start Date" />
                                <input {...endProps.inputProps} placeholder="End Date" />
                            </Box>
                        )}
                    /></LocalizationProvider>
                </Stack>

                <Divider />

                {/* Чипсы с выбранными фильтрами */}
                {chips.length > 0 ? (
                    <Stack alignItems="center" direction="row" flexWrap="wrap" gap={1} sx={{ p: 2 }}>
                        {chips.map((chip, index) => (
                            <Chip key={index} label={`${chip.label}: ${chip.displayValue}`} onDelete={() => handleChipDelete(chip)} variant="outlined" />
                        ))}
                    </Stack>
                ) : (
                    <Box sx={{ p: 2.5 }}>
                        <Typography color="text.secondary" variant="subtitle2">
                            No filters applied
                        </Typography>
                    </Box>
                )}
            </Card>

    );
};
