import PropTypes from 'prop-types';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import {Avatar, Box, Button, Stack, SvgIcon, TextField, Tooltip, Typography} from '@mui/material';
import {forwardRef, useCallback, useRef, useState} from "react";
import User01Icon from "@untitled-ui/icons-react/build/esm/User01";
import {getDownloadURL, ref, uploadBytes} from "firebase/storage";
import {storage} from "src/libs/firebase";
import toast from "react-hot-toast";
import {IMaskInput} from 'react-imask';
import {profileApi} from "src/api/profile";

// Компонент с маской для телефона
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
    const {profile, onNext, ...other} = props;
    const [businessName, setBusinessName] = useState(profile.businessName);
    const [phone, setPhone] = useState(profile.phone || "+1 (");
    const [fullName, setFullName] = useState(profile.name);
    const [avatar, setAvatar] = useState(profile.avatar || "");
    const [phoneError, setPhoneError] = useState("");

    const validatePhone = (phoneNumber) => {
        // Удаляем все нецифровые символы
        const cleaned = phoneNumber.replace(/\D/g, '');

        // Проверяем что номер начинается с 1 (код США) и имеет 11 цифр
        if (!cleaned.startsWith('1')) {
            return "US phone numbers must start with country code 1";
        }

        // Проверяем полную длину (1 код страны + 10 цифр номера)
        if (cleaned.length !== 11) {
            return "US phone number must have 10 digits after country code";
        }

        return "";
    };

    const handlePhoneChange = (e) => {
        const value = e.target.value;
        setPhone(value);

        // Валидация только если поле не пустое
        if (value) {
            setPhoneError(validatePhone(value));
        } else {
            setPhoneError("");
        }
    };

    const handleOnNext = async () => {
        // Проверяем валидность телефона перед продолжением
        if (phone) {
            if (phoneError) {
                toast.error("Please enter a valid phone number");
                return;
            }

            const isPhoneExist = await profileApi.checkExistPhone(phone, profile.id);
            if (isPhoneExist) {
                toast.error("Phone number is already registered");
                setPhoneError("Phone number is already registered");
                return;
            }
        }

        if (profile.name === fullName && profile.avatar === avatar &&
            profile.businessName === businessName && profile.phone === phone) {
            onNext();
        } else {
            onNext({
                name: fullName,
                businessName: businessName,
                avatar: avatar,
                phone: phone,
                profileDataProgress: 1
            });
        }
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
                uploadBytes(storageRef, file).then((snapshot) => {
                    getDownloadURL(storageRef).then((url) => {
                        setAvatar(url);
                        toast.success("Image uploaded successfully!");
                    })
                });
            }
        } catch (err) {
            console.error(err);
            toast.error('Something went wrong!');

        }
    }, [setAvatar, profile]);


    return (
        <Stack
            spacing={3}
            {...other}>
            <div>
                <Typography variant="h6">
                    Stand out to customers
                </Typography>
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
                    defaultValue={fullName}
                    onChange={(e) => {
                        setFullName(e.target.value)
                    }}
                />
            </Tooltip>
            <Tooltip title={"This is the name that will be displayed to other users on the platform"}>
                <TextField
                    error={!businessName}
                    helperText={!businessName && "Required to fill"}
                    fullWidth
                    label="Business name"
                    name="jobTitle"
                    defaultValue={businessName}
                    onChange={(e) => {
                        setBusinessName(e.target.value)
                    }}
                />
            </Tooltip>
            <TextField
                fullWidth
                label="Phone"
                name="phone"
                defaultValue={phone}
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

            <Stack
                alignItems="center"
                direction="row"
                spacing={2}
            >
                <Button
                    endIcon={(
                        <SvgIcon>
                            <ArrowRightIcon/>
                        </SvgIcon>
                    )}
                    onClick={handleOnNext}
                    variant="contained"
                    disabled={!businessName || !!phoneError}
                >
                    Continue
                </Button>
            </Stack>
        </Stack>
    );
};

SpecialistBusinessStep.propTypes = {
    onBack: PropTypes.func,
    onNext: PropTypes.func,
    profile: PropTypes.object.isRequired
};
