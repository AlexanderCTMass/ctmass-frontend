import React, { useState } from 'react';
import {
    Box,
    Typography,
    Tooltip,
    Card,
    CardContent,
    LinearProgress,
    Stack,
    Link,
    Avatar, Button
} from '@mui/material';
import {
    Favorite,
    FavoriteBorder,
    Stars,
    WorkspacePremium,
    MilitaryTech,
    Construction
} from '@mui/icons-material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import DonateButton from "src/components/stripe/donate-button";
import { ProfileSettingFeatureToggles } from "src/featureToggles/ProfileSettingFeatureToggles";

export const DONATION_TIERS = [
    {
        amount: 1000,
        badge: "Platinum Sponsor",
        color: "#252525",
        progressColor: "#E5E4E2",
        icon: <Stars fontSize="large" sx={{ color: "#E5E4E2" }} />,
        description: "Elite status with diamond benefits",
        textColor: "#FFFFFF"
    },
    {
        amount: 500,
        badge: "Gold Guardian",
        color: "#D4AF37",
        progressColor: "#FFD700",
        icon: <WorkspacePremium fontSize="large" sx={{ color: "#FFD700" }} />,
        description: "VIP golden circle membership",
        textColor: "#000000"
    },
    {
        amount: 100,
        badge: "Silver Star",
        color: "#424242",
        progressColor: "#C0C0C0",
        icon: <MilitaryTech fontSize="large" sx={{ color: "#C0C0C0" }} />,
        description: "Premium silver supporter",
        textColor: "#000000"
    },
    {
        amount: 50,
        badge: "Bronze Builder",
        color: "#804A00",
        progressColor: "#CD7F32",
        icon: <Construction fontSize="large" sx={{ color: "#CD7F32" }} />,
        description: "Dedicated community builder",
        textColor: "#FFFFFF"
    },
    {
        amount: 10,
        badge: "Lovely Supporter",
        color: "#2E7D32",
        progressColor: "#4CAF50",
        icon: <Favorite fontSize="large" sx={{ color: "#4CAF50" }} />,
        description: "Valued project supporter",
        textColor: "#FFFFFF"
    },
    {
        amount: 1,
        badge: "Supporter",
        color: "#2e407d",
        progressColor: "#4c6faf",
        icon: <ThumbUpIcon fontSize="large" sx={{ color: "#4c6faf" }} />,
        description: "Valued project supporter",
        textColor: "#FFFFFF"
    }
];

const DonationBadge = ({ donationAmount = 0 }) => {
    const [showTiers, setShowTiers] = useState(false);

    if (!ProfileSettingFeatureToggles.donation) {
        return null;
    }

    // Сортируем уровни по возрастанию
    const sortedTiers = [...DONATION_TIERS].sort((a, b) => a.amount - b.amount);
    const maxAmount = Math.max(...sortedTiers.map(tier => tier.amount));

    // Находим текущий и следующий уровни
    const achievedTier = sortedTiers.findLast(tier => donationAmount >= tier.amount);
    const nextTier = sortedTiers.find(tier => donationAmount < tier.amount);

    // Рассчитываем прогресс до следующего уровня
    const calculateProgressToNextTier = () => {
        if (!nextTier) return 100; // Если нет следующего уровня (достигнут максимум)

        const prevTierAmount = achievedTier?.amount || 0;
        const segmentStart = prevTierAmount;
        const segmentEnd = nextTier.amount;

        if (donationAmount <= segmentStart) return 0;
        if (donationAmount >= segmentEnd) return 100;

        return ((donationAmount - segmentStart) / (segmentEnd - segmentStart)) * 100;
    };

    const progress = calculateProgressToNextTier();

    return (
        <Card sx={{ maxWidth: 400, mx: 'auto', boxShadow: 3 }}>
            <CardContent sx={{ py: "16px !important" }}>
                {donationAmount === 0 ? (
                    <Stack alignItems="center" spacing={1}>
                        <Avatar sx={{ bgcolor: 'action.disabled', width: 56, height: 56 }}>
                            <FavoriteBorder fontSize="large" sx={{ color: 'background.paper' }} />
                        </Avatar>
                        <Typography variant="h6" textAlign="center">
                            You haven't supported yet
                        </Typography>
                        <DonateButton triggerComponent={<Button variant="contained" size="small">Make your first
                            donation</Button>} />
                        <Typography variant="body2" color="text.secondary" textAlign="center">
                            to unlock supporter benefits
                        </Typography>
                    </Stack>
                ) : (
                    <>
                        <Tooltip title={achievedTier?.description || "Thank you for your support!"}>
                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={2}
                                sx={{ mb: 2 }}
                            >
                                <Avatar
                                    sx={{
                                        bgcolor: achievedTier?.color || "#5D5D5D",
                                        width: 56,
                                        height: 56
                                    }}
                                >
                                    {achievedTier?.icon || <Stars fontSize="large" sx={{ color: "white" }} />}
                                </Avatar>
                                <Box>
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight="bold"
                                        sx={{ color: achievedTier?.color || "#5D5D5D" }}
                                    >
                                        {achievedTier?.badge || "Platinum Sponsor"}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        ${donationAmount.toFixed(2)} donated
                                    </Typography>
                                </Box>
                            </Stack>
                        </Tooltip>

                        <Box sx={{ mb: 2 }}>
                            {nextTier ? (
                                <>
                                    <LinearProgress
                                        variant="determinate"
                                        value={progress}
                                        sx={{
                                            height: 8,
                                            borderRadius: 4,
                                            backgroundColor: 'rgba(0,0,0,0.1)',
                                            '& .MuiLinearProgress-bar': {
                                                backgroundColor: nextTier.progressColor,
                                                borderRadius: 4
                                            }
                                        }}
                                    />
                                    <Stack direction="row" justifyContent="space-between" alignItems="start"
                                        sx={{ mt: 1 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            {`$${(nextTier.amount - donationAmount).toFixed(2)} to `}
                                            <Link
                                                component="button"
                                                variant="caption"
                                                onClick={() => setShowTiers(!showTiers)}
                                                sx={{
                                                    textDecoration: 'none',
                                                    '&:hover': {
                                                        textDecoration: 'underline'
                                                    }
                                                }}
                                            >
                                                {nextTier.badge}
                                            </Link>
                                        </Typography>
                                        <DonateButton
                                            triggerComponent={<Button variant="contained"
                                                size="small">Donate</Button>} />

                                    </Stack>
                                </>
                            ) : (
                                <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                                    🎉 You've reached the highest tier!
                                </Typography>
                            )}
                        </Box>

                        {showTiers && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                    Donation tiers:
                                </Typography>
                                <Stack spacing={1}>
                                    {sortedTiers.map(tier => (
                                        <Stack
                                            key={tier.amount}
                                            alignItems="center"
                                            gap={1}
                                            justifyContent="space-between"
                                            direction="row"
                                        >
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Avatar
                                                    sx={{
                                                        bgcolor: tier.color,
                                                        width: 32,
                                                        height: 32,
                                                        '& .MuiSvgIcon-root': {
                                                            fontSize: '1rem'
                                                        }
                                                    }}
                                                >
                                                    {tier.icon}
                                                </Avatar>
                                                <Typography variant="caption">
                                                    {tier.badge}
                                                </Typography>
                                            </Box>
                                            <Typography variant="caption" color="text.secondary">
                                                ${tier.amount}
                                            </Typography>
                                        </Stack>
                                    ))}
                                </Stack>
                            </Box>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default DonationBadge;