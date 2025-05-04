import {useAuth} from "src/hooks/use-auth";
import {CardElement, Elements, useElements, useStripe} from "@stripe/react-stripe-js";
import React, {useState} from "react";
import {getFunctions, httpsCallable} from "firebase/functions";
import {profileApi} from "src/api/profile";
import {increment} from "firebase/firestore";
import {Box, Button, DialogActions, Typography} from "@mui/material";
import {ErrorOutline} from "@mui/icons-material";


const DonateForm = ({amount, onClose, onSuccess}) => {
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
                onSuccess();
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
                <Box
                    sx={{
                        mt: 1,
                        p: 1.5,
                        backgroundColor: 'error.light',
                        color: 'error.main',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}
                >
                    <ErrorOutline fontSize="small"/>
                    <Typography variant="body2">{error}</Typography>
                </Box>
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

export default DonateForm;