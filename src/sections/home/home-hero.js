import EyeIcon from '@untitled-ui/icons-react/build/esm/Eye';
import LayoutBottomIcon from '@untitled-ui/icons-react/build/esm/LayoutBottom';
import {Box, Button, Container, Rating, Stack, SvgIcon, Typography} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import {useTheme} from '@mui/material/styles';
import {RouterLink} from 'src/components/router-link';
import {paths} from 'src/paths';
import {HomeCodeSamples} from './home-code-samples';
import {useEffect, useState} from "react";


export const HomeHero = () => {
    const theme = useTheme();
    const [slideImage, setSlideImage] = useState(1);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setSlideImage(prevSlideImage => prevSlideImage < 10 ? prevSlideImage + 1 : 1);
        }, 3000);

        return () => clearInterval(intervalId);
    }, []);

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
                            sx={{mb: 2}}
                        >
                            For any task<br/>there
                            is&nbsp;a&nbsp;professional<br/>
                            <Typography
                                component="span"
                                color="primary.main"
                                variant="inherit"
                            >
                                ready to help you.
                            </Typography>
                        </Typography>
                        <Typography
                            color="text.secondary"
                            sx={{
                                fontSize: 20,
                                fontWeight: 500
                            }}
                        >
                            We unite people who need to do something with people who are ready to do it efficiently and
                            on
                            time, at the highest professional level.
                        </Typography>
                    </Grid>
                    <Grid xs={12} sm={4} md={4}
                          sx={{
                              backgroundImage: `url(/assets/gallery/plumbers/${slideImage}.png)`,
                              backgroundPosition: 'center',
                              backgroundSize: 'contain',
                              backgroundRepeat: 'no-repeat',
                              height: 350,
                              overflow: 'hidden',
                              transition: 'background 0.5s ease'
                          }}
                    />
                </Grid>
            </Container>
        </Box>
    );
};
