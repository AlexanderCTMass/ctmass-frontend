import { Box, Button, CardContent, CardHeader, InputAdornment, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import DonateElements from "src/components/stripe/donate-elements";

const DonationSection = ({ onClose }) => {
    const [selectedAmount, setSelectedAmount] = useState(null);
    const [customAmount, setCustomAmount] = useState('');
    const [showPaymentForm, setShowPaymentForm] = useState(false);

    const handleAmountSelect = (amount) => {
        setSelectedAmount(amount);
        setCustomAmount('');
    };

    const handleCustomAmountChange = (e) => {
        const value = e.target.value;
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setCustomAmount(value);
            setSelectedAmount(null);
        }
    };

    const handleDonateClick = () => {
        setShowPaymentForm(true);
    };

    const amount = customAmount ? parseFloat(customAmount) : selectedAmount;

    if (showPaymentForm) {
        return (
            <CardContent>
                <DonateElements
                    amount={amount}
                    onClose={() => setShowPaymentForm(false)}
                    onSuccess={onClose}
                />
            </CardContent>
        );
    }

    return (
        <>
            <CardHeader
                title="Thank you for your feedback!"
                subheader="Would you like to support our service?"
            />
            <CardContent>
                <Stack spacing={3}>
                    <Typography variant="body1">
                        If we were able to help you and you'd like to support the development
                        of this service, you can leave a donation below:
                    </Typography>

                    <Stack direction="row" spacing={2} justifyContent="center">
                        {[5, 10, 20].map((value) => (
                            <Button
                                key={value}
                                variant={selectedAmount === value ? 'contained' : 'outlined'}
                                onClick={() => handleAmountSelect(value)}
                            >
                                ${value}
                            </Button>
                        ))}
                    </Stack>

                    <TextField
                        label="Custom amount"
                        value={customAmount}
                        onChange={handleCustomAmountChange}
                        fullWidth
                        InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                        placeholder="Enter amount"
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button onClick={onClose} sx={{ mr: 2 }}>
                            Skip
                        </Button>
                        <Button
                            onClick={handleDonateClick}
                            variant="contained"
                            color="primary"
                            disabled={!amount || amount <= 0}
                        >
                            Donate ${amount?.toFixed(2) || '0.00'}
                        </Button>
                    </Box>
                </Stack>
            </CardContent>
        </>
    );
};

export default DonationSection;