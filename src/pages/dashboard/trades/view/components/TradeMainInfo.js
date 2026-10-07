import { Avatar, Box, Button, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import SellOutlinedIcon from '@mui/icons-material/SellOutlined';
import { BRAND, FONT, RADIUS, SHADOW } from 'src/theme/ctmass-tokens';

const STATUS_CONFIG = {
    active: { label: 'Active', color: BRAND.green },
    hidden: { label: 'Hidden', color: '#98A2B3' },
    on_review: { label: 'On review', color: '#F79009' },
    fix_it: { label: 'Fix it', color: '#F79009' },
    not_active: { label: 'Not active', color: '#53B1FD' },
    rejected: { label: 'Rejected', color: BRAND.danger }
};

const normalizeStatus = (status) => {
    if (!status) return 'on_review';
    return status.toString().trim().toLowerCase().replace(/\s+/g, '_');
};

const Fact = ({ icon, children }) => (
    <Stack
        direction="row"
        alignItems="center"
        spacing={0.75}
        sx={{
            minWidth: 0,
            maxWidth: '100%',
            px: 1.5,
            py: 0.75,
            borderRadius: '12px',
            bgcolor: alpha('#FFFFFF', 0.1),
            border: `1px solid ${alpha('#FFFFFF', 0.14)}`,
            fontSize: 14,
            fontWeight: 600,
            '& svg': { fontSize: 18, flexShrink: 0, color: BRAND.green }
        }}
    >
        {icon}
        <Box component="span" sx={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {children}
        </Box>
    </Stack>
);

function TradeMainInfo({ trade, onEdit }) {
    const avatarInitial = (trade?.title || 'T').charAt(0).toUpperCase();
    const locationText = trade?.location?.address
        ? trade?.location?.address
        : 'Location not specified';

    const priceText = trade?.pricing?.amount
        ? `$${trade.pricing.amount}${trade?.pricing?.type ? `/${trade.pricing.type}` : '/hr'}`
        : 'Price not specified';

    const description = trade?.story?.about || trade?.story?.shortDescription || trade?.description || 'No description available';
    const status = STATUS_CONFIG[normalizeStatus(trade?.status)] || STATUS_CONFIG.on_review;

    return (
        <Box
            sx={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: { xs: RADIUS.card, md: RADIUS.panel },
                color: '#FFFFFF',
                boxShadow: SHADOW.lg,
                p: { xs: 2.5, sm: 4, md: 5 },
                background: `radial-gradient(60% 90% at 100% 100%, ${alpha(BRAND.green, 0.3)} 0%, ${alpha(BRAND.green, 0)} 60%), linear-gradient(150deg, ${BRAND.navy} 0%, ${BRAND.navyDeep} 100%)`,
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    backgroundImage: `linear-gradient(${alpha('#FFFFFF', 0.06)} 1px, transparent 1px), linear-gradient(90deg, ${alpha('#FFFFFF', 0.06)} 1px, transparent 1px)`,
                    backgroundSize: '48px 48px',
                    WebkitMaskImage: 'linear-gradient(90deg, transparent 10%, #000 80%)',
                    maskImage: 'linear-gradient(90deg, transparent 10%, #000 80%)'
                }
            }}
        >
            <Box
                sx={{
                    position: 'relative',
                    display: 'grid',
                    gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'auto minmax(0, 1fr) auto' },
                    alignItems: 'start',
                    gap: { xs: 2.5, md: 4 }
                }}
            >
                <Avatar
                    src={trade?.avatarUrl || undefined}
                    variant="rounded"
                    sx={{
                        width: { xs: 84, md: 128 },
                        height: { xs: 84, md: 128 },
                        borderRadius: { xs: '26px', md: '36px' },
                        bgcolor: alpha('#FFFFFF', 0.14),
                        border: `2px solid ${alpha('#FFFFFF', 0.3)}`,
                        color: '#FFFFFF',
                        fontFamily: FONT.display,
                        fontSize: { xs: 36, md: 56 },
                        fontWeight: 800
                    }}
                >
                    {avatarInitial}
                </Avatar>

                <Box sx={{ minWidth: 0 }}>
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={0.75}
                        sx={{
                            display: 'inline-flex',
                            mb: 1.25,
                            px: 1.25,
                            height: 28,
                            borderRadius: 999,
                            bgcolor: alpha('#FFFFFF', 0.12),
                            fontSize: 13,
                            fontWeight: 700
                        }}
                    >
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: status.color }} />
                        <span>{status.label}</span>
                    </Stack>
                    <Typography
                        component="h1"
                        sx={{
                            fontFamily: FONT.display,
                            fontWeight: 800,
                            fontSize: { xs: 26, sm: 32, md: 40 },
                            letterSpacing: '-0.025em',
                            lineHeight: 1.1,
                            color: '#FFFFFF',
                            overflowWrap: 'anywhere'
                        }}
                    >
                        {trade?.title || 'Untitled trade'}
                    </Typography>
                    <Typography sx={{ mt: 0.75, fontSize: { xs: 15, md: 17 }, fontWeight: 600, color: alpha('#FFFFFF', 0.78) }}>
                        {trade?.primarySpecialtyLabel || trade?.subtitle || 'Specialty not specified'}
                    </Typography>

                    <Stack direction="row" flexWrap="wrap" sx={{ mt: 2.5, gap: 1 }}>
                        <Fact icon={<LocationOnOutlinedIcon />}>{locationText}</Fact>
                        <Fact icon={<SellOutlinedIcon />}>{priceText}</Fact>
                    </Stack>

                    <Typography sx={{ mt: 2.5, maxWidth: 720, fontSize: 15, lineHeight: 1.65, color: alpha('#FFFFFF', 0.78), overflowWrap: 'anywhere', whiteSpace: 'pre-line' }}>
                        {description}
                    </Typography>
                </Box>

                <Button
                    startIcon={<EditOutlinedIcon />}
                    onClick={onEdit}
                    sx={{
                        minHeight: 48,
                        px: 3,
                        borderRadius: RADIUS.tile,
                        bgcolor: '#FFFFFF',
                        color: BRAND.navy,
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        '&:hover': { bgcolor: BRAND.green, color: '#FFFFFF' },
                        '&:active': { transform: 'scale(0.98)' }
                    }}
                >
                    Edit trade
                </Button>
            </Box>
        </Box>
    );
}

export default TradeMainInfo;
