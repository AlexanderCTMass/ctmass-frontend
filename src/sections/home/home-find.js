import {Box, Button, Container, TextField} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import Grid from '@mui/material/Grid';

export const HomeFind = () => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                pt: '40px',
                pb: '40px'
            }}
        >
            <form onSubmit={(event) => event.preventDefault()}>
            <Container maxWidth="lg">
                <Grid container spacing={2}>
                    <Grid item xs={10}>
                        <TextField fullWidth placeholder="Service or specialist"/>
                    </Grid>
                    <Grid item xs={2}>
                        <Button fullWidth variant="contained" size="large">
                            Find
                        </Button>
                    </Grid>
                </Grid>
            </Container>
            </form>
        </Box>
    );
};
