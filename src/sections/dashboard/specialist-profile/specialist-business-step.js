import PropTypes from 'prop-types';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import {
    Avatar,
    Box,
    Button,
    Stack,
    SvgIcon,
    TextField,
    Tooltip,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress
} from '@mui/material';
import {forwardRef, useCallback, useRef, useState} from "react";
import User01Icon from "@untitled-ui/icons-react/build/esm/User01";
import {getDownloadURL, ref, uploadBytes} from "firebase/storage";
import {storage} from "src/libs/firebase";
import {
    RecaptchaVerifier,
    signInWithPhoneNumber,
    updatePhoneNumber,
    PhoneAuthProvider,
    signInWithCredential,
    getAuth
} from "firebase/auth";
import toast from "react-hot-toast";
import {IMaskInput} from 'react-imask';
import {profileApi} from "src/api/profile";

const PhoneMaskInput = forwardRef((props, ref) => {
    const {onChange, ...other} = props;
    return (
        <IMaskInput
            {...other}
            mask="+1 (000) 000-0000"
            definitions={{
                '0': /[0-9]/
            }}
            inputRef={ref}
            onAccept={(value) => onChange({target: {name: props.name, value}})}
            overwrite
        />
    );
});

PhoneMaskInput.propTypes = {
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
};

export const SpecialistBusinessStep = (props) => {
    const {profile, onNext, step=1,...other} = props;
    const [businessName, setBusinessName] = useState(profile.businessName);
    const [phone, setPhone] = useState(profile.phone);
    const [fullName, setFullName] = useState(profile.name);
    const [avatar, setAvatar] = useState(profile.avatar || "");
    const [phoneError, setPhoneError] = useState("");
    const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
    const [verificationCode, setVerificationCode] = useState("");
    const [verificationId, setVerificationId] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [isSendingCode, setIsSendingCode] = useState(false);
    const auth = getAuth();
    const recaptchaVerifierRef = useRef(null);


    const validatePhone = (phoneNumber) => {
        const cleaned = phoneNumber.replace(/\D/g, '');

        if (!cleaned) return ""; // Пустой номер - допустимо

        if (!cleaned.startsWith('1')) {
            return "US phone numbers must start with country code 1";
        }

        if (cleaned.length !== 11) {
            return "US phone number must have 10 digits after country code";
        }

        return "";
    };

    const handlePhoneChange = (e) => {
        const value = e.target.value;
        setPhone(value);
        setPhoneError(validatePhone(value));
    };

    const setupRecaptcha = async () => {
        if (!recaptchaVerifierRef.current) {
            try {
                recaptchaVerifierRef.current = new RecaptchaVerifier(
                    auth,
                    "recaptcha-container",
                    {size: "invisible"}
                );
            } catch (err) {
                console.error("reCAPTCHA initialization error:", err);
                toast.error("Failed to initialize reCAPTCHA. Please reload the page.");
                throw err;
            }
        }
        return recaptchaVerifierRef.current;
    };

    const sendVerificationCode = async () => {
        if (phoneError) {
            toast.error("Please fix phone number errors first");
            return false;
        }

        if (!phone || phone === "+1 (") {
            // Пользователь не ввел телефон - пропускаем верификацию
            return true;
        }

        try {
            setIsSendingCode(true);
            const appVerifier = await setupRecaptcha();
            const phoneNumber = phone.replace(/\D/g, ''); // Чистим номер для Firebase

            const confirmation = await signInWithPhoneNumber(auth, `+${phoneNumber}`, appVerifier);
            setVerificationId(confirmation.verificationId);
            setVerificationDialogOpen(true);
            return false; // Нужна верификация
        } catch (error) {
            console.error("Error sending verification code:", error);
            toast.error(`Failed to send verification code: ${error.message}`);
            return false;
        } finally {
            setIsSendingCode(false);
        }
    };

    const verifyPhoneNumber = async () => {
        if (!verificationCode) {
            toast.error("Please enter verification code");
            return false;
        }

        try {
            setIsVerifying(true);
            const credential = PhoneAuthProvider.credential(verificationId, verificationCode);

            // Если пользователь уже аутентифицирован (через Google/Facebook)
            if (auth.currentUser) {
                await updatePhoneNumber(auth.currentUser, credential);

                // Проверяем, совпадает ли email с профилем
                if (auth.currentUser.email === profile.email) {
                    toast.success("Phone number verified and linked to your account!");
                    return true;
                } else {
                    toast.error("This phone number doesn't match your account email");
                    return false;
                }
            } else {
                // Если пользователь не аутентифицирован (маловероятно в этом компоненте)
                await signInWithCredential(auth, credential);
                toast.success("Phone number verified!");
                return true;
            }
        } catch (error) {
            console.error("Error verifying code:", error);
            toast.error(`Verification failed: ${error.message}`);
            return false;
        } finally {
            setIsVerifying(false);
        }
    };

    const handleOnNext = async () => {
        // Проверяем обязательные поля
        if (!businessName || !fullName) {
            toast.error("Please fill all required fields");
            return;
        }

        // Если телефон не изменился или пустой - пропускаем верификацию
        if ((!phone || phone === "+1 (") || phone === profile.phone) {
            proceedWithUpdate();
            return;
        }

        // Проверяем существование телефона в базе
        const isPhoneExist = await profileApi.checkExistPhone(phone, profile.id);
        if (isPhoneExist) {
            toast.error("Phone number is already registered");
            setPhoneError("Phone number is already registered");
            return;
        }

        // Запускаем процесс верификации
        const canSkipVerification = await sendVerificationCode();
        if (canSkipVerification) {
            proceedWithUpdate();
        }
    };

    const proceedWithUpdate = async (verifiedPhone = phone) => {
        if (profile.name === fullName && profile.avatar === avatar &&
            profile.businessName === businessName && profile.phone === verifiedPhone) {
            onNext();
        } else {
            const changed = {
                name: fullName,
                businessName: businessName,
                avatar: avatar,
                phone: verifiedPhone,
                ...(step && {profileDataProgress: step})
            };
            onNext(changed);
        }
    };

    const handleVerifyAndContinue = async () => {
        const isVerified = await verifyPhoneNumber();
        if (isVerified) {
            setVerificationDialogOpen(false);
            proceedWithUpdate(phone); // Используем текущий номер телефона
        }
    };

    const handleSkipVerification = () => {
        setVerificationDialogOpen(false);
        setPhone(""); // Сбрасываем телефон, так как он не верифицирован
        proceedWithUpdate(""); // Продолжаем без телефона
    };

    const fileInputRef = useRef(null);
    const handleAttach = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleAvatarChange = useCallback(async (e) => {
        try {
            if (e.target.files) {
                const file = e.target.files[0];
                const storageRef = ref(storage, '/avatar/' + profile.id + '-' + file.name);
                await uploadBytes(storageRef, file);
                const url = await getDownloadURL(storageRef);
                setAvatar(url);
                toast.success("Image uploaded successfully!");
            }
        } catch (err) {
            console.error(err);
            toast.error('Something went wrong!');
        }
    }, [setAvatar, profile]);

    return (
        <Stack spacing={3} {...other}>

                <div>
                    <Typography variant="h6">Stand out to customers</Typography>
                    <Typography variant="body2">
                        Add a few details to your profile, to help customers get to know you better.
                    </Typography>
                </div>

            <Tooltip
                title={"Enter your first and last name as you would like them to appear in official communications"}>
                <TextField
                    error={!fullName}
                    helperText={!fullName && "Required to fill"}
                    fullWidth
                    label="Your full name"
                    name="fullname"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                />
            </Tooltip>

            <Tooltip title={"This is the name that will be displayed to other users on the platform"}>
                <TextField
                    error={!businessName}
                    helperText={!businessName && "Required to fill"}
                    fullWidth
                    label="Business name"
                    name="jobTitle"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                />
            </Tooltip>

            <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={phone}
                onChange={handlePhoneChange}
                error={!!phoneError}
                helperText={phoneError || "Optional, but recommended for business communications"}
                placeholder="+1 (123) 456-7890"
                InputProps={{
                    inputComponent: PhoneMaskInput,
                }}
            />

            <div>
                <Typography variant="body2">
                    And add your business logo or avatar:
                </Typography>
            </div>

            <Stack alignItems="center" direction="row" spacing={2}>
                <Box
                    sx={{
                        borderColor: 'neutral.300',
                        borderRadius: '50%',
                        borderStyle: 'dashed',
                        borderWidth: 1,
                        p: '4px'
                    }}
                >
                    <Box
                        sx={{
                            borderRadius: '50%',
                            height: '100%',
                            width: '100%',
                            position: 'relative'
                        }}
                    >
                        <Avatar
                            src={avatar}
                            sx={{
                                height: 100,
                                width: 100
                            }}
                        >
                            <SvgIcon>
                                <User01Icon/>
                            </SvgIcon>
                        </Avatar>
                    </Box>
                </Box>
                <Button
                    color="inherit"
                    size="small"
                    onClick={handleAttach}
                >
                    Change
                </Button>
                <input
                    hidden
                    ref={fileInputRef}
                    type="file"
                    onChange={handleAvatarChange}
                />
            </Stack>

            <div id="recaptcha-container"></div>

            <Stack alignItems="center" direction="row" spacing={2}>
                <Button
                    endIcon={(
                        <SvgIcon>
                            <ArrowRightIcon/>
                        </SvgIcon>
                    )}
                    onClick={handleOnNext}
                    variant="contained"
                    disabled={!businessName || !fullName || !!phoneError || isSendingCode}
                >
                    {isSendingCode ? <CircularProgress size={24}/> : (!step ? "Save" : "Next")}
                </Button>
            </Stack>

            {/* Диалог верификации */}
            <Dialog open={verificationDialogOpen} onClose={() => setVerificationDialogOpen(false)}>
                <DialogTitle>Verify Phone Number</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{mb: 2}}>
                        We've sent a verification code to {phone}. Please enter it below:
                    </Typography>
                    <TextField
                        fullWidth
                        label="Verification Code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        disabled={isVerifying}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleSkipVerification} disabled={isVerifying}>
                        Skip Verification
                    </Button>
                    <Button
                        onClick={handleVerifyAndContinue}
                        disabled={isVerifying || !verificationCode}
                        variant="contained"
                    >
                        {isVerifying ? <CircularProgress size={24}/> : "Verify & Continue"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
};

SpecialistBusinessStep.propTypes = {
    onBack: PropTypes.func,
    onNext: PropTypes.func,
    profile: PropTypes.object.isRequired
};