// projects-counter.js
import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Avatar, Stack, LinearProgress, styled } from '@mui/material';
import { AssignmentTurnedIn, Share, TrendingUp } from '@mui/icons-material';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import { firestore } from "src/libs/firebase";

// Styled components
const ProgressBar = styled(LinearProgress)(({ theme }) => ({
    height: 12,
    borderRadius: 6,
    margin: '16px 0',
    backgroundColor: theme.palette.grey[200],
    '& .MuiLinearProgress-bar': {
        borderRadius: 6,
        background: `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.success.light})`,
    },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
    width: 60,
    height: 60,
    margin: '0 auto',
    background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.light})`,
}));

const ProjectsCounter = () => {
    const [count, setCount] = useState(0);
    const [target] = useState(5000); // Target number of projects
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const fetchProjectsCount = async () => {
            const projectsRef = collection(firestore, 'projects');
            const q = query(projectsRef, where('state', '==', 'completed'));
            const snapshot = await getCountFromServer(q);
            const projectsCount = snapshot.data().count + 63;

            setCount(projectsCount);
            setProgress(Math.min((projectsCount / target) * 100, 100));
        };

        fetchProjectsCount();
        const interval = setInterval(fetchProjectsCount, 60000); // Update every minute

        return () => clearInterval(interval);
    }, [target]);

    return (
        <Card sx={{ m: 2, borderRadius: 3, boxShadow: 3 }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <StyledAvatar>
                    <AssignmentTurnedIn fontSize="large" />
                </StyledAvatar>

                <Typography variant="h4" sx={{ mt: 2, fontWeight: 'bold' }}>
                    {count.toLocaleString()}
                </Typography>

                <Typography variant="subtitle1" color="text.secondary">
                    projects successfully completed
                </Typography>

                <ProgressBar variant="determinate" value={progress} />

                <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
                    <Typography variant="caption">0</Typography>
                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                        <TrendingUp color="success" sx={{ fontSize: 16, mr: 0.5 }} />
                        Goal: {target.toLocaleString()}
                    </Typography>
                </Stack>

                <Box sx={{
                    backgroundColor: 'action.hover',
                    p: 2,
                    borderRadius: 2,
                    textAlign: 'left',
                    mt: 2
                }}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <TrendingUp color="success" sx={{ mr: 1 }} />
                        <strong style={{ marginRight: "10px" }}>Growth </strong> our platform is expanding rapidly!
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                        <Share color="primary" sx={{ mr: 1 }} />
                        <strong style={{ marginRight: "10px" }}>Share </strong> your success stories with others
                    </Typography>
                </Box>

                <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary' }}>
                    Updates every minute
                </Typography>
            </CardContent>
        </Card>
    );
};

export default ProjectsCounter;