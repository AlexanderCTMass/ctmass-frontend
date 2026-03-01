import { useState } from 'react';
import { Box, Button, Card, TextField, Typography, Unstable_Grid2 as Grid, Alert, Snackbar } from '@mui/material';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import {firestore} from "src/libs/firebase";

export const PostNewsletter = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const handleSubscribe = async (e) => {
        e.preventDefault();

        if (!email || !email.includes('@')) {
            setSnackbar({
                open: true,
                message: 'Please enter a valid email address',
                severity: 'error'
            });
            return;
        }

        setLoading(true);

        try {
            await addDoc(collection(firestore, 'newsletter_subscribers'), {
                email: email,
                subscribedAt: serverTimestamp(),
                status: 'active',
                source: 'blog_post_newsletter'
            });

            setSnackbar({
                open: true,
                message: 'Successfully subscribed to newsletter!',
                severity: 'success'
            });

            setEmail('');
        } catch (error) {
            console.error('Error subscribing to newsletter:', error);
            setSnackbar({
                open: true,
                message: 'Failed to subscribe. Please try again later.',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    return (
        <>
            <Card
                component="form"
                onSubmit={handleSubscribe}
                elevation={16}
                sx={{
                    py: 10,
                    px: 8
                }}
            >
                <Grid
                    container
                    spacing={3}
                >
                    <Grid
                        xs={12}
                        md={6}
                        sx={{
                            order: {
                                xs: 1,
                                md: 0
                            }
                        }}
                    >
                        <Typography variant="h4">
                            Construction Pros & <br/>Homeowners Network
                        </Typography>
                        <Typography color="text.secondary" variant="body2" sx={{ mb: 3, mt: 1 }}>
                            Connect with fellow builders, architects, and homeowners. Get the latest on
                            building codes, sustainable materials, and smart home innovations.
                        </Typography>
                        <TextField
                            fullWidth
                            label="Email address"
                            name="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            required
                            sx={{ flexGrow: 1 }}
                        />
                        <Button
                            fullWidth
                            size="large"
                            type="submit"
                            sx={{ mt: 2 }}
                            variant="contained"
                            disabled={loading}
                        >
                            {loading ? 'Subscribing...' : 'Subscribe'}
                        </Button>
                    </Grid>
                    <Grid
                        xs={12}
                        md={6}
                        sx={{
                            display: 'flex',
                            justifyContent: 'center'
                        }}
                    >
                        <Box
                            component="img"
                            src="/assets/iconly/iconly-glass-volume.svg"
                            sx={{
                                maxWidth: '100%',
                                width: 260
                            }}
                        />
                    </Grid>
                </Grid>
            </Card>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};