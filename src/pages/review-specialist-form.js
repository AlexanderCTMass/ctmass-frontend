import {
    Avatar,
    Box,
    Button,
    Chip, CircularProgress,
    Container,
    Divider, ImageList,
    List,
    ListItem,
    ListItemIcon,
    Stack,
    Typography,
    useMediaQuery
} from '@mui/material';
import {Seo} from 'src/components/seo';
import {usePageView} from 'src/hooks/use-page-view';
import ReviewForm from "src/components/review-specialist-form";
import {Check, Diamond, Lock, Star} from 'mdi-material-ui';
import {useParams} from "react-router";
import {useCallback, useEffect, useState} from "react";
import {profileApi} from "src/api/profile";
import {INFO} from "src/libs/log";
import Fancybox from "src/components/myfancy/myfancybox";
import {Preview} from "src/components/myfancy/image-preview";
import * as React from "react";
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
import {profileService} from "src/service/profile-service";
import {extendedProfileApi} from "src/pages/cabinet/profiles/my/data/extendedProfileApi";
import pluralize from "pluralize";
import {paths} from "src/paths";
import {useNavigate} from "react-router-dom";
import Confetti from "react-confetti";
import {useWindowSize} from "react-use";
import {useAuth} from "src/hooks/use-auth";

const useProject = (specialistId) => {
    const [specialist, setSpecialist] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);

        const fetchData = async () => {
            const user = await profileApi.get(specialistId);
            const reviews = await extendedProfileApi.getReviews(specialistId);
            setSpecialist(profileService.updateRatingInfo(user, reviews));

            setLoading(false);
        }

        if (specialistId) {
            fetchData();
        }
    }, [specialistId]);

    return {specialist, loading};
}

const Page = () => {
    usePageView();
    const smUp = useMediaQuery((theme) => theme.breakpoints.up('sm'));
    let {specialistId} = useParams();
    const {user} = useAuth();
    const [showConfetti, setShowConfetti] = useState(false);
    const navigate = useNavigate();
    const {width, height} = useWindowSize();

    const {specialist, loading} = useProject(specialistId);

    // Преимущества платформы
    const platformBenefits = [
        {icon: <Check/>, text: "All specialists are verified with document checks"},
        {icon: <Star/>, text: "Ratings and reviews from real clients"},
        {icon: <Lock/>, text: "Secure transactions with quality guarantees"},
        {icon: <Diamond/>, text: "Premium support for all users"}
    ];

    const handleSubmit = useCallback(() => {
        window.scrollTo({top: 200, behavior: 'smooth'});
        setShowConfetti(true);

        // Скрываем конфетти через 3 секунды и делаем переход
        setTimeout(() => {
            setShowConfetti(false);
            navigate(paths.index, {replace: true});
        }, 4000);
    }, [navigate]);

    if (loading) {
        return (<CircularProgress/>)
    }

    if (user) {
        if (user.id === specialistId) {
            navigate(paths.index, {replace: true});
            return (<CircularProgress/>)
        }
    }

    return (
        <>
            {showConfetti && (
                <Confetti
                    width={width}
                    height={height}
                    recycle={false}
                    numberOfPieces={900}
                    gravity={0.9}
                />
            )}

            <Seo title="Review Form"/>
            <Container maxWidth="lg">
                <Box
                    component="main"
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            lg: '2fr 3fr',
                            xs: 'repeat(1, 1fr)'
                        },
                        flexGrow: 1,
                        pb: '40px',
                        pt: '120px',
                    }}
                >
                    {/* Левая колонка - информация */}
                    <Box
                        sx={{
                            backgroundColor: (theme) => theme.palette.mode === 'dark'
                                ? 'neutral.800'
                                : 'neutral.50',
                            p: 4
                        }}
                    >
                        {/* Блок специалиста */}
                        <Stack direction="row" spacing={2} alignItems="center" mb={4}>
                            <Avatar
                                src={specialist.avatar}
                                sx={{width: 80, height: 80}}
                            />
                            <Box>
                                <Typography variant="h5">{specialist.businessName}</Typography>
                                {/*<Typography color="text.secondary">{specialist.role}</Typography>*/}
                                <Stack direction="row" spacing={1} mt={1} alignItems="center">
                                    <Chip
                                        icon={<Star fontSize="small"/>}
                                        label={specialist.rating.toFixed(1)}
                                        size="small"
                                    />
                                    <Chip
                                        label={specialist.reviewCount + " " + pluralize('review', specialist.reviewCount)}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Stack>
                            </Box>
                        </Stack>

                        <Divider sx={{my: 3}}/>

                        {/* Блок преимуществ */}
                        <Box>
                            <Typography variant="h6" gutterBottom>Why join our platform?</Typography>
                            <List dense>
                                {platformBenefits.map((item, index) => (
                                    <ListItem key={index} sx={{px: 0}}>
                                        <ListItemIcon sx={{minWidth: 32, color: 'primary.main'}}>
                                            {item.icon}
                                        </ListItemIcon>
                                        <Typography variant="body2">{item.text}</Typography>
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    </Box>

                    {/* Правая колонка - форма */}
                    <Box
                        sx={{
                            backgroundColor: 'background.paper',
                            px: smUp ? 6 : 1,
                            py: smUp ? 15 : 5
                        }}
                    >

                        <ReviewForm contractor={specialist} onSubmit={handleSubmit}/>

                    </Box>
                </Box>
            </Container>
        </>
    );
};

export default Page;