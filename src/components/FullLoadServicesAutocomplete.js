import { Popper, Alert } from "@mui/material";
import React, { useEffect, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import { collection, collectionGroup, getDocs } from "firebase/firestore";
import { firestore } from "src/libs/firebase";

export default function FullLoadServicesAutocomplete({
    externalSearchText,
    onChange = () => {
    },
    onInputChange = () => {
    },
    onNoOptionClick = () => {
    }, // Новый обработчик
    allowCustomInput = true
}) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [randomExample, setRandomExample] = useState("");

    // Загрузка всех данных при инициализации
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const specialtiesSnapshot = await getDocs(collectionGroup(firestore, "specialties"));
                const servicesSnapshot = await getDocs(collectionGroup(firestore, "services"));
                const userSpecialtiesSnapshot = await getDocs(collection(firestore, "userSpecialties"));

                const allData = [];
                const serviceExamples = [];

                const userSpecialtiesData = userSpecialtiesSnapshot.docs.map(doc => doc.data().specialty);

                specialtiesSnapshot.forEach((doc) => {
                    const data = doc.data();
                    const parentCategory = doc.ref.parent.parent?.id || null;
                    if (userSpecialtiesData.includes(doc.id)) {
                        allData.push({
                            id: doc.id,
                            label: data.label,
                            type: "Specialties",
                            parentCategory: parentCategory,
                            fullId: doc.ref.path,
                        });
                    }
                });

                // Обработка services
                servicesSnapshot.forEach((doc) => {
                    const data = doc.data();
                    const parentSpecialty = doc.ref.parent.parent?.id || null;
                    const parentCategory = doc.ref.parent.parent?.parent?.parent?.id || null;
                    if (userSpecialtiesData.includes(parentSpecialty)) {
                        allData.push({
                            id: doc.id,
                            label: data.label,
                            type: "Services",
                            parentSpecialty: parentSpecialty,
                            parentCategory: parentCategory,
                            fullId: doc.ref.path,
                            keywords: data.keywords || [],
                        });

                        // Добавляем в массив примеров
                        serviceExamples.push(data.label);

                        data.keywords?.forEach((key) => {
                            allData.push({
                                id: doc.id,
                                label: key,
                                type: "Services",
                                parentSpecialty: parentSpecialty,
                                parentCategory: parentCategory,
                                fullId: doc.ref.path
                            });
                        })
                    }
                });

                setData(allData);

                // Устанавливаем случайный пример из сервисов
                if (serviceExamples.length > 0) {
                    const randomIndex = Math.floor(Math.random() * serviceExamples.length);
                    setRandomExample(serviceExamples[randomIndex]);
                }
            } catch (error) {
                console.error("Error load data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

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
                        '.MuiInputBase-input': {
                            fontSize: '1.25rem',
                            pt: "23px",
                            pb: "9px",
                        },
                    }}
                    fullWidth
                    variant="filled"
                    label="Service or Specialist"
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