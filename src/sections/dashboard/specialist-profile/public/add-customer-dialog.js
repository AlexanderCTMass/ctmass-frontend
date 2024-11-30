import {Box, Button, Dialog, FormControlLabel, Stack, Switch, TextField, Typography} from '@mui/material';
import {SpecialistPostCard} from "./specialist-post-card";

export const AddCustomerDialog = (props) => {
    const {
        onClose,
        open = false,
    } = props;


    return (
        <Dialog
            fullWidth
            maxWidth="xs"
            onClose={onClose}
            open={open}
            scroll={"body"}
        >
            <Box sx={{p: 3}}>
                <Typography
                    align="center"
                    gutterBottom
                    variant="h5"
                >
                    Add customer for project
                </Typography>
                <Stack
                    sx={{ p: 3 }}
                    spacing={3}
                >
                    <TextField
                        fullWidth
                        label="Customer email"
                        type={"email"}
                    />
                </Stack>
                <Box
                    sx={{
                        pb: 3,
                        px: 3
                    }}
                >
                    <Button
                        fullWidth
                        variant="contained"
                    >
                        Apply
                    </Button>
                </Box>
            </Box>
        </Dialog>
    );
};