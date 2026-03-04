import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Paper,
    Stack,
    Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { paths } from 'src/paths';

const BENEFITS = [
    { icon: VerifiedUserOutlinedIcon, text: 'Verified badge on your public profile' },
    { icon: LockOutlinedIcon, text: 'Encrypted storage for sensitive data' },
    { icon: TrendingUpOutlinedIcon, text: 'Higher visibility in client search results' }
];

const EmptyState = () => {
    const navigate = useNavigate();

    return (
        <Box>
            <Typography variant="h4" fontWeight={700} sx={{ mb: 6 }}>
                My Certificates and Licenses
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Paper
                    elevation={0}
                    sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 3,
                        p: 4,
                        maxWidth: 480,
                        width: '100%',
                        textAlign: 'center'
                    }}
                >
                    <Box
                        component="img"
                        src="/assets/dashboard/certificates/no-certificates.jpg"
                        alt="No certificates"
                        sx={{
                            width: 140,
                            height: 140,
                            objectFit: 'cover',
                            borderRadius: 2,
                            mb: 3,
                            mx: 'auto',
                            display: 'block'
                        }}
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />

                    <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                        You don&apos;t have any documents yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Add your certificates and licenses to build trust with clients and stand out from the competition.
                    </Typography>

                    <Stack spacing={1.5} sx={{ mb: 3 }}>
                        {BENEFITS.map(({ icon: Icon, text }) => (
                            <Box
                                key={text}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    px: 2,
                                    py: 1.25,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 2,
                                    textAlign: 'left'
                                }}
                            >
                                <Icon sx={{ color: 'primary.main', fontSize: 20, flexShrink: 0 }} />
                                <Typography variant="body2">{text}</Typography>
                            </Box>
                        ))}
                    </Stack>

                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<AddIcon />}
                        onClick={() => navigate(paths.dashboard.certificates.create)}
                        fullWidth
                        sx={{ mb: 2, borderRadius: 2 }}
                    >
                        Add your first document
                    </Button>

                    {/* <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 0.5,
                            color: 'text.secondary',
                            cursor: 'pointer',
                            '&:hover': { color: 'primary.main' }
                        }}
                    >
                        <InfoOutlinedIcon sx={{ fontSize: 16 }} />
                        <Typography variant="body2">Learn more about document verification</Typography>
                        <ArrowForwardIosIcon sx={{ fontSize: 12 }} />
                    </Box> */}
                </Paper>
            </Box>
        </Box>
    );
};

export default memo(EmptyState);
