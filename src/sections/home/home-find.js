import {Box, Button, Container, TextField, OutlinedInput,IconButton,
  InputAdornment,
  Paper,
  SvgIcon} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import SearchMdIcon from '@untitled-ui/icons-react/build/esm/SearchMd';
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
                       <OutlinedInput
              fullWidth
              placeholder="How can I help you?"
              startAdornment={(
                <InputAdornment position="start">
                  <SvgIcon>
                    <SearchMdIcon />
                  </SvgIcon>
                </InputAdornment>
              )}
            />
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
