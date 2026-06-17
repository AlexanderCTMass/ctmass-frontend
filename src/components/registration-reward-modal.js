import {
    Box,
    Button,
    Dialog,
    DialogContent,
    Stack,
    Typography
} from '@mui/material';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

export const REGISTRATION_REWARD_KEY = 'ctmass_registration_reward';

export const RegistrationRewardModal = ({ open, onClose, onCreateTrade }) => {
    const { width, height } = useWindowSize();

    return (
        <>
            {open && (
                <Confetti
                    width={width}
                    height={height}
                    recycle={false}
                    numberOfPieces={450}
                    tweenDuration={9000}
                    style={{ position: 'fixed', top: 0, left: 0, zIndex: 2000, pointerEvents: 'none' }}
                />
            )}
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
                <DialogContent sx={{ p: { xs: 3, sm: 5 }, textAlign: 'center' }}>
                    <Stack spacing={2} alignItems="center">
                        <Typography variant="h2" component="div" aria-hidden>
                            🎉
                        </Typography>
                        <Typography variant="h4">Congratulations!</Typography>
                        <Typography variant="h6" color="primary">
                            You&apos;ve earned 20 CTMASS Coins for signing up!
                        </Typography>
                        <Typography color="text.secondary">
                            Spend them in our <Box component="strong">CTMASS Shop</Box> — everything
                            from our branded merch to IT services. You can even offer your own
                            service and we&apos;ll publish it for you.
                        </Typography>
                        <Typography color="text.secondary">
                            Keep working and invite friends to earn even more CTMASS Coins. You can
                            review all coin-earning actions anytime in our CTMASS Shop.
                        </Typography>
                        <Typography sx={{ fontWeight: 600, mt: 4 }}>
                            Now, let&apos;s create your first trade so we can help you find work!
                        </Typography>
                        <Button
                            fullWidth
                            size="large"
                            variant="contained"
                            onClick={onCreateTrade}
                            sx={{ mt: 4 }}
                        >
                            Create trade
                        </Button>
                    </Stack>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default RegistrationRewardModal;
