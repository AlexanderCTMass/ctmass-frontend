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
import {useMemo} from 'react';
import SwipeableViews from 'react-swipeable-views';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

import {RouterLink} from 'src/components/router-link';
import {paths} from 'src/paths';
import useDictionary from 'src/hooks/use-dictionaries';
import {useWorkerShowcase} from 'src/queries/use-worker-profiles';
import {getSiteDuration} from 'src/utils/date-locale';
import HorizontalPreviewCard from "src/components/profiles/previewCards/horizontal-preview-card";
import {mapWorkerToPreviewData} from "src/utils/preview-card-utils";
import VerticalPreviewCard from "src/components/profiles/previewCards/vertical-preview-card";
import SpecialistsCloud from "src/sections/home/specialist-cloud";


export const HomeCloud = () => {
    const {specialties} = useDictionary();
    const {data: workers = [], isLoading: loading} = useWorkerShowcase(12);

    const recent = useMemo(() => {
        const mapped = workers.map((w) => ({
            ...w,
            specialties: w.specialties ? w.specialties.map((id) => specialties.byId[id]) : w.specialties
        }));

        return [...mapped]
            .sort((a, b) => {
                const aDate = a.registrationAt?.toDate?.() || new Date(0);
                const bDate = b.registrationAt?.toDate?.() || new Date(0);
                return bDate - aDate;
            })
            .slice(0, 6);
    }, [workers, specialties]);

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