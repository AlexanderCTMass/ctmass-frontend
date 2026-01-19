import PropTypes from 'prop-types';
import {
    Button,
    Paper,
    Stack,
    Typography
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import MessageIcon from '@mui/icons-material/Message';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import { PopoverMenu } from 'src/components/popover-menu';

const CTASection = ({
    phone,
    onCall,
    onSendMessage,
    requestItems
}) => {
    const hasRequestOptions = Array.isArray(requestItems) && requestItems.length > 0;

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                p: { xs: 3, md: 4 }
            }}
        >
            <Stack spacing={2.5}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <ContactPhoneIcon color="primary" />
                    <Typography variant="h6" fontWeight={700}>
                        Ready to start your project?
                    </Typography>
                </Stack>

                <Typography variant="body2" color="text.secondary">
                    Contact this professional to discuss your project or request a booking.
                </Typography>

                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={2}
                    alignItems={{ xs: 'stretch', md: 'center' }}
                >
                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<PhoneIcon />}
                        disabled={!phone}
                        onClick={onCall}
                        sx={{ minWidth: 160 }}
                    >
                        Call now
                    </Button>

                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<MessageIcon />}
                        disabled={!onSendMessage}
                        onClick={onSendMessage}
                        sx={{ minWidth: 160 }}
                    >
                        Send message
                    </Button>

                    {hasRequestOptions && (
                        <PopoverMenu
                            title="Request booking"
                            icon={<EventAvailableIcon />}
                            variant="contained"
                            fullWidth={false}
                            items={requestItems}
                        />
                    )}
                </Stack>
            </Stack>
        </Paper>
    );
};

CTASection.propTypes = {
    phone: PropTypes.string,
    onCall: PropTypes.func,
    onSendMessage: PropTypes.func,
    requestItems: PropTypes.arrayOf(
        PropTypes.shape({
            title: PropTypes.string.isRequired,
            onClick: PropTypes.func.isRequired
        })
    )
};

CTASection.defaultProps = {
    phone: '',
    onCall: undefined,
    onSendMessage: undefined,
    requestItems: []
};

export default CTASection;