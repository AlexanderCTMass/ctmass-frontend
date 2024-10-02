import {useCallback, useState} from 'react';
import PropTypes from 'prop-types';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import {Button, Card, Radio, Stack, SvgIcon, Typography} from '@mui/material';

const categoryOptions = [
    {
        description: 'Best for small projects or task',
        title: 'Performer for one task',
        value: 'task'
    },
    {
        description: 'Limited-time projects with highly experienced individuals',
        title: 'Contractor',
        value: 'project'
    }
];

export const JobCategoryStep = (props) => {
    const {onBack, onNext, job, ...other} = props;
    const [category, setCategory] = useState(job.category);

    const handleCategoryChange = useCallback((category) => {
        setCategory(category);
    }, []);

    const handleOnNext = useCallback(() => {
        onNext({
            category: category
        })
    }, []);

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
                        key={option.value}
                        sx={{
                            alignItems: 'center',
                            cursor: 'pointer',
                            display: 'flex',
                            p: 2,
                            ...(category === option.value && {
                                backgroundColor: 'primary.alpha12',
                                boxShadow: (theme) => `${theme.palette.primary.main} 0 0 0 1px`
                            })
                        }}
                        onClick={() => handleCategoryChange(option.value)}
                        variant="outlined"
                    >
                        <Stack
                            direction="row"
                            spacing={2}
                        >
                            <Radio
                                checked={category === option.value}
                                color="primary"
                            />
                            <div>
                                <Typography variant="subtitle1">
                                    {option.title}
                                </Typography>
                                <Typography
                                    color="text.secondary"
                                    variant="body2"
                                >
                                    {option.description}
                                </Typography>
                            </div>
                        </Stack>
                    </Card>
                ))}
            </Stack>
            <div>
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
            </div>
        </Stack>
    );
};

JobCategoryStep.propTypes = {
    onBack: PropTypes.func,
    onNext: PropTypes.func
};
