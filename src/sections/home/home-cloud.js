import {
    Box,
    Card,
    CardMedia,
    CardContent,
    Chip,
    Typography,
    Rating,
    Grid,
    CircularProgress,
    useMediaQuery,
    Container
} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import {useEffect, useState} from 'react';
import SwipeableViews from 'react-swipeable-views';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

import {roles} from 'src/roles';
import {profileApi} from 'src/api/profile';
import {RouterLink} from 'src/components/router-link';
import {paths} from 'src/paths';
import useDictionary from 'src/hooks/use-dictionaries';
import {getSiteDuration} from 'src/utils/date-locale';
import HorizontalPreviewCard from "src/components/profiles/previewCards/horizontal-preview-card";
import {mapWorkerToPreviewData} from "src/utils/preview-card-utils";
import VerticalPreviewCard from "src/components/profiles/previewCards/vertical-preview-card";
import SpecialistsCloud from "src/sections/home/specialist-cloud";


export const HomeCloud = () => {
    const {specialties} = useDictionary();
    const [bestReviews, setBestReviews] = useState(null);
    const [recent, setRecent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);

                const workers = await profileApi.getProfilesWithReviews(roles.WORKER, 12);

                workers.forEach((w) => {
                    if (w.specialties) {
                        w.specialties = w.specialties.map((id) => specialties.byId[id]);
                    }
                });

                const best = [...workers]
                    .filter((w) => w.reviewCount > 0)
                    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                    .slice(0, 6);

                const recentAdded = [...workers]
                    .sort((a, b) => {
                        const aDate = a.registrationAt?.toDate?.() || new Date(0);
                        const bDate = b.registrationAt?.toDate?.() || new Date(0);
                        return bDate - aDate;
                    })
                    .slice(0, 6);

                setBestReviews(best);
                setRecent(recentAdded);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        if (specialties) load();
    }, [specialties]);

    return (
        <Box sx={{py: {xs: 4, md: 10}}}>
            <Container maxWidth="lg">
                {loading ? (
                    <Box sx={{display: 'flex', justifyContent: 'center', py: 10}}>
                        <CircularProgress/>
                    </Box>
                ) : (
                    <>
                        <SpecialistsCloud specialists={recent}/>
                    </>
                )}
            </Container>
        </Box>
    );
};