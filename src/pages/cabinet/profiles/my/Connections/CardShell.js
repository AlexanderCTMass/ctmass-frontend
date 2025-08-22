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
            alignItems: 'center',
            gap: 1,

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