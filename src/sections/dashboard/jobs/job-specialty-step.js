import {useCallback, useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import {Button, Card, Radio, Stack, SvgIcon, TextField, Typography} from '@mui/material';
import {useKindOfServices, useKindOfServicesMap} from "../../../hooks/use-kind-of-services";
import Grid from '@mui/material/Unstable_Grid2';
import {useDispatch, useSelector} from "../../../store";
import {thunks} from "../../../thunks/dictionary";

const useSpecialties = (categoryId) => {
    if (categoryId === "new")
        return [];

    const dispatch = useDispatch();
    const {specialties} = useSelector((state) => state.dictionary);

    useEffect(() => {
            dispatch(thunks.getCategories({}));
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []);
    return specialties.idsByCategoryId[categoryId];
};
export const JobSpecialtyStep = (props) => {
    const {onBack, onNext, job, ...other} = props;
    const [specialty, setSpecialty] = useState(job.specialty);
    const [otherSpecialty, setOtherSpecialty] = useState(job.otherSpecialty);
    const categoryOptions = useSpecialties(job.category);

    const handleCategoryChange = useCallback((category) => {
        setSpecialty(category);
    }, []);
    const handleOnNext = () => {
        job.specialty = job.category === "new" ? "new" : specialty;
        job.otherSpecialty = otherSpecialty;
        onNext(job);
    }

    return (
        <Stack
            spacing={3}
            {...other}>
            <Stack
                alignItems="center"
                direction="row"
                flexWrap="wrap"
                spacing={1}
            >
                {job.category !== "new" && categoryOptions.map((option) => (
                    <Card
                        key={option.id}
                        sx={{
                            cursor: 'pointer',
                            mb: "8px !important",
                            mr: "8px !important",
                            p: 1,
                            ...(specialty === option.id && {
                                backgroundColor: 'primary.alpha12',
                                boxShadow: (theme) => `${theme.palette.primary.main} 0 0 0 1px`
                            })
                        }}
                        onClick={() => handleCategoryChange(option.id)}
                        variant="outlined"
                    >
                        <Typography variant="subtitle1">
                            {option.label}
                        </Typography>
                    </Card>
                ))}
                {job.category === "new" && (
                    <TextField
                        error={!otherSpecialty}
                        fullWidth
                        helperText={!otherSpecialty}
                        label="Other specialty"
                        onChange={(e) => {
                            setOtherSpecialty(e.target.value)
                        }}
                        defaultValue={otherSpecialty}
                    />
                )}
            </Stack>
            <Stack
                alignItems="center"
                direction="row"
                spacing={2}
            >
                <Button
                    endIcon={(
                        <SvgIcon>
                            <ArrowRightIcon/>
                        </SvgIcon>
                    )}
                    onClick={handleOnNext}
                    variant="contained"
                >
                    Continue
                </Button>
                <Button
                    color="inherit"
                    onClick={onBack}
                >
                    Back
                </Button>
            </Stack>
        </Stack>
    );
};

JobSpecialtyStep.propTypes = {
    onBack: PropTypes.func,
    onNext: PropTypes.func
};
