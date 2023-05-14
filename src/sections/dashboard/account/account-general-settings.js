import PropTypes from 'prop-types';
import Camera01Icon from '@untitled-ui/icons-react/build/esm/Camera01';
import User01Icon from '@untitled-ui/icons-react/build/esm/User01';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    Stack,
    SvgIcon,
    Switch,
    TextField,
    Typography,
    Unstable_Grid2 as Grid
} from '@mui/material';
import {alpha} from '@mui/material/styles';
import {roles} from "../../../roles";
import {useCallback, useRef, useState} from "react";
import {CustomerEditForm} from "../customer/customer-edit-form";
import {ContactEditForm} from "./general/contact-edit-form";
import {SpecialitiesEditForm} from "./general/specialities-edit-form";
import {getStorage, ref, uploadBytesResumable, getDownloadURL} from "firebase/storage";
import {storage} from "src/libs/firebase";
import {BasicEditForm} from "./general/basic-edit-form";


export const AccountGeneralSettings = (props) => {
    const {
        avatar,
        email,
        name,
        phone,
        address,
        distance,
        userSpecialties,
        handleProfileChange,
        handleAvatarChange
    } = props;

    const fileInputRef = useRef(null);
    const handleAttach = useCallback(() => {
        fileInputRef.current?.click();
    }, []);


    return (
        <Stack
            spacing={4}
            {...props}>
            <Card>
                <CardContent>
                    <Grid
                        container
                        spacing={3}
                    >
                        <Grid
                            xs={12}
                            md={4}
                        >
                            <Typography variant="h6">
                                Basic details
                            </Typography>
                        </Grid>
                        <Grid
                            xs={12}
                            md={8}
                        >
                            <Stack spacing={3}>
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
                                            <Box
                                                sx={{
                                                    alignItems: 'center',
                                                    backgroundColor: (theme) => alpha(theme.palette.neutral[700], 0.5),
                                                    borderRadius: '50%',
                                                    color: 'common.white',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    height: '100%',
                                                    justifyContent: 'center',
                                                    left: 0,
                                                    opacity: 0,
                                                    position: 'absolute',
                                                    top: 0,
                                                    width: '100%',
                                                    zIndex: 1,
                                                    '&:hover': {
                                                        opacity: 1
                                                    }
                                                }}
                                            >
                                                <Stack
                                                    alignItems="center"
                                                    direction="row"
                                                    spacing={1}
                                                >
                                                    <SvgIcon color="inherit">
                                                        <Camera01Icon/>
                                                    </SvgIcon>
                                                    <Typography
                                                        color="inherit"
                                                        variant="subtitle2"
                                                        sx={{fontWeight: 700}}
                                                    >
                                                        Select
                                                    </Typography>
                                                </Stack>
                                            </Box>
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
                                <BasicEditForm name={name} phone={phone} email={email} onSubmit={handleProfileChange}/>
                            </Stack>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
            {/*<Card>
                <CardContent>
                    <Grid
                        container
                        spacing={3}
                    >
                        <Grid
                            xs={12}
                            md={4}
                        >
                            <Typography variant="h6">
                                Public profile
                            </Typography>
                        </Grid>
                        <Grid
                            xs={12}
                            sm={12}
                            md={8}
                        >
                            <Stack
                                divider={<Divider/>}
                                spacing={3}
                            >
                                <Stack
                                    alignItems="flex-start"
                                    direction="row"
                                    justifyContent="space-between"
                                    spacing={3}
                                >
                                    <Stack spacing={1}>
                                        <Typography variant="subtitle1">
                                            Make Contact Info Public
                                        </Typography>
                                        <Typography
                                            color="text.secondary"
                                            variant="body2"
                                        >
                                            Means that anyone viewing your profile will be able to see your contacts
                                            details.
                                        </Typography>
                                    </Stack>
                                    <Switch/>
                                </Stack>
                                <Stack
                                    alignItems="flex-start"
                                    direction="row"
                                    justifyContent="space-between"
                                    spacing={3}
                                >
                                    <Stack spacing={1}>
                                        <Typography variant="subtitle1">
                                            Available to hire
                                        </Typography>
                                        <Typography
                                            color="text.secondary"
                                            variant="body2"
                                        >
                                            Toggling this will let your teammates know that you are available for
                                            acquiring new projects.
                                        </Typography>
                                    </Stack>
                                    <Switch defaultChecked/>
                                </Stack>
                            </Stack>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>*/}
            <Card>
                <CardContent>
                    <Grid
                        container
                        spacing={3}
                    >
                        <Grid
                            xs={12}
                            md={4}
                        >
                            <Stack spacing={1}>
                                <Typography variant="h6">
                                    Address
                                </Typography>
                                <Typography
                                    color="text.secondary"
                                    variant="body2"
                                >
                                    To receive orders nearby, specify the exact address. Other users will not see it, we
                                    will select orders taking into account the specified distance
                                </Typography>
                            </Stack>
                        </Grid>
                        <Grid
                            xs={12}
                            md={8}
                        >
                            <ContactEditForm
                                address={address || ''}
                                distance={distance}
                                onSubmit={handleProfileChange}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    <Grid
                        container
                        spacing={3}
                    >
                        <Grid
                            xs={12}
                            md={4}
                        >
                            <Stack spacing={1}>
                                <Typography variant="h6">
                                    Specialties
                                </Typography>
                                <Typography
                                    color="text.secondary"
                                    variant="body2"
                                >
                                    Specialties are categories of services that you provide.
                                </Typography>
                            </Stack>
                        </Grid>
                        <Grid
                            xs={12}
                            md={8}
                        >
                            <SpecialitiesEditForm userSpecialties={userSpecialties}
                                                  onSubmit={handleProfileChange}/>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    <Grid
                        container
                        spacing={3}
                    >
                        <Grid
                            xs={12}
                            md={4}
                        >
                            <Typography variant="h6">
                                Delete Account
                            </Typography>
                        </Grid>
                        <Grid
                            xs={12}
                            md={8}
                        >
                            <Stack
                                alignItems="flex-start"
                                spacing={3}
                            >
                                <Typography variant="subtitle1">
                                    Delete your account and all of your source data. This is irreversible.
                                </Typography>
                                <Button
                                    color="error"
                                    variant="outlined"
                                >
                                    Delete account
                                </Button>
                            </Stack>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Stack>
    )
        ;
};

AccountGeneralSettings.propTypes = {
    avatar: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
};
