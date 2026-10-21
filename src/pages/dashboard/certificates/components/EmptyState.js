import { memo } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import { RouterLink } from 'src/components/router-link';
import { btn, IconTile, Surface } from 'src/components/ctmass-ui';
import { paths } from 'src/paths';
import { BRAND, FONT } from 'src/theme/ctmass-tokens';

const BENEFITS = [
    { icon: <VerifiedUserOutlinedIcon />, title: 'Verified badge', text: 'Shown on your public profile.' },
    { icon: <LockOutlinedIcon />, title: 'Private by choice', text: 'Keep sensitive documents hidden.' },
    { icon: <TrendingUpOutlinedIcon />, title: 'Rank higher', text: 'Clients see licensed pros first.' }
];

const EmptyState = () => (
    <Surface sx={{ p: { xs: 3, md: 6 } }}>
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) minmax(0, 1fr)' },
                gap: { xs: 4, md: 6 },
                alignItems: 'center'
            }}
        >
            <Box>
                <IconTile size={64}><WorkspacePremiumOutlinedIcon /></IconTile>
                <Typography component="h2" sx={{ mt: 2.5, fontFamily: FONT.display, fontWeight: 800, fontSize: { xs: 26, md: 32 }, letterSpacing: '-0.02em', lineHeight: 1.15, color: BRAND.navy }}>
                    Add your first license or certificate
                </Typography>
                <Typography sx={{ mt: 1.5, maxWidth: 440, color: BRAND.muted, fontSize: 16, lineHeight: 1.6 }}>
                    Homeowners trust pros who show their paperwork. Upload a license, insurance or training certificate in a couple of minutes.
                </Typography>
                <Button
                    component={RouterLink}
                    href={paths.dashboard.certificates.create}
                    startIcon={<AddRoundedIcon />}
                    sx={{ ...btn.green, mt: 3.5, minHeight: 52, px: 3 }}
                >
                    Add a document
                </Button>
            </Box>
            <Stack spacing={1.25}>
                {BENEFITS.map((item) => (
                    <Stack key={item.title} direction="row" spacing={1.75} alignItems="center" sx={{ p: 2, borderRadius: '16px', bgcolor: BRAND.mist }}>
                        <IconTile size={44} tone="navy">{item.icon}</IconTile>
                        <Box>
                            <Typography sx={{ fontWeight: 700, color: BRAND.ink }}>{item.title}</Typography>
                            <Typography sx={{ fontSize: 14, color: BRAND.muted }}>{item.text}</Typography>
                        </Box>
                    </Stack>
                ))}
            </Stack>
        </Box>
    </Surface>
);

export default memo(EmptyState);
