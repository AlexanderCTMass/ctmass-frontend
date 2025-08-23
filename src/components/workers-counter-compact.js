import React, { useEffect, useState } from 'react';
import { Box, Typography, IconButton, Stack, LinearProgress, styled, useMediaQuery } from '@mui/material';
import { Close, Group, Rocket } from '@mui/icons-material';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import { firestore } from "src/libs/firebase";
import { useTheme } from "@mui/material/styles";

const CompactProgressBar = styled(LinearProgress)(({ theme }) => ({
    height: 6,
    borderRadius: 3,
    margin: '8px 0',
    backgroundColor: theme.palette.grey[200],
    '& .MuiLinearProgress-bar': {
        borderRadius: 3,
        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.main})`,
    },
}));

const WorkersCounterCompact = () => {
    const [count, setCount] = useState(0);
    const [target] = useState(1000);
    const [progress, setProgress] = useState(0);
    const [show, setShow] = useState(true);
    const theme = useTheme();
    const downMd = useMediaQuery((theme) => theme.breakpoints.down('md'));
    useEffect(() => {
        // Check localStorage for last closed time
        const lastClosed = localStorage.getItem('workersCounterClosed');
        if (lastClosed) {
            const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
            if (parseInt(lastClosed) > twoHoursAgo) {
                setShow(false);
            }
        }

        const fetchWorkersCount = async () => {
            const workersRef = collection(firestore, 'profiles');
            const q = query(workersRef, where('role', '==', 'WORKER'));
            const snapshot = await getCountFromServer(q);
            const workersCount = snapshot.data().count + 41;

            setCount(workersCount);
            setProgress(Math.min((workersCount / target) * 100, 100));
        };

        fetchWorkersCount();
    }, [target]);

    const handleClose = () => {
        setShow(false);
        localStorage.setItem('workersCounterClosed', Date.now().toString());
    };

    if (!show) return null;

    return (
        <Box sx={{
            height: 100,
            width: 300,
            p: 1.5,
            borderRadius: 1,
            bgcolor: 'background.paper',
            boxShadow: 1,
            position: 'fixed',
            border: '1px solid',
            borderColor: 'divider',
            top: 0,
            margin: (theme) => theme.spacing(4),
            left: 0,
            zIndex: 1000000
        }}>
            <IconButton
                size="small"
                onClick={handleClose}
                sx={{
                    position: 'absolute',
                    right: 4,
                    top: 4
                }}
            >
                <Close fontSize="small" />
            </IconButton>

            <Stack direction="row" alignItems="center" spacing={1}>
                <Group color="primary" fontSize="small" />
                <Typography variant="subtitle2" fontWeight="bold">
                    {count.toLocaleString()}/{target.toLocaleString()} pros
                </Typography>
            </Stack>

            <CompactProgressBar variant="determinate" value={progress} />

            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
                <Rocket color="primary" fontSize="small" />
                <Typography variant="caption">
                    Help us grow! Share with colleagues
                </Typography>
            </Stack>
        </Box>
    );
};

export default WorkersCounterCompact;