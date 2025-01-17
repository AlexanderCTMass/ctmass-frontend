import {Popper} from "@mui/material";
import React, {useEffect, useState} from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import {collectionGroup, getDocs} from "firebase/firestore";
import {firestore} from "src/libs/firebase"; // Импорт Firestore instance

export default function FullLoadServicesAutocomplete({ externalSearchText }) {
    const [data, setData] = useState([]); // Справочник с данными
    const [loading, setLoading] = useState(false); // Загрузка данных
    const [searchResults, setSearchResults] = useState([]);
    const [inputValue, setInputValue] = useState("");

    // Загрузка всех данных при инициализации
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const specialtiesSnapshot = await getDocs(collectionGroup(firestore, "specialties"));
                const servicesSnapshot = await getDocs(collectionGroup(firestore, "services"));

                const allData = [];

                // Обработка specialties
                specialtiesSnapshot.forEach((doc) => {
                    const data = doc.data();
                    allData.push({
                        id: doc.id,
                        label: data.label,
                        type: "Specialties",
                        parentCategory: doc.ref.parent.parent?.id || null,
                    });
                });

                // Обработка services
                servicesSnapshot.forEach((doc) => {
                    const data = doc.data();
                    allData.push({
                        id: doc.id,
                        label: data.label,
                        type: "Services",
                        parentSpecialty: doc.ref.parent.parent?.id || null,
                        parentCategory: doc.ref.parent.parent?.parent?.parent?.id || null,
                        keywords: data.keywords || [],
                    });
                });

                setData(allData); // Сохраняем данные в памяти
            } catch (error) {
                console.error("Error load data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Локальный поиск
    const handleSearch = (query) => {
        if (!query) {
            setSearchResults([]);
            return;
        }

        const lowerQuery = query.toLowerCase();
        const results = data.filter(
            (item) =>
                item.label.toLowerCase().includes(lowerQuery) ||
                (item.keywords && item.keywords.some((keyword) => keyword.toLowerCase().includes(lowerQuery)))
        );

        setSearchResults(results);
    };

    useEffect(() => {
        if (externalSearchText !== undefined) {
            setInputValue(externalSearchText);
            handleSearch(externalSearchText);
        }
    }, [externalSearchText]);

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
            freeSolo // Позволяем использовать пользовательский ввод
            loading={loading} // Отображаем индикатор при загрузке данных
            inputValue={inputValue}
            onInputChange={(event, value) => {
                setInputValue(value);
                handleSearch(value); // Выполняем локальный поиск
            }}
            groupBy={(option) => option.type} // Группировка по типу
            PopperComponent={CustomPopper}
            renderInput={(params) => (
                <TextField
                    {...params}
                    sx={{
                        bgcolor: "white",
                        '.MuiInputBase-input': {
                            fontSize: '1.25rem',
                            pt: "23px",
                            pb: "9px",
                        },
                    }}
                    fullWidth
                    variant="filled"
                    label="Service or Specialist"
                    color="success"
                    focused
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <>
                                {loading ? <CircularProgress color="inherit" size={20}/> : null}
                                {params.InputProps.endAdornment}
                            </>
                        ),
                    }}
                />
            )}
            noOptionsText={loading ? "Loading..." : "Not yet"}
        />
    );
}
