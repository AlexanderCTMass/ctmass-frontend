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
export const LOGIN_TRADE_PROMPT_KEY = 'ctmass_login_trade_prompt';

export const RegistrationRewardModal = ({ open, onClose, onCreateTrade, showSignupReward = true }) => {
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
                <DialogContent sx={{ p: { xs: 2.5, sm: 5 }, textAlign: 'center' }}>
                    <Stack spacing={{ xs: 1.25, sm: 2 }} alignItems="center">
                        <Typography
                            component="div"
                            aria-hidden
                            sx={{ fontSize: { xs: 40, sm: 56 }, lineHeight: 1 }}
                        >
                            🎉
                        </Typography>
                        <Typography sx={{ fontSize: { xs: 22, sm: 30 }, fontWeight: 700 }}>
                            Congratulations!
                        </Typography>
                        {showSignupReward && (
                            <Typography
                                color="primary"
                                sx={{ fontSize: { xs: 16, sm: 20 }, fontWeight: 600 }}
                            >
                                You&apos;ve earned 20 CTMASS Coins for signing up!
                            </Typography>
                        )}
                        <Typography
                            color="text.secondary"
                            sx={{ fontSize: { xs: 13, sm: 16 } }}
                        >
                            Spend them in our <Box component="strong">CTMASS Shop</Box> — everything
                            from our branded merch to IT services. You can even offer your own
                            service and we&apos;ll publish it for you.
                        </Typography>
                        <Typography
                            color="text.secondary"
                            sx={{ fontSize: { xs: 13, sm: 16 } }}
                        >
                            Keep working and invite friends to earn even more CTMASS Coins. You can
                            review all coin-earning actions anytime in our CTMASS Shop.
                        </Typography>
                        <Typography sx={{ fontWeight: 600, fontSize: { xs: 14, sm: 16 }, mt: { xs: 1.5, sm: 4 } }}>
                            Now, let&apos;s create your first trade so we can help you find work!
                        </Typography>
                        <Button
                            fullWidth
                            size="large"
                            variant="contained"
                            onClick={onCreateTrade}
                            sx={{ mt: { xs: 1.5, sm: 4 } }}
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
