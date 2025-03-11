import {Box, Typography} from '@mui/material';

export const ChatBlank = (props) => {
    const {image = "/assets/errors/error-404.png", text = "Start meaningful conversations!"} = props;
    return (
        <Box
            sx={{
                alignItems: 'center',
                display: 'flex',
                flexGrow: 1,
                flexDirection: 'column',
                justifyContent: 'center',
                overflow: 'hidden'
            }}
        >
            <Box
                component="img"
                src={image}
                sx={{
                    height: 'auto',
                    maxWidth: 120
                }}
            />
            <Typography
                color="text.secondary"
                sx={{mt: 2}}
                variant="subtitle1"
            >
                {text}
            </Typography>
        </Box>
    );
}