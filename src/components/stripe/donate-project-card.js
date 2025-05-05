import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Button,
    Box,
    Divider,
    useTheme,
    styled
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import StarsIcon from '@mui/icons-material/Stars';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DonateButton from "src/components/stripe/donate-button";
import {ProfileSettingFeatureToggles} from "src/featureToggles/ProfileSettingFeatureToggles";


const HighlightText = styled(Typography)({
    display: 'inline',
    background: 'rgba(255,255,255,0.15)',
    padding: '2px 8px',
    borderRadius: '4px',
    boxDecorationBreak: 'clone'
});

const DonationCardUS = ({onDonateClick}) => {
    const theme = useTheme();

    if (!ProfileSettingFeatureToggles.donation) {
        return null;
    }

    return (
        <Card sx={{
            mb: 2,
            background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
        }}>
            <CardContent sx={{position: 'relative', p: 4}}>
                <Box display="flex" alignItems="center" mb={3}>
                    <StarsIcon fontSize="large" sx={{
                        mr: 2,
                        color: theme.palette.secondary.light
                    }}/>
                    <Typography variant="h5" component="div" sx={{
                        fontWeight: 700,
                        letterSpacing: '0.5px'
                    }}>
                        Help Us Keep Improving!
                    </Typography>
                </Box>

                <Divider sx={{
                    my: 3,
                    bgcolor: 'rgba(255,255,255,0.3)'
                }}/>

                <Typography variant="body1" paragraph sx={{mb: 2}}>
                    If <HighlightText>you find value</HighlightText> in our service and want to see it grow,
                    please consider making a contribution.
                </Typography>


                <Typography variant="body2" paragraph sx={{
                    fontStyle: 'italic',
                    color: 'rgba(255,255,255,0.9)',
                    mb: 3
                }}>
                    "Great services are built by communities - your support makes you part of ours."
                </Typography>

                <Box display="flex" justifyContent="center" mt={4}>
                    <DonateButton triggerComponent={<Button
                        variant="contained"
                        color="secondary"
                        size="large"
                        endIcon={<ArrowForwardIcon/>}
                        onClick={onDonateClick}
                        sx={{
                            py: 1.5,
                            px: 5,
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '1rem',
                            textTransform: 'none',
                            letterSpacing: '0.5px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 6px 16px rgba(0,0,0,0.2)'
                            },
                            transition: 'all 0.3s ease'
                        }}
                    >
                        Support Our Mission
                    </Button>}/>
                </Box>

                <Typography variant="caption" display="block" textAlign="center" mt={3} sx={{
                    opacity: 0.8,
                    fontSize: '0.75rem'
                }}>
                    All contributions are greatly appreciated. Thank you!
                </Typography>
            </CardContent>
        </Card>
    );
};

export default DonationCardUS;