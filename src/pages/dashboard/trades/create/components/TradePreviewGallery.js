import React, {useMemo, useState, useEffect} from 'react';
import {
    Grid,
    Card,
    CardContent,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Typography
} from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import {useTheme} from '@mui/material/styles';
import {profileApi} from 'src/api/profile';
import HorizontalPreviewCard from "src/components/profiles/previewCards/horizontal-preview-card";
import SmallPreviewCard from "src/components/profiles/previewCards/small-preview-card";
import VerticalPreviewCard from "src/components/profiles/previewCards/vertical-preview-card";
import {extractPreviewData, parseDateLike} from "src/components/profiles/previewCards/base-preview-card";

const CARD_SIZE_OPTIONS = [
    {id: 'big', label: 'Vertical card'},
    {id: 'medium', label: 'Horizontal card'},
    {id: 'small', label: 'Small card'}
];

function TradePreviewGallery({values, ownerId}) {
    const [selectedSize, setSelectedSize] = useState('big');
    const [profileRegistrationDate, setProfileRegistrationDate] = useState(null);
    const theme = useTheme();
    const lgUp = useMediaQuery(theme.breakpoints.up('lg'));

    useEffect(() => {
        let active = true;

        if (!ownerId) {
            setProfileRegistrationDate(null);
            return undefined;
        }

        (async () => {
            try {
                const profile = await profileApi.getProfileById(ownerId);
                if (!active) {
                    return;
                }

                const registrationTimestamp = profile?.registrationAt ?? profile?.registeredAt ?? null;
                const parsedDate = parseDateLike(registrationTimestamp);
                setProfileRegistrationDate(parsedDate);
            } catch (error) {
                console.error('[TradePreviewGallery] Failed to load profile registration date', error);
                if (active) {
                    setProfileRegistrationDate(null);
                }
            }
        })();

        return () => {
            active = false;
        };
    }, [ownerId]);

    const previewData = useMemo(
        () => extractPreviewData(values, profileRegistrationDate),
        [values, profileRegistrationDate]
    );

    const renderedCard = useMemo(() => {
        switch (selectedSize) {
            case 'medium':
                return <HorizontalPreviewCard data={previewData} theme={theme}/>;
            case 'small':
                return <SmallPreviewCard data={previewData}/>;
            case 'big':
            default:
                return <VerticalPreviewCard data={previewData} theme={theme}/>;
        }
    }, [previewData, selectedSize, theme]);

    return (
        <Card variant="outlined" sx={{borderRadius: 4}}>
            <CardContent sx={{p: {xs: 3, md: 5}}}>
                <Stack spacing={3}>
                    <Stack spacing={1}>
                        <Typography variant="h6" fontWeight={700}>
                            Finally
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Check how the public preview cards of your trade will look in different search locations on
                            the platform.
                        </Typography>
                    </Stack>

                    <ToggleButtonGroup
                        exclusive
                        value={selectedSize}
                        onChange={(_, value) => value && setSelectedSize(value)}
                        sx={{
                            '& .MuiToggleButton-root': {
                                textTransform: 'none',
                                px: 3,
                                py: 1.1
                            }
                        }}
                    >
                        {CARD_SIZE_OPTIONS.map((option) => (
                            <ToggleButton key={option.id} value={option.id}>
                                {option.label}
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={12} md={12} lg={selectedSize == 'medium' ? 12 : 4}>
                            {renderedCard}
                        </Grid>
                    </Grid>
                </Stack>
            </CardContent>
        </Card>
    );
}

TradePreviewGallery.defaultProps = {
    ownerId: null
};

export default TradePreviewGallery;