import React from 'react';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import Button from '@mui/material/Button';
import {useTheme} from '@mui/material/styles';
import {SvgIcon} from "@mui/material";

const WhatsAppButton = ({ phoneNumber, text = 'Message', title = 'Message to WhatsApp' }) => {
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;
    const theme = useTheme();

    return (
        <Button
            component="a"
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="contained"
            color="primary"
            fullWidth
            startIcon={(
                <SvgIcon>
                    <WhatsAppIcon />
                </SvgIcon>
            )}
            sx={{
                textTransform: 'none',
                '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                },
            }}
        >
            {title}
        </Button>
    );
};

export default WhatsAppButton;
