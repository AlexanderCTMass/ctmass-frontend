import React, { useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import { collectionGroup, query, where, getDocs } from "firebase/firestore";
import { firestore } from "src/libs/firebase";


// Функция для поиска
const searchFirestore = async (queryText) => {
    console.log("Start search for:", queryText);

    const lowerQuery = queryText.toLowerCase();
    const results = [];

    try {
        // Поиск по подколлекции specialties
        const specialtiesQuery = query(
            collectionGroup(firestore, "specialties"),
            where("label", ">=", lowerQuery),
            where("label", "<=", lowerQuery + "\uf8ff")
        );

        const specialtiesSnapshot = await getDocs(specialtiesQuery);

        specialtiesSnapshot.forEach((doc) => {
            const data = doc.data();
            results.push({
                id: doc.id,
                label: data.label,
                type: "specialty",
                parentCategory: doc.ref.parent.parent?.id || null, // ID категории, к которой относится specialty
            });
        });

        // Поиск по подколлекции services
        const servicesQuery = query(
            collectionGroup(firestore, "services"),
            where("label", ">=", lowerQuery),
            where("label", "<=", lowerQuery + "\uf8ff")
        );

        const servicesSnapshot = await getDocs(servicesQuery);

        servicesSnapshot.forEach((doc) => {
            const data = doc.data();
            const isKeywordMatch =
                data.keywords &&
                data.keywords.some((keyword) => keyword.toLowerCase().includes(lowerQuery));

            if (isKeywordMatch || data.label.toLowerCase().includes(lowerQuery)) {
                results.push({
                    id: doc.id,
                    label: data.label,
                    type: "service",
                    parentSpecialty: doc.ref.parent.parent?.id || null, // ID specialty, к которому относится service
                    parentCategory: doc.ref.parent.parent?.parent?.parent?.id || null, // ID категории через два уровня
                });
            }
        });

        console.log("Search completed:", results);
    } catch (error) {
        console.error("Error during Firestore search:", error);
    }

    return results;
};


export default function ServicesAutocomplete() {
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (query) => {
        if (!query || query.length < 3) {
            setSearchResults([]);
            setLoading(false);
            return;
        }

        setLoading(true); // Включаем индикатор загрузки
        try {
            const results = await searchFirestore(query);
            setSearchResults(results);
        } catch (error) {
            console.error("Error loading:", error);
        } finally {
            setLoading(false); // Выключаем индикатор загрузки
        }
    };

    return (
        <Autocomplete
            autoComplete
            open={!loading && searchResults.length > 0}
            freeSolo
            options={searchResults}
            getOptionLabel={(option) => `${option.label} (${option.type})`}
            loading={loading} // Подключаем индикатор загрузки
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
                    onChange={(e) => handleSearch(e.target.value)}
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
            noOptionsText={loading ? "Loading..." : "Not yet"}
        />
    );
}
