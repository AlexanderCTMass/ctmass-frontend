import EyeIcon from '@untitled-ui/icons-react/build/esm/Eye';
import LayoutBottomIcon from '@untitled-ui/icons-react/build/esm/LayoutBottom';
import {Box, Button, Container, Rating, Stack, SvgIcon, Typography} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import {RouterLink} from 'src/components/router-link';
import {paths} from 'src/paths';
import {HomeCodeSamples} from './home-code-samples';

export const HomeHero = () => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'top center',
                backgroundImage: 'url("/assets/gradient-bg.svg")',
                pt: '120px'
            }}
        >
            <Container maxWidth="lg">
                <Box maxWidth="sm">
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
                        We unite people who need to do something with people who are ready to do it efficiently and on
                        time, at the highest professional level.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};
