import {
    Box,
    Button,
    Container,
    TextField,
    OutlinedInput,
    IconButton,
    InputAdornment,
    Paper,
    Link,
    SvgIcon,
    Unstable_Grid2 as Grid,
    Stack,
    Typography,
    Divider,
    CardActions,
    Card,
    Avatar,
    Drawer,
    useMediaQuery,
    ButtonBase
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Slider from 'react-slick';
import PropTypes from 'prop-types';
import CloseIcon from '@mui/icons-material/Close';
import SearchMdIcon from '@untitled-ui/icons-react/build/esm/SearchMd';
import ArrowRightIcon from "@untitled-ui/icons-react/build/esm/ArrowRight";
import { useKindOfServices, useKindOfServicesMap } from "../../hooks/use-kind-of-services";
import { RouterLink } from "../../components/router-link";
import { SeverityPill } from "../../components/severity-pill";
import RefreshCcw02Icon from "@untitled-ui/icons-react/build/esm/RefreshCcw02";
import CottageIcon from '@mui/icons-material/Cottage';
import ConstructionIcon from '@mui/icons-material/Construction';
import * as React from "react";
import { useEffect, useState } from "react";
import FeedbackIcon from "@mui/icons-material/Feedback";
import { useDispatch, useSelector } from 'src/store';
import { thunks } from 'src/thunks/dictionary';
import { useAuth } from "../../hooks/use-auth";
import { paths } from 'src/paths';


const useSpecialtiesForMainPage = () => {
    const dispatch = useDispatch();
    const { categories, specialties } = useSelector((state) => state.dictionary);

    useEffect(() => {
        dispatch(thunks.getDictionary());
    },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []);

    return specialties.allIds
        .map((id) => {
            const specialty = specialties.byId[id];
            let category = categories.byId[specialty.parent];
            return { ...specialty, parentName: category ? category.label : '' };
        })
        .filter(specialty => specialty.img && specialty.accepted);
};

const CustomArrow = ({ direction, onClick, theme }) => {
    return (
        <IconButton
            onClick={onClick}
            sx={{
                position: 'absolute', // Ensure the arrows are positioned relative to the slider
                top: '50%', // Center the arrows vertically
                transform: 'translateY(-50%)', // Correct vertical alignment
                [direction === 'next' ? 'right' : 'left']: [direction === 'next' ? '-50px' : '-40px'], // Position arrows on left and right
                color: theme.palette.primary.main,
                '&:hover': {
                    color: theme.palette.primary.dark
                },
                zIndex: 10 // Ensure arrows appear above the slider
            }}
        >
            {direction === "next" ? <ArrowRightIcon /> : <ArrowRightIcon style={{ transform: 'rotate(180deg)' }} />}
        </IconButton>
    );
};


export const HomeSpecSlider = () => {
    const theme = useTheme();
    const up1024 = useMediaQuery((theme) => theme.breakpoints.up(1024));
    const downSm = useMediaQuery((theme) => theme.breakpoints.down('sm'));

    const specialties = useSpecialtiesForMainPage();

    const sliderSettings = {
        arrows: false,
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: (!downSm ? 3 : 2),
        slidesToScroll: 2,
        adaptiveHeight: true,
        autoplay: true,
        lazyLoad: true,
        swipe: downSm,
        draggable: true
    };


    return (
        <Box sx={{
            pb: '40px'
        }}>
            <Container maxWidth="lg" sx={{ py: 6 }}>
                <Slider {...sliderSettings}
                    nextArrow={<CustomArrow direction="next" theme={theme} />}
                    prevArrow={<CustomArrow direction="prev" theme={theme} />}
                >
                    {specialties.map((spec) => (
                        <div key={spec.id}>
                            <Link
                                component={RouterLink}
                                href={paths.services.service.replace(":specialtyId", spec.id)}
                                underline="none"
                            >
                                <Card
                                    sx={{ ml: 2 }}
                                >
                                    <Stack
                                        alignItems="center"
                                        direction={{
                                            xs: 'column',
                                            sm: 'row'
                                        }}
                                        spacing={3}
                                        sx={{
                                            px: (downSm ? 1 : 4),
                                            py: 3,
                                            minHeight: 117,
                                            backgroundImage: `linear-gradient(to right, rgba(255,255,255,1) 56%, rgba(255,255,255,0)), url(${spec.img})`,
                                            backgroundPosition: 'right',
                                            backgroundSize: 'contain',
                                            backgroundRepeat: 'no-repeat',
                                            ':hover': {
                                                boxShadow: (theme) => `${theme.palette.primary.main} 0 0 5px`,
                                                cursor: 'pointer'
                                            },
                                        }}
                                    >
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography
                                                color="text.primary"
                                                variant={up1024 ? "h5" : "h6"}
                                                gutterBottom
                                            >
                                                {spec.label}
                                            </Typography>
                                            <Typography
                                                color="text.secondary"
                                                variant="body2"
                                            >
                                                {spec.parentName}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Card>
                            </Link>
                        </div>
                    ))}
                </Slider>
            </Container>
        </Box>
    );
};
