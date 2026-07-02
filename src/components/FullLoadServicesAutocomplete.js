import { Popper, Alert } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import useDictionary from "src/hooks/use-dictionaries";
import { useUserSpecialtyIds } from "src/queries/use-user-specialties";

export default function FullLoadServicesAutocomplete({
    externalSearchText,
    onChange = () => {
    },
    onInputChange = () => {
    },
    onNoOptionClick = () => {
    },
    allowCustomInput = true
}) {
    const { specialties: dictSpecialties, services: dictServices, loading: dictionaryReady } = useDictionary();
    const { data: userSpecialtyIds = [], isLoading: userSpecialtiesLoading } = useUserSpecialtyIds();

    const [searchResults, setSearchResults] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [randomExample, setRandomExample] = useState("");

    const loading = !dictionaryReady || userSpecialtiesLoading;

    // Build the search index from the cached dictionary + userSpecialties queries
    // instead of re-fetching three whole collections on every mount.
    const { data, serviceExamples } = useMemo(() => {
        const userSet = new Set(userSpecialtyIds);
        const allData = [];
        const examples = [];

        Object.values(dictSpecialties.byId).forEach((spec) => {
            if (userSet.has(spec.id)) {
                allData.push({
                    id: spec.id,
                    label: spec.label,
                    type: "Specialties",
                    parentCategory: spec.parent || null,
                    fullId: spec.path
                });
            }
        });

        Object.values(dictServices.byId).forEach((svc) => {
            const parentSpecialty = svc.parent || null;
            if (!userSet.has(parentSpecialty)) {
                return;
            }
            const parentCategory = svc.specialty?.parent || null;
            allData.push({
                id: svc.id,
                label: svc.label,
                type: "Services",
                parentSpecialty,
                parentCategory,
                fullId: svc.path,
                keywords: svc.keywords || []
            });
            examples.push(svc.label);
            (svc.keywords || []).forEach((key) => {
                allData.push({
                    id: svc.id,
                    label: key,
                    type: "Services",
                    parentSpecialty,
                    parentCategory,
                    fullId: svc.path
                });
            });
        });

        return { data: allData, serviceExamples: examples };
    }, [dictSpecialties, dictServices, userSpecialtyIds]);

    useEffect(() => {
        if (!randomExample && serviceExamples.length > 0) {
            const randomIndex = Math.floor(Math.random() * serviceExamples.length);
            setRandomExample(serviceExamples[randomIndex]);
        }
    }, [serviceExamples, randomExample]);

    const handleSearch = (query) => {
        if (!query || !query.trim()) {
            setSearchResults([]);
            return;
        }

        console.log("Start local full-text search");

        const lowerQuery = query.toLowerCase().trim();
        const queryWords = lowerQuery.split(/\s+/);

        const results = data.filter((item) => {
            const searchableFields = [
                item.label.toLowerCase(),
                ...(item.keywords ? item.keywords.map((keyword) => keyword.toLowerCase()) : []),
                ...(item.description ? [item.description.toLowerCase()] : []),
            ];

            return queryWords.every((word) =>
                searchableFields.some((field) => field.includes(word))
            );
        });

        console.log(results);
        setSearchResults(results);
    };

    useEffect(() => {
        if (externalSearchText !== undefined) {
            setInputValue(externalSearchText);
            handleSearch(externalSearchText);
        }
    }, [externalSearchText]);

    useEffect(() => {
        onInputChange(inputValue);
    }, [inputValue]);

    const CustomPopper = (props) => (
        <Popper
            {...props}
            style={{ ...props.style, zIndex: 1300 }}
            placement="bottom"
            modifiers={[
                {
                    name: 'flip',
                    enabled: false,
                    options: {
                        altBoundary: false,
                        rootBoundary: 'document',
                        padding: 8,
                    },
                },
                {
                    name: 'preventOverflow',
                    enabled: true,
                    options: {
                        altAxis: false,
                        altBoundary: false,
                        tether: false,
                        rootBoundary: 'document',
                        padding: 8,
                    },
                },
            ]}
        />
    );

    return (
        <Autocomplete
            options={searchResults}
            getOptionLabel={(option) => `${option.label}`}
            freeSolo={allowCustomInput}
            loading={loading}
            inputValue={inputValue}
            onInputChange={async (event, value) => {
                setInputValue(value);
                await handleSearch(value);
                if (searchResults.length === 0 && allowCustomInput) {
                    onChange({ label: value, fullId: value, other: true });
                }
            }}
            onChange={(event, value, reason) => {
                onChange(value);
            }}
            filterOptions={(options) => options}
            groupBy={(option) => option.type}
            PopperComponent={CustomPopper}
            renderInput={(params) => (
                <TextField
                    {...params}
                    sx={{
                        backgroundColor: '#fff',
                        borderRadius: 2,
                        '.MuiInputBase-input': { py: 1.8, fontSize: '1rem' },
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#16B364' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#16B364',
                            boxShadow: '0 0 0 3px rgba(22,179,100,.2)'
                        }
                    }}
                    fullWidth
                    variant="filled"
                    label="Service"
                    placeholder={`${randomExample}`}
                    color="success"
                    focused
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <>
                                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </>
                        ),
                    }}
                />
            )}
            noOptionsText={
                <Alert
                    severity="info"
                    onClick={() => onNoOptionClick(inputValue)}
                    sx={{
                        cursor: 'pointer',
                        '&:hover': {
                            backgroundColor: 'action.hover',
                            transition: 'background-color 0.2s ease'
                        }
                    }}
                >
                    There is no suitable option? - we will help you, click here
                </Alert>
            }
        />
    );
}