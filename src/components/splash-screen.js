import { Box, LinearProgress, Typography } from '@mui/material';
import { styled } from "@mui/material/styles";
import { Logo } from './logo';
import { useEffect, useState } from 'react';

// Styled component for the bouncing logo with smoother animation
const BouncingElement = styled(Box)`
    height: 60px;
    width: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
    animation: gentleBounce 1.8s ease-in-out infinite;

    @keyframes gentleBounce {
        0%, 100% {
            transform: translateY(0) scale(1);
        }
        30% {
            transform: translateY(-12px) scale(1.05);
        }
        60% {
            transform: translateY(0) scale(1);
        }
        80% {
            transform: translateY(-6px) scale(1.02);
        }
    }
`;

// Array of engaging loading messages (US English)
const loadingMessages = [
    "Loading your personalized experience...",
    "Preparing something amazing...",
    "Almost there, just a moment...",
    "Optimizing performance...",
    "Initializing components...",
    "Final touches...",
    "Loading fresh content...",
    "Getting things ready for you..."
];

export const SplashScreen = () => {
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState(loadingMessages[0]);

    useEffect(() => {
        // Rotate messages every 3.5 seconds
        const messageInterval = setInterval(() => {
            setMessage(prev => {
                const currentIndex = loadingMessages.indexOf(prev);
                const nextIndex = (currentIndex + 1) % loadingMessages.length;
                return loadingMessages[nextIndex];
            });
        }, 3500);

        // Simulate progressive loading with random increments
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                // Slow down as progress increases (more realistic)
                const increment = prev < 50
                    ? Math.random() * 15
                    : Math.random() * 8;
                return Math.min(prev + increment, 98); // Stop before 100%
            });
        }, 600);

        return () => {
            clearInterval(messageInterval);
            clearInterval(progressInterval);
        };
    }, []);

    return (
        <Box
            sx={{
                alignItems: 'center',
                backgroundColor: 'background.paper',
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                justifyContent: 'center',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1400,
                gap: 3,
                px: 3
            }}
        >
            {/* Animated Logo Container */}
            <BouncingElement>
                <Logo />
            </BouncingElement>

            {/* Dynamic Loading Message */}
            <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                    textAlign: 'center',
                    maxWidth: '280px',
                    minHeight: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'opacity 0.3s ease',
                    fontWeight: 500
                }}
            >
                {message}
            </Typography>

            {/* Progress Bar with Percentage */}
            <Box sx={{ width: '100%', maxWidth: '280px' }}>
                <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: (theme) => theme.palette.grey[200],
                        '& .MuiLinearProgress-bar': {
                            borderRadius: 3,
                            backgroundColor: 'primary.main',
                            transition: 'transform 0.4s ease'
                        }
                    }}
                />
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                        display: 'block',
                        textAlign: 'right',
                        mt: 0.5,
                        fontSize: 12,
                        fontWeight: 600
                    }}
                >
                    {Math.round(progress)}% loaded
                </Typography>
            </Box>
        </Box>
    );
};