import React from 'react';
import {
    Avatar,
    Card,
    CardContent,
    Stack,
    Typography
} from '@mui/material';
import { alpha } from '@mui/material/styles';

const SmallPreviewCard = ({ data }) => (
    <Card
        variant="outlined"
        sx={{
            borderRadius: 4,
            boxShadow: 'none'
        }}
    >
        <CardContent
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1.5
            }}
        >
            <Avatar
                src={data.image}
                alt={data.title}
                sx={{ width: 64, height: 64, border: (theme) => `3px solid ${alpha(theme.palette.primary.main, 0.2)}` }}
            >
                {data.avatarInitial}
            </Avatar>

            <Stack spacing={0.5} alignItems="center">
                <Typography variant="subtitle1" fontWeight={700} align="center">
                    {data.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                    {data.specialtyLabel}
                </Typography>
            </Stack>
        </CardContent>
    </Card>
);

export default SmallPreviewCard;