import {Box, Container, Stack, Typography, useMediaQuery} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import React, {useEffect, useState} from "react";
import {paths} from "src/paths";
import {useDispatch, useSelector} from "src/store";
import {thunks} from "src/thunks/dictionary";
import {useMemo} from "react";
import {collection, getDocs, query} from "firebase/firestore";
import {firestore} from "src/libs/firebase";
import {INFO} from "src/libs/log";
import {projectsLocalApi} from "src/api/projects/project-local-storage";
import {ProjectStatus} from "src/enums/project-state";
import {useNavigate} from "react-router-dom";
import useDictionary from "src/hooks/use-dictionaries";

const useSpecialties = (userId) => {
    const {categories, specialties, services} = useDictionary();
    const [filteredSpecialties, setFilteredSpecialties] = useState([])

    useEffect(() => {
        const fetch = async () => {
            const userSpecialtiesSnapshot = await getDocs(collection(firestore, "userSpecialties"))
            const userSpecialtiesData = userSpecialtiesSnapshot.docs.map(doc => doc.data().specialty);
            INFO("userSpecialtiesData", userSpecialtiesData);
            INFO("specialties", specialties);
            const filteredSpecialties = specialties.allIds
                .filter(id => userSpecialtiesData?.includes(id))
                .map((id) => {
                    const specialty = specialties.byId[id];
                    return {
                        label: specialty.label,
                        id: specialty.id,
                        fullId: specialty.path,
                        popularity: userSpecialtiesData.filter(id => id === specialty.id).length/userSpecialtiesData.length || 0
                    };
                })

                .slice(0, 20);

            INFO("filteredSpecialties", filteredSpecialties);

            setFilteredSpecialties(filteredSpecialties);
        };

        if (specialties) {
            fetch();
        }
    }, [specialties]);

    return filteredSpecialties;
};

export const HomeHero = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const specialties = useSpecialties();
    const downMd = useMediaQuery((theme) => theme.breakpoints.down('md'));
    const downSm = useMediaQuery((theme) => theme.breakpoints.down('sm'));

    const [slideImage, setSlideImage] = useState(1);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setSlideImage(prevSlideImage => prevSlideImage < 10 ? prevSlideImage + 1 : 1);
        }, 3000);

        return () => clearInterval(intervalId);
    }, []);

    const createSearchParams = (service) => {
        projectsLocalApi.storeProject({
            state: ProjectStatus.DRAFT,
            specialtyId: service.id
        })
        navigate(paths.request.create);
    }

    return (
        <Box
            sx={{
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'top center',
                backgroundImage: 'url("/assets/gradient-bg.svg")',
                pt: '120px'
            }}
        >
            <Container>
                <Grid container
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center">
                    <Grid xs={12} sm={8} md={8}>
                        <Typography
                            variant="h1"
                            sx={{mb: 4}}
                        >
                            Find a specialist<br/>
                            <Typography
                                component="span"
                                color="primary.main"
                                variant="inherit"
                                sx={{ml: downMd ? 0 : "150px"}}
                            > for your project</Typography>
                        </Typography>
                        {!downSm &&
                            <Stack
                                direction={"row"}
                                sx={{
                                    columnGap: "32px",
                                    rowGap: "7px",
                                    flexWrap: "wrap",
                                    alignItems: "center"
                                }}
                            >
                                {specialties.map(spec => (
                                    <Typography
                                        key={spec.label}
                                        color="text.secondary"
                                        onClick={() => {createSearchParams(spec)}}
                                        sx={{
                                            textDecoration: "none",
                                            fontSize: `${14 + spec.popularity * 30}px`,
                                            fontWeight: 500,
                                            cursor: "pointer",
                                            transition: 'transform 0.3s ease',
                                            '&:hover': {
                                                transform: "scale(1.1)",
                                                color: "primary.main"
                                            }
                                        }}
                                    >
                                        {spec.label}
                                    </Typography>
                                ))}
                            </Stack>}
                    </Grid>
                    <Grid xs={12} sm={4} md={4}
                          sx={{
                              backgroundImage: `url(/assets/gallery/plumbers/${slideImage}.png)`,
                              backgroundPosition: 'center',
                              backgroundSize: 'contain',
                              backgroundRepeat: 'no-repeat',
                              height: downSm ? 190 : 350,
                              overflow: 'hidden',
                              transition: 'background 0.5s ease'
                          }}
                    />
                </Grid>
            </Container>
        </Box>
    );
};
