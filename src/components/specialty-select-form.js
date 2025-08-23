import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
    Autocomplete, Avatar,
    Box,
    Button, Checkbox,
    Chip, CircularProgress,
    Dialog,
    Divider, Link, ListItem,
    Stack,
    TextField,
    Typography,
    useMediaQuery,
} from "@mui/material";
import { collectionGroup, getDocs, query, where } from "firebase/firestore";
import { dictionaryApi } from "src/api/dictionary";
import { firestore } from "src/libs/firebase";
import useDictionary from "src/hooks/use-dictionaries";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export const SpecialtySelectForm = (props) => {
    const {
        open,
        onClose,
        onChange,
        selectedSpecialties = [],
        onSpecialtyChange
    } = props;

    const [autoopen, setAutoopen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [allSpecialties, setAllSpecialties] = useState([]);
    const { addSpecialty } = useDictionary();

    const [selected, setSelected] = useState();
    const [another, setAnother] = useState();
    const mdUp = useMediaQuery((theme) => theme.breakpoints.up("md"));

    const handleOpen = () => {
        setAutoopen(true);
        (async () => {
            setLoading(true);
            const specialtiesQuery = query(
                collectionGroup(firestore, "specialties"),
                ...(selectedSpecialties.length > 0 ? [where("label", "not-in", selectedSpecialties.filter(spec => spec).map(spec => spec.label))] : []));
            const querySnapshot = await getDocs(specialtiesQuery);
            const results = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

            setAllSpecialties(results);
            setLoading(false);
        })();

    };

    const handleAutoClose = () => {
        setAutoopen(false);
        setAllSpecialties([]);
        setLoading(false);
        setAnother(null);
    };

    const handleClose = () => {
        setAutoopen(false);
        setAllSpecialties([]);
        setLoading(false);
        setAnother(null);
        onClose();
    };


    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            fullHeight
            fullScreen={!mdUp}
            maxWidth="sm"
        >
            <Box sx={{ p: 3, pb: 1 }}>
                <Typography align="center" variant="h5">
                    Select service categories
                </Typography>
            </Box>
            <Divider />
            <Box sx={{ p: 3 }}>
                {!another &&
                    <>
                        <Autocomplete
                            open={autoopen}
                            onOpen={handleOpen}
                            onClose={handleAutoClose}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            getOptionLabel={(option) => option && option.label}
                            options={allSpecialties}
                            loading={loading}
                            onChange={(event, value) => {
                                setSelected(value);
                                if (onSpecialtyChange) {
                                    onSpecialtyChange(value);
                                    onClose();
                                }
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Find specialties"
                                    slotProps={{
                                        input: {
                                            ...params.InputProps,
                                            endAdornment: (
                                                <React.Fragment>
                                                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                                    {params.InputProps.endAdornment}
                                                </React.Fragment>
                                            ),
                                        },
                                    }}
                                />
                            )}
                        />

                        <Stack sx={{ my: 2 }}
                            alignItems="center"
                            direction="row"
                            justifyContent="start">
                            <Button variant={"text"} onClick={() => {
                                setAnother({});
                            }}>
                                Not in the list? Suggest your own!
                            </Button>
                        </Stack>
                    </>}
                {another &&
                    <TextField
                        fullWidth
                        value={another.label}
                        onChange={(event) => {
                            setAnother({ label: event.target.value, parent: "other" })
                        }}
                        label="Specialty title"
                    />}
                <Stack
                    alignItems="center"
                    direction="row"
                    justifyContent="end"
                    spacing={1}
                    sx={{ pt: 4 }}
                >

                    <Button color="inherit" onClick={handleClose}>
                        {onSpecialtyChange && !another ? "Close" : "Cancel"}
                    </Button>
                    {another && <Button color="success" variant={"outlined"} onClick={() => {
                        dictionaryApi.addSpecialty(another).then(value => {
                            addSpecialty(value);
                            if (onSpecialtyChange) {
                                onSpecialtyChange(value);
                            } else if (onChange) {
                                onChange(value);
                            }
                            handleClose();
                        })
                    }}>
                        {"Confirm"}
                    </Button>}
                    {Boolean(onSpecialtyChange || another) || (
                        <Button
                            disabled={!selected}
                            variant="contained"
                            onClick={() => {
                                if (onChange) onChange(selected);
                            }}
                        >
                            Confirm
                        </Button>
                    )}
                </Stack>
            </Box>
        </Dialog>
    );
};

SpecialtySelectForm.propTypes = {
    open: PropTypes.bool.isRequired,
    selectedSpecialties: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};
