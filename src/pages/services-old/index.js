import {
    Box,
    Card,
    CircularProgress,
    Container,
    Divider,
    Link,
    Stack,
    Typography,
    Unstable_Grid2 as Grid
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { RouterLink } from 'src/components/router-link';
import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { paths } from 'src/paths';
import useDictionary from "src/hooks/use-dictionaries";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "src/libs/firebase";
import { INFO } from "src/libs/log";

const useSpecialtiesData = () => {
    const { categories, specialties } = useDictionary();

    const [data, setData] = useState({
        countOfSpecialists: 0,
        filteredSpecialties: [],
        categories: [],
        isLoading: true,
        error: null
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!specialties || !categories) return;

                const userSpecialtiesSnapshot = await getDocs(collection(firestore, "userSpecialties"));
                const userSpecialtiesData = userSpecialtiesSnapshot.docs.map(doc => doc.data().specialty);

                INFO("userSpecialtiesData", userSpecialtiesData);

                const filteredSpecialties = specialties.allIds
                    .filter(id => userSpecialtiesData?.includes(id))
                    .map((id) => {
                        const specialty = specialties.byId[id];
                        return {
                            label: specialty.label,
                            id: specialty.id,
                            fullId: specialty.path,
                            count: userSpecialtiesData.filter(specId => specId === specialty.id).length || 0
                        };
                    });
                INFO("filteredSpecialties", filteredSpecialties);

                setData({
                    countOfSpecialists: userSpecialtiesData.length,
                    filteredSpecialties,
                    categories: categories.allIds.map(id => ({
                        ...categories.byId[id],
                        childs: filteredSpecialties.filter(filteredSpec => filteredSpec.fullId.includes(id))
                    })),
                    isLoading: false,
                    error: null
                });

            } catch (error) {
                console.error("Error fetching specialties:", error);
                setData(prev => ({
                    ...prev,
                    isLoading: false,
                    error: error.message
                }));
            }
        };

        fetchData();
    }, [specialties, categories]);

    return data;
};

const Page = () => {
    const theme = useTheme();
    const {
        countOfSpecialists,
        filteredSpecialties,
        categories,
        isLoading,
        error
    } = useSpecialtiesData();

    usePageView();

    if (isLoading || !categories) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography color="error">Error loading data: {error}</Typography>
            </Box>
        );
    }

    return (
        <>
            <Seo title="Services" />
            <Box
                sx={{
                    backgroundColor: theme.palette.mode === 'dark' ? 'neutral.800' : 'neutral.50',
                    pb: '40px',
                    pt: '100px'
                }}
            >
                <Container maxWidth="lg">
                    <Stack spacing={1}>
                        <Typography variant="h1">Services</Typography>
                        <Typography color="text.secondary" variant="body1">
                            Catalog of services from {countOfSpecialists} specialists
                        </Typography>
                    </Stack>
                </Container>
            </Box>
            <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
                <Container maxWidth="lg">
                    <Stack divider={<Divider />} spacing={4}>
                        {categories.map((section) => {
                            return (
                                <Grid container spacing={4} key={section.id}>
                                    <Grid xs={12} lg={3}>
                                        <Typography sx={{ fontWeight: 600 }} variant="h5">
                                            {section.label}
                                        </Typography>
                                    </Grid>
                                    <Grid xs={12} lg={9}>
                                        <Grid container spacing={3}>
                                            {section.childs.map((spec) => (
                                                <Grid key={spec.id} xs={12} sm={6} lg={4}>
                                                    <Link
                                                        color="text.primary"
                                                        component={RouterLink}
                                                        href={paths.services.service.replace(":specialtyId", spec.id)}
                                                        underline="none"
                                                        sx={{ display: 'block', height: '100%' }}
                                                    >
                                                        <Card
                                                            sx={{
                                                                height: '100%',
                                                                transition: 'box-shadow 0.3s ease',
                                                                '&:hover': {
                                                                    boxShadow: 6,
                                                                    borderColor: theme.palette.primary.main
                                                                }
                                                            }}
                                                        >
                                                            <Stack
                                                                direction={{ xs: 'column', sm: 'row' }}
                                                                spacing={3}
                                                                sx={{
                                                                    px: 4,
                                                                    py: 3,
                                                                    height: '100%',
                                                                    backgroundImage: `linear-gradient(to right, rgba(255,255,255,1) 66%, rgba(255,255,255,0)), url(${spec.img})`,
                                                                    backgroundPosition: 'right',
                                                                    backgroundSize: 'contain',
                                                                    backgroundRepeat: 'no-repeat',
                                                                }}
                                                            >
                                                                <Box sx={{ flexGrow: 1 }}>
                                                                    <Typography variant="h5" gutterBottom>
                                                                        {spec.label}
                                                                    </Typography>
                                                                    <Typography color="text.secondary" variant="body2">
                                                                        {spec.count || 0} specialists
                                                                    </Typography>
                                                                </Box>
                                                            </Stack>
                                                        </Card>
                                                    </Link>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Grid>
                                </Grid>
                            );
                        })}
                    </Stack>
                </Container>
            </Box>
        </>
    );
};

export default Page;