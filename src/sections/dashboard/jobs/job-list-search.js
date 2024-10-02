import * as React from 'react';
import {useCallback, useEffect, useMemo, useState} from 'react';
import SearchMdIcon from '@untitled-ui/icons-react/build/esm/SearchMd';
import {Box, Button, Card, Chip, Divider, Input, Stack, SvgIcon, Typography} from '@mui/material';
import {MultiSelect} from 'src/components/multi-select-grouping';
import {useDispatch, useSelector} from "../../../store";
import {thunks} from "../../../thunks/dictionary";
import {useUpdateEffect} from "../../../hooks/use-update-effect";
import {useAuth} from "../../../hooks/use-auth";
import {SpecialtySelectForm} from "../../../components/specialty-select-form";
import ChevronDownIcon from "@untitled-ui/icons-react/build/esm/ChevronDown";
import {usePopover} from "../../../hooks/use-popover";


const useCategories = () => {
    const dispatch = useDispatch();
    const {categories, specialties} = useSelector((state) => state.dictionary);

    useEffect(() => {
            dispatch(thunks.getCategories({}));
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []);

    // return specialties.allIds.map((id) => specialties.byId[id]).map((cat) => {
    //     return {...cat, value: cat.id + '', parentLabel: categories.byId[cat.parent].label}
    // });
    return [];
};
export const JobListSearch = (props) => {
    const {onFiltersChange, ...other} = props;

    const {user} = useAuth();
    const popover = usePopover();
    const specialtyOptions = useCategories();

    const [chips, setChips] = useState(user && user.specialties ? user.specialties.map((spec) => {
        return {
            label: 'Specialty',
            field: 'specialty',
            value: spec,
            displayValue: spec.label
        }
    }): []);

    const handleChipsUpdate = useCallback(() => {
        const filters = {
            specialty: []
        };

        chips.forEach((chip) => {
            switch (chip.field) {
                case 'specialty':
                    filters.specialty.push(Number(chip.value.id));
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


    const handleChipDelete = useCallback((deletedChip) => {
        setChips((prevChips) => {
            return prevChips.filter((chip) => {
                // There can exist multiple chips for the same field.
                // Filter them by value.

                return !(deletedChip.field === chip.field && deletedChip.value === chip.value);
            });
        });
    }, []);

    const handleSpecialtyChange = useCallback((values) => {
        setChips((prevChips) => {
            const valuesFound = [];

            // First cleanup the previous chips
            const newChips = prevChips.filter((chip) => {
                if (chip.field !== 'specialty') {
                    return true;
                }

                const found = values.includes(chip.value);

                if (found) {
                    valuesFound.push(chip.value);
                }

                return found;
            });

            // Nothing changed
            if (values.length === valuesFound.length) {
                return newChips;
            }

            values.forEach((value) => {
                if (!valuesFound.includes(value)) {
                    const option = specialtyOptions.find((option) => option.id === value.id);
                    newChips.push({
                        label: 'Specialty',
                        field: 'specialty',
                        value,
                        displayValue: option.label
                    });
                }
            });
            console.log(newChips);
            return newChips;
        });
    }, [specialtyOptions]);


    // We memoize this part to prevent re-render issues
    const specialtyValues = useMemo(() => chips
        .filter((chip) => chip.field === 'specialty')
        .map((chip) => chip.value), [chips]);

    const showChips = chips.length > 0;

    return (
        <Card {...props}>
            {/* <Stack
                alignItems="center"
                direction="row"
                spacing={2}
                sx={{p: 2}}
            >
                <SvgIcon>
                    <SearchMdIcon/>
                </SvgIcon>
                <Box sx={{flexGrow: 1}}>
                    <Input
                        disableUnderline
                        fullWidth
                        placeholder="Enter a keyword"
                    />
                </Box>
            </Stack>
            <Divider/>*/}
            <Stack
                alignItems="center"
                direction="row"
                flexWrap="wrap"
                spacing={2}
                sx={{p: 1}}
            >
                <Button
                    color="inherit"
                    endIcon={(
                        <SvgIcon>
                            <ChevronDownIcon/>
                        </SvgIcon>
                    )}
                    onClick={popover.handleOpen}
                >
                    Specialties
                </Button>
                <SpecialtySelectForm open={popover.open} selectedSpecialties={specialtyValues}
                                     onSpecialtyChange={handleSpecialtyChange} onClose={popover.handleClose}
                                     disabledSelected={false}/>
                {/*<MultiSelect
          label="Specialty"
          options={levelOptions}
          value={levelValues}
        />*/}
            </Stack>
            <Divider/>
            {showChips
                ? (
                    <Stack
                        alignItems="center"
                        direction="row"
                        flexWrap="wrap"
                        gap={1}
                        sx={{p: 2}}
                    >
                        {chips.map((chip, index) => (
                            <Chip
                                key={index}
                                label={(
                                    <Box
                                        sx={{
                                            alignItems: 'center',
                                            display: 'flex',
                                            '& span': {
                                                fontWeight: 600
                                            }
                                        }}
                                    >
                                        <>
                        <span>
                          {chip.label}
                        </span>
                                            :
                                            {' '}
                                            {chip.displayValue || chip.value}
                                        </>
                                    </Box>
                                )}
                                onDelete={() => handleChipDelete(chip)}
                                variant="outlined"
                            />
                        ))}
                    </Stack>
                )
                : (
                    <Box sx={{p: 2.5}}>
                        <Typography
                            color="text.secondary"
                            variant="subtitle2"
                        >
                            No filters applied
                        </Typography>
                    </Box>
                )}
        </Card>
    );
};
