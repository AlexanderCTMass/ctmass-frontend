import PropTypes from 'prop-types';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import {Avatar, Box, Button, Stack, SvgIcon, TextField, Tooltip, Typography} from '@mui/material';
import {useCallback, useRef, useState} from "react";
import User01Icon from "@untitled-ui/icons-react/build/esm/User01";
import {getDownloadURL, ref, uploadBytes} from "firebase/storage";
import {storage} from "../../../libs/firebase";
import toast from "react-hot-toast";

export const SpecialistBusinessStep = (props) => {
    const {profile, onNext, ...other} = props;
    const [businessName, setBusinessName] = useState(profile.businessName);
    const [phone, setPhone] = useState(profile.phone);
    const [fullName, setFullName] = useState(profile.name);
    const [avatar, setAvatar] = useState(profile.avatar || "");
    const handleOnNext = () => {
        if (profile.name === fullName && profile.avatar === avatar && profile.businessName === businessName && profile.phone === phone)
            onNext();
        else
            onNext({
                name: fullName,
                businessName: businessName,
                avatar: avatar,
                phone: phone,
                profileDataProgress: 1
            });
    }

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
                        toast.success("Images upload successfully!");
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
            <Tooltip title={"Enter your first and last name as you would like them to appear in official communications"}>
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
                onChange={(e) => {
                    setPhone(e.target.value)
                }}
            />
            <div>
                <Typography variant="body2">
                    And add your business logo or avatar:
                </Typography>
            </div>
            <Stack
                alignItems="center"
                direction="row"
                spacing={2}
            >
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
                    disabled={!businessName}
                >
                    Continue
                </Button>
            </Stack>
        </Stack>
    );
};

SpecialistBusinessStep.propTypes = {
    onBack: PropTypes.func,
    onNext: PropTypes.func
};
