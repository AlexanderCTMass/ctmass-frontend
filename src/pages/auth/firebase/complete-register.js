import {useEffect, useState} from 'react';
import {
    Alert,
    Box,
    Card,
    CardContent,
    CardHeader,
    Stack,
    Typography,
    CircularProgress
} from '@mui/material';
import {RouterLink} from 'src/components/router-link';
import {Seo} from 'src/components/seo';
import {useAuth} from 'src/hooks/use-auth';
import {useSearchParams} from 'src/hooks/use-search-params';
import {paths} from 'src/paths';
import {getAuth, isSignInWithEmailLink} from 'firebase/auth';
import {useNavigate} from 'react-router-dom';

const SuccessRegisterPage = () => {
    const {issuer, signInWithEmailLink} = useAuth();

    const searchParams = useSearchParams();
    const email = window.localStorage.getItem('emailForSignIn');
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const processEmailLink = async () => {
            const auth = getAuth();

            if (isSignInWithEmailLink(auth, window.location.href) && email) {
                try {
                    setIsProcessing(true);
                    const result = await signInWithEmailLink(email, window.location.href);
                    if (!result) {
                        return;
                    }
                    window.localStorage.removeItem('emailForSignIn');

                    // Перенаправляем после успешной аутентификации
                    const returnTo = searchParams.get('returnTo') ||
                        (searchParams.get('isServiceProvider') === 'true'
                            ? paths.cabinet.profiles.specialistCreateWizard
                            : paths.cabinet.projects.customer);
                    navigate(returnTo);
                } catch (error) {
                    console.error('Error processing email link:', error);
                    setIsProcessing(false);
                }
            }
        };

        processEmailLink();
    }, [signInWithEmailLink, navigate, searchParams]);

    return (
        <>
            <Seo title="Registration Successful"/>
            <div>
                <Card elevation={4}>
                    <CardHeader
                        sx={{pb: 0}}
                        title="Registration Successful"
                    />
                    <CardContent>
                        <Stack spacing={3}>
                            {isProcessing ? (
                                <>
                                    <Alert severity="info">
                                        Completing your registration...
                                    </Alert>
                                    <Box display="flex" justifyContent="center">
                                        <CircularProgress/>
                                    </Box>
                                </>
                            ) : (
                                <Alert severity="success">
                                    <Typography variant="body1" gutterBottom>
                                        Thank you for registering!
                                    </Typography>
                                    <Typography variant="body2">
                                        We've sent a confirmation email to <strong>{email}</strong>.
                                        Please check your inbox and click the link to complete your registration.
                                    </Typography>
                                    {searchParams.get('phone') && (
                                        <Typography variant="body2" sx={{mt: 1}}>
                                            After email verification, you'll be able to verify your phone number
                                            for additional security.
                                        </Typography>
                                    )}
                                </Alert>
                            )}
                        </Stack>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default SuccessRegisterPage;