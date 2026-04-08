import React, { useState, useRef, useEffect } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import { isValidUSPhone } from 'src/utils/validation/phone';
// import {auth} from '../firebase';
// import {RecaptchaVerifier, signInWithPhoneNumber} from 'firebase/auth';

const PhoneInput = ({ onVerified }) => {
    const [phone, setPhone] = useState('');
    const [rawPhone, setRawPhone] = useState('');
    const [code, setCode] = useState('');
    const [step, setStep] = useState('enter-phone');
    const [error, setError] = useState('');
    const confirmationRef = useRef(null);
    const inputRef = useRef(null);

    // Форматирование телефона для отображения
    const formatPhone = (value) => {
        if (!value) return '';

        const cleaned = value.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);

        if (match) {
            return !match[2]
                ? `(${match[1]}`
                : `(${match[1]}) ${match[2]}${match[3] ? `-${match[3]}` : ''}`;
        }

        return value;
    };

    // Обработчик изменения телефона
    const handlePhoneChange = (e) => {
        const input = e.target.value.replace(/\D/g, '');
        if (input.length <= 10) {
            setRawPhone(input);
            setPhone(formatPhone(input));
        }
    };

    // Проверка валидности телефона
    const isValidPhone = () => {
        return isValidUSPhone(`1${rawPhone}`);
    };

    // Отправка SMS
    const sendCode = async () => {
        if (!isValidPhone()) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }

        try {
            /*const appVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                size: 'normal',
            });

            const fullPhone = `+1${rawPhone}`;
            const confirmation = await signInWithPhoneNumber(
                auth,
                fullPhone,
                appVerifier
            );

            confirmationRef.current = confirmation;*/
            setStep('enter-code');
            setError('');
        } catch (err) {
            setError(err.message);
            console.error('Error sending SMS:', err);
        }
    };

    // Проверка кода
    const verifyCode = async () => {
        try {
            await confirmationRef.current.confirm(code);
            onVerified(`+1${rawPhone}`);
            setStep('verified');
        } catch (err) {
            setError('Invalid verification code');
        }
    };

    // Автофокус на поле ввода кода
    useEffect(() => {
        if (step === 'enter-code') {
            setTimeout(() => {
                const codeInput = document.getElementById('verification-code');
                if (codeInput) codeInput.focus();
            }, 300);
        }
    }, [step]);

    return (
        <Box sx={{ maxWidth: 400, mx: 'auto', p: 2 }}>
            {step === 'enter-phone' && (
                <>
                    <TextField
                        fullWidth
                        label="US Phone Number"
                        value={phone}
                        onChange={handlePhoneChange}
                        placeholder="(123) 456-7890"
                        inputRef={inputRef}
                        inputProps={{
                            inputMode: 'tel',
                            pattern: '[0-9]*',
                        }}
                        error={!!error}
                        helperText={error || "Enter 10-digit US phone number"}
                        sx={{ mb: 2 }}
                    />

                    <Button
                        fullWidth
                        variant="contained"
                        onClick={sendCode}
                        disabled={!isValidPhone()}
                    >
                        Send Verification Code
                    </Button>
                </>
            )}

            {step === 'enter-code' && (
                <>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        We sent a code to {phone}
                    </Typography>

                    <TextField
                        fullWidth
                        id="verification-code"
                        label="Verification Code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        inputProps={{
                            inputMode: 'numeric',
                            pattern: '[0-9]*',
                        }}
                        error={!!error}
                        helperText={error}
                        sx={{ mb: 2 }}
                    />

                    <Button
                        fullWidth
                        variant="contained"
                        onClick={verifyCode}
                        disabled={code.length < 6}
                    >
                        Verify Code
                    </Button>
                </>
            )}

            {step === 'verified' && (
                <Typography variant="body1" color="success.main">
                    Phone number verified successfully!
                </Typography>
            )}

            <div id="recaptcha-container" style={{ marginTop: 16 }}></div>
        </Box>
    );
};

export default PhoneInput;