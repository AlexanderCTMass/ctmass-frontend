import { useAuth } from "src/hooks/use-auth";
import {
    CardCvcElement,
    CardExpiryElement,
    CardNumberElement,
    useElements,
    useStripe
} from "@stripe/react-stripe-js";
import React, { useState } from "react";
import { profileApi } from "src/api/profile";
import { increment } from "firebase/firestore";
import { Box, Button, DialogActions, Typography } from "@mui/material";
import { ErrorOutline } from "@mui/icons-material";
import CardInput from "src/components/stripe/card-inputs";
import {getAuth} from "firebase/auth";

const DonateForm = ({ amount, onClose, onSuccess }) => {
    const { user } = useAuth();
    const auth = getAuth();
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
            // 1. Получаем clientSecret через наш проксированный эндпоинт
            const idToken = await auth.currentUser.getIdToken(true);

            const response = await fetch('/createPaymentIntent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}` // Правильный формат
                },
                body: JSON.stringify({ amount })
            });

            if (!response.ok) {
                throw new Error('Failed to create payment intent');
            }

            const { clientSecret } = await response.json();

            // 2. Создаем PaymentMethod
            const { paymentMethod, error: pmError } = await stripe.createPaymentMethod({
                type: 'card',
                card: elements.getElement(CardNumberElement),
                billing_details: {
                    name: user?.businessName || 'Anonymous',
                },
            });

            if (pmError) throw pmError;

            // 3. Подтверждаем платеж
            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
                clientSecret,
                {
                    payment_method: paymentMethod.id,
                }
            );

            if (stripeError) throw stripeError;

            // 4. Обработка успешного платежа
            if (paymentIntent?.status === 'succeeded') {
                await profileApi.update(user.id, {
                    totalDonations: increment(amount),
                    lastDonation: new Date(),
                    isSupporter: true
                });

                setSuccess(true);
                onSuccess();
            }
        } catch (err) {
            setError(err.message || 'Payment failed');
            console.error('Payment error:', err);
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
                <DialogActions sx={{ justifyContent: 'center', mt: 2 }}>
                    <Button onClick={onClose} variant="contained">Close</Button>
                </DialogActions>
            </Box>
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            <CardInput />

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
                    <ErrorOutline fontSize="small" />
                    <Typography variant="body2">{error}</Typography>
                </Box>
            )}

            <DialogActions sx={{ mt: 3 }}>
                <Button onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={loading}
                    variant="contained"
                    color="primary"
                    sx={{ minWidth: 120 }}
                >
                    {loading ? 'Processing...' : `Donate $${amount.toFixed(2)}`}
                </Button>
            </DialogActions>
        </form>
    );
};

export default DonateForm;