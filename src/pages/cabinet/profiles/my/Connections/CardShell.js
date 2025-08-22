import { Paper } from "@mui/material";

export const CardShell = ({ children }) => (
    <Paper
        variant="outlined"
        sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: 'transparent',
            border: 'none',
            boxShadow: 'none',
            overflow: 'hidden',

            height: '100%',
            display: 'flex',
            gap: 1,
            alignItems: 'center',

            '&:hover': {
                bgcolor: 'transparent'
            },

            '& .truncate': {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical'
            }
        }}
    >
        {children}
    </Paper>
);