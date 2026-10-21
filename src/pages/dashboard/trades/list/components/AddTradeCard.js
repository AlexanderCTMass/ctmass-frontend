import { ButtonBase, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { BRAND, RADIUS } from 'src/theme/ctmass-tokens';
import { IconTile, cardTitleSx } from 'src/components/ctmass-ui';

function AddTradeCard({ onClick }) {
    return (
        <ButtonBase
            onClick={onClick}
            sx={{
                height: '100%',
                minHeight: 220,
                p: 4,
                flexDirection: 'column',
                gap: 1.5,
                borderRadius: RADIUS.card,
                border: `1.5px dashed ${alpha(BRAND.navy, 0.22)}`,
                bgcolor: alpha('#FFFFFF', 0.6),
                transition: 'border-color .2s ease, background-color .2s ease',
                '&:hover': { borderColor: BRAND.green, bgcolor: '#FFFFFF' },
                '&:active': { transform: 'scale(0.99)' },
                '&:focus-visible': { outline: `2px solid ${BRAND.green}`, outlineOffset: 2 }
            }}
        >
            <IconTile size={52}><AddRoundedIcon /></IconTile>
            <Typography sx={cardTitleSx}>Add a trade</Typography>
            <Typography sx={{ maxWidth: 220, color: BRAND.muted, fontSize: 14, lineHeight: 1.5 }}>
                Offer another service to reach more clients.
            </Typography>
        </ButtonBase>
    );
}

export default AddTradeCard;
