import PropTypes from 'prop-types';
import {Card, CardContent, Stack, Switch, Typography, Unstable_Grid2 as Grid} from '@mui/material';
import {useCallback, useRef} from "react";
import {AddressEditForm} from "./general/address-edit-form";
import {SpecialitiesEditForm} from "./general/specialities-edit-form";

export const AccountSpecialistSettings = (props) => {
    const {
        userId,
        address,
        publicProfile, openToWork,
        userSpecialties,
        handleProfileChange
    } = props;

    const fileInputRef = useRef(null);
    const handleAttach = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    return (
        <Stack
            spacing={4}
            {...props}>

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
                                <Switch checked={publicProfile} onChange={(e) => {
                                    handleProfileChange({"publicProfile": e.target.checked})
                                }}/>
                            </Stack>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>*/}
           {/* <Card>
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
                                Current status
                            </Typography>
                        </Grid>
                        <Grid
                            xs={12}
                            sm={12}
                            md={8}
                        >
                            <Stack
                                alignItems="center"
                                direction="row"
                                justifyContent="flex-start"
                                spacing={1}
                            >
                                <Typography variant={openToWork ? "subtitle2" : "subtitle1"}
                                            color={openToWork ? "text.secondary" : "text.primary"}>
                                    Busy
                                </Typography>
                                <Switch checked={openToWork} id={"openToWork"} name={"openToWork"} onChange={(e) => {
                                    console.log({"openToWork": e.target.checked});
                                    handleProfileChange({"openToWork": e.target.checked})
                                }}/>
                                <Typography variant={!openToWork ? "subtitle2" : "subtitle1"}
                                            color={!openToWork ? "text.secondary" : "text.primary"}>
                                    Open to work
                                </Typography>
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
                            <AddressEditForm
                                address={address}
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
                                                  onSubmit={handleProfileChange}
                                                  userId={userId}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Stack>
    );
};

AccountSpecialistSettings.propTypes = {
    avatar: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
};
