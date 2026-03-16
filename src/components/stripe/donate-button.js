import React, { cloneElement, useState } from 'react';
import {
    Alert,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    InputAdornment,
    Stack,
    TextField,
    Typography,
    Link,
    Grid,
    useMediaQuery,
    useTheme
} from '@mui/material';
import DonateElements from "src/components/stripe/donate-elements";

const DonateButton = ({ triggerComponent = null, onClose = null, ...props }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // mobile < 600px

    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState(10);
    const [customAmount, setCustomAmount] = useState('');
    const [amountError, setAmountError] = useState('');
    const [success, setSuccess] = useState(false);

    const handlePresetAmount = (value) => {
        setAmount(value);
        setCustomAmount('');
        setAmountError('');
    };

    const handleCustomAmount = (e) => {
        const value = e.target.value;
        const sanitizedValue = value.replace(/[^0-9.]/g, '');
        const parts = sanitizedValue.split('.');
        const filteredValue = parts.length > 1
            ? `${parts[0]}.${parts.slice(1).join('')}`
            : parts[0];

        setCustomAmount(filteredValue);

        const numericValue = parseFloat(filteredValue) || 0;

        if (numericValue <= 0) {
            setAmountError('Amount must be greater than 0');
        } else {
            setAmountError('');
            setAmount(numericValue);
        }
    };

    const handleClose = () => {
        setOpen(false);
        setAmountError('');
        if (success) {
            if (onClose) {
                onClose();
            } else {
                window.location.reload();
            }
        }
        setSuccess(false);
    };

    const defaultTrigger = (
        <Button
            variant="contained"
            color="primary"
            sx={{
                backgroundColor: '#6772e5',
                '&:hover': { backgroundColor: '#5469d4' }
            }}
            {...props}
        >
            Support Project
        </Button>
    );

    const triggerElement = triggerComponent
        ? cloneElement(triggerComponent, {
            onClick: () => setOpen(true),
            ...props
        })
        : defaultTrigger;

    return (
        <>
            {triggerElement}

            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        m: isMobile ? 1 : 2, // меньший margin на мобильных
                        borderRadius: 2
                    }
                }}
            >
                <DialogTitle sx={{ textAlign: 'center', pt: isMobile ? 2 : 4 }}>
                    Support Our Project
                </DialogTitle>
                <DialogContent sx={{ p: isMobile ? 2 : 3 }}>
                    <Typography variant="body1" textAlign="center" mb={3}>
                        Your contribution helps us improve and maintain the service
                    </Typography>

                    {/* Адаптивный блок выбора суммы */}
                    <Grid container spacing={2} alignItems="center" mb={3}>
                        {/* Кнопки preset */}
                        <Grid item xs={12} sm={'auto'}>
                            <Stack
                                direction="row"
                                spacing={1}
                                justifyContent={isMobile ? 'center' : 'flex-start'}
                                flexWrap="wrap"
                                useFlexGap
                            >
                                {[5, 10, 20].map((value) => (
                                    <Button
                                        key={value}
                                        variant={amount === value && !customAmount ? 'contained' : 'outlined'}
                                        onClick={() => handlePresetAmount(value)}
                                        sx={{
                                            minWidth: 80,
                                            mb: isMobile ? 1 : 0 // небольшой отступ снизу при переносе
                                        }}
                                    >
                                        ${value}
                                    </Button>
                                ))}
                            </Stack>
                        </Grid>

                        {/* Поле custom amount */}
                        <Grid item xs={12} sm>
                            <TextField
                                fullWidth
                                label="Custom amount"
                                type="number"
                                value={customAmount}
                                onChange={handleCustomAmount}
                                error={!!amountError}
                                helperText={amountError}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                    inputProps: {
                                        min: 0.01,
                                        step: 1
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === '-' || e.key === 'e') {
                                        e.preventDefault();
                                    }
                                }}
                                size={isMobile ? 'small' : 'medium'} // меньший размер поля на мобильных
                            />
                        </Grid>
                    </Grid>

                    {amount <= 0 && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            Please enter a valid donation amount (greater than 0)
                        </Alert>
                    )}

                    {amount > 0 && (
                        <DonateElements amount={amount} onClose={handleClose}
                                        onSuccess={() => setSuccess(true)} />
                    )}

                    <Typography variant="caption" display="block" textAlign="center" mt={2} color="text.secondary">
                        Secure payments processed by{' '}
                        <Link
                            href="https://stripe.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            underline="hover"
                        >
                            Stripe
                        </Link>
                    </Typography>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default DonateButton;