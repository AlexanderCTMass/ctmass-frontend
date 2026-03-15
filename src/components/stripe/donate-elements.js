import { Elements } from "@stripe/react-stripe-js";
import DonateForm from "src/components/stripe/donate-form";
import { loadStripe } from "@stripe/stripe-js";
import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { CircularProgress, Box } from "@mui/material";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const DonateElements = ({ amount, onClose, onSuccess }) => {
    const [clientSecret, setClientSecret] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const auth = getAuth();

    useEffect(() => {
        const createPaymentIntent = async () => {
            try {
                setLoading(true);
                const idToken = await auth.currentUser.getIdToken(true);

                const response = await fetch(`${process.env.REACT_APP_FB_API_URL}/createPaymentIntent`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${idToken}`
                    },
                    body: JSON.stringify({ amount })
                });

                if (!response.ok) {
                    throw new Error('Failed to create payment intent');
                }

                const data = await response.json();
                setClientSecret(data.clientSecret);
            } catch (err) {
                setError(err.message);
                console.error('Error creating payment intent:', err);
            } finally {
                setLoading(false);
            }
        };

        createPaymentIntent();
    }, [amount, auth]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box textAlign="center" color="error.main" p={2}>
                Error: {error}
            </Box>
        );
    }

    const options = {
        clientSecret,
        appearance: {
            theme: 'stripe',
            variables: {
                colorPrimary: '#6772e5',
                colorBackground: '#ffffff',
                colorText: '#424770',
                colorDanger: '#df1b41',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                borderRadius: '8px',
            },
        },
    };

    return (
        <Elements stripe={stripePromise} options={options}>
            <DonateForm amount={amount} onClose={onClose} onSuccess={onSuccess} />
        </Elements>
    );
};

export default DonateElements;