import React, {useState} from 'react';
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Typography,
    Box,
    Chip
} from '@mui/material';
import {loadStripe} from '@stripe/stripe-js';
import {Elements, CardElement, useStripe, useElements} from '@stripe/react-stripe-js';
import {getFunctions, httpsCallable} from 'firebase/functions';
import {getFirestore, doc, updateDoc, increment} from 'firebase/firestore';
import {useAuth} from "src/hooks/use-auth";
import {profileApi} from "src/api/profile";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const DonateForm = ({amount, onClose}) => {
    const {user} = useAuth();
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stripe || !elements) return;

        setLoading(true);
        setError(null);

        try {
            const functions = getFunctions();
            const createPaymentIntent = httpsCallable(functions, 'createStripePaymentIntent');
            const {data: {clientSecret}} = await createPaymentIntent({amount});

            const {error: stripeError, paymentIntent} = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        name: user?.businessName || 'Anonymous',
                    },
                }
            });

            if (stripeError) {
                throw stripeError;
            }

            if (paymentIntent.status === 'succeeded') {
                if (user) {
                    await profileApi.update(user.id, {
                        totalDonations: increment(amount),
                        lastDonation: new Date(),
                        isSupporter: true
                    })
                }

                setSuccess(true);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <Box textAlign="center">
                <Typography variant="h5" color="success.main" gutterBottom>
                    Thank you for your support!
                </Typography>
                <Typography>
                    Your donation of ${amount.toFixed(2)} has been processed successfully.
                </Typography>
                <Box mt={2}>
                    <Chip label="Supporter" color="primary"/>
                </Box>
                <DialogActions sx={{justifyContent: 'center', mt: 2}}>
                    <Button onClick={onClose} variant="contained">Close</Button>
                </DialogActions>
            </Box>
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            <Typography variant="subtitle1" gutterBottom>
                Payment details
            </Typography>
            <CardElement options={{
                style: {
                    base: {
                        fontSize: '16px',
                        '::placeholder': {
                            color: '#aab7c4',
                        },
                    },
                },
                hidePostalCode: true // Для США можно скрыть почтовый индекс
            }}/>

            {error && (
                <Typography color="error" sx={{mt: 2}}>
                    Payment error: {error}
                </Typography>
            )}

            <DialogActions sx={{mt: 3}}>
                <Button onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={loading}
                    variant="contained"
                    color="primary"
                    sx={{minWidth: 120}}
                >
                    {loading ? 'Processing...' : `Donate $${amount.toFixed(2)}`}
                </Button>
            </DialogActions>
        </form>
    );
};

const DonateButton = () => {
    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState(10);
    const [customAmount, setCustomAmount] = useState('');

    const handlePresetAmount = (value) => {
        setAmount(value);
        setCustomAmount('');
    };

    const handleCustomAmount = (e) => {
        const value = parseFloat(e.target.value) || 0;
        setCustomAmount(e.target.value);
        if (value >= 1) {
            setAmount(value);
        }
    };

    return (
        <>
            <Button
                variant="contained"
                color="primary"
                onClick={() => setOpen(true)}
                sx={{
                    backgroundColor: '#6772e5', // Stripe-like color
                    '&:hover': {backgroundColor: '#5469d4'}
                }}
            >
                Support Project
            </Button>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{textAlign: 'center', pt: 4}}>
                    Support Our Project
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" textAlign="center" mb={3}>
                        Your contribution helps us improve and maintain the service
                    </Typography>

                    <Box display="flex" justifyContent="center" gap={2} mb={3}>
                        {[5, 10, 20].map((value) => (
                            <Button
                                key={value}
                                variant={amount === value && !customAmount ? 'contained' : 'outlined'}
                                onClick={() => handlePresetAmount(value)}
                                sx={{minWidth: 80}}
                            >
                                ${value}
                            </Button>
                        ))}
                    </Box>

                    <TextField
                        fullWidth
                        label="Custom amount"
                        type="number"
                        value={customAmount}
                        onChange={handleCustomAmount}
                        InputProps={{
                            startAdornment: '$',
                            inputProps: {min: 1, step: 1}
                        }}
                        sx={{mb: 3}}
                    />

                    <Elements stripe={stripePromise}>
                        <DonateForm amount={amount} onClose={() => setOpen(false)}/>
                    </Elements>

                    <Typography variant="caption" display="block" textAlign="center" mt={2} color="text.secondary">
                        Secure payments processed by Stripe
                    </Typography>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default DonateButton;