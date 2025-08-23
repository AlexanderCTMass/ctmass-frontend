import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import { Button, Card, Radio, Stack, SvgIcon, TextField, Typography } from '@mui/material';
import { useDispatch, useSelector } from "src/store";
import { thunks } from "src/thunks/dictionary";

const useCategories = () => {
    const dispatch = useDispatch();
    const { categories } = useSelector((state) => state.dictionary);

    useEffect(() => {
        dispatch(thunks.getCategories({}));
    },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []);

    return categories.allIds.map((id) => categories.byId[id]).filter(cat => cat.childs && cat.childs.length > 0);
};

export const JobCategoryStep = (props) => {
    const { onBack, onNext, job, ...other } = props;
    const [category, setCategory] = useState(job.category);
    const [otherCategory, setOtherCategory] = useState(job.otherCategory || null);
    const categoryOptions = useCategories();

    const handleOnNext = () => {
        if (job.category !== category) {
            job.specialty = null;
            job.otherSpecialty = null;
        }
        job.category = category;
        job.otherCategory = otherCategory;

        onNext(job);
    };


    return (
        <Stack
            spacing={3}
            {...other}>
            <div>
                <Typography variant="h6">
                    I’m looking for...
                </Typography>
            </div>
            <Stack spacing={2}>
                {categoryOptions.map((option) => (
                    <Card
                        key={option.id}
                        sx={{
                            alignItems: 'center',
                            cursor: 'pointer',
                            display: 'flex',
                            p: 2,
                            ...(category === option.id && {
                                backgroundColor: 'primary.alpha12',
                                boxShadow: (theme) => `${theme.palette.primary.main} 0 0 0 1px`
                            })
                        }}
                        onClick={() => {
                            setCategory(option.id);
                        }}
                        variant="outlined"
                    >
                        <Stack
                            direction="row"
                            spacing={2}
                            alignItems={"center"}
                        >
                            <Radio
                                checked={category === option.id}
                                color="primary"
                            />
                            <div>
                                <Typography variant="subtitle1">
                                    {option.label}
                                </Typography>
                            </div>
                        </Stack>
                    </Card>
                ))}

                <Card
                    key={"new"}
                    sx={{
                        alignItems: 'center',
                        cursor: 'pointer',
                        display: 'flex',
                        p: 2,
                        ...(category === "new" && {
                            backgroundColor: 'primary.alpha12',
                            boxShadow: (theme) => `${theme.palette.primary.main} 0 0 0 1px`
                        })
                    }}
                    onClick={() => {
                        setCategory("new");
                    }}
                    variant="outlined"
                >
                    <Stack
                        direction="row"
                        spacing={2}
                        alignItems={"center"}
                    >
                        <Radio
                            checked={category === "new"}
                            color="primary"
                        />
                        <div>
                            <TextField
                                error={category === "new" && !otherCategory}
                                fullWidth
                                helperText={category === "new" && !otherCategory}
                                label="Other category"
                                onChange={(e) => {
                                    setOtherCategory(e.target.value)
                                }}
                                defaultValue={otherCategory}
                            />
                        </div>
                    </Stack>
                </Card>
            </Stack>
            <Stack
                alignItems="center"
                direction="row"
                spacing={2}
            >
                <Button
                    endIcon={(
                        <SvgIcon>
                            <ArrowRightIcon />
                        </SvgIcon>
                    )}
                    onClick={handleOnNext}
                    variant="contained"
                    disabled={!category || (category === "new" && !otherCategory)}
                >
                    Continue
                </Button>
            </Stack>
        </Stack>
    );
};

JobCategoryStep.propTypes = {
    onBack: PropTypes.func,
    onNext: PropTypes.func
};
