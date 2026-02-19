import { Box } from '@mui/material';

function TradeHeroPanel() {
    return (
        <Box
            sx={{
                flex: { xs: '0 0 auto', md: '0 0 17vw' },
                height: 1000,
                borderRadius: 4,
                overflow: 'hidden',
                position: 'relative',
                bgcolor: 'grey.900'
            }}
        >
            <Box
                xs={0}
                md={3}
                lg={4}
                sx={{
                    height: 1000,
                    backgroundImage: 'url(/assets/trade-hero-panel.png)',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                    display: {
                        xs: 'none',
                        md: 'block'
                    }
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    background: (theme) =>
                        `linear-gradient(180deg, rgba(0,0,0,0) 20%, ${theme.palette.common.black} 100%)`,
                    opacity: 0.65
                }}
            />
        </Box>
    );
}

export default TradeHeroPanel;