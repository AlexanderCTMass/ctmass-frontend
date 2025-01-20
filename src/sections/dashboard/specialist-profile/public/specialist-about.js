import PropTypes from 'prop-types';
import Home02Icon from '@untitled-ui/icons-react/build/esm/Home02';
import Mail01Icon from '@untitled-ui/icons-react/build/esm/Mail01';
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Link,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Rating,
    Stack,
    SvgIcon,
    Typography,
    useMediaQuery
} from '@mui/material';
import * as React from "react";
import ReviewsOutlinedIcon from '@mui/icons-material/ReviewsOutlined';
import PhoneIcon from '@mui/icons-material/Phone';
import CertificatesCarousel from "./CertificatesCarousel";


export const SpecialistAbout = (props) => {
    const {
        profile,
        userSpecialties,
        isOwner,
        isCustomer,
        currentCity,
        currentJobCompany,
        currentJobTitle,
        email,
        phone,
        originCity,
        previousJobCompany,
        previousJobTitle,
        profileProgress,
        quote,
        profileRating, profileRatingCounts,
        ...other
    } = props;

    const filteredUserSpecialties = isOwner ? userSpecialties : userSpecialties.filter((spc) => spc && spc.accepted);
    const smUp = useMediaQuery((theme) => theme.breakpoints.up('sm'));

    return (
        <Stack
            spacing={3}
            {...other}>
            <Card>
                <CardHeader title="About"/>
                <CardContent>
                    {!isCustomer &&
                        <Typography
                            color="text.secondary"
                            sx={{mb: 2}}
                            variant="subtitle2"
                        >
                            <div dangerouslySetInnerHTML={{__html: profile.description}}/>
                        </Typography>}

                    <List disablePadding>
                        {(isOwner || profile.publicProfile) && profile.address &&
                            <ListItem
                                disableGutters
                                divider
                                key={Math.random()}
                            >
                                <ListItemAvatar>
                                    <SvgIcon color="action">
                                        <Home02Icon/>
                                    </SvgIcon>
                                </ListItemAvatar>
                                <ListItemText
                                    disableTypography
                                    primary={(
                                        <Typography variant="subtitle2">
                                            <Link
                                                color="text.primary"
                                                href="#"
                                                variant="subtitle2"
                                            >
                                                {(profile.address && profile.address.location) ? profile.address.location.place_name : ""}
                                            </Link>
                                        </Typography>
                                    )}
                                    secondary={(
                                        <Typography
                                            color="text.secondary"
                                            variant="body2"
                                        >
                                            {profile.address.profile}
                                            {' '}
                                            no longer than
                                            {' '}
                                            {profile.address.duration}
                                            {' '}
                                            minutes
                                        </Typography>
                                    )}
                                />
                            </ListItem>}
                        {(isOwner || profile.publicProfile) &&
                            (<>
                                {profile.email && <ListItem disableGutters alignItems={"center"} divider>
                                    <ListItemAvatar>
                                        <SvgIcon color="action">
                                            <Mail01Icon/>
                                        </SvgIcon>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={(
                                            <Typography variant="subtitle2">
                                                {email}
                                            </Typography>
                                        )}
                                    />
                                </ListItem>}
                                {profile.phone &&
                                    <ListItem disableGutters alignItems={"center"} divider>
                                        <ListItemAvatar>
                                            <SvgIcon color="action">
                                                <PhoneIcon/>
                                            </SvgIcon>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={(
                                                <Typography variant="subtitle2">
                                                    {phone}
                                                </Typography>
                                            )}
                                        />
                                    </ListItem>}
                            </>)}
                        {!isCustomer &&
                            <ListItem disableGutters>
                                <ListItemAvatar>
                                    <SvgIcon color="action">
                                        <ReviewsOutlinedIcon/>
                                    </SvgIcon>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={(
                                        <Stack direction={"row"} spacing={1} alignItems={"center"}>
                                            <Rating
                                                precision={0.5}
                                                size="medium"
                                                value={profileRating}
                                                readOnly={true}

                                            />
                                            <Typography component={"legend"} variant={"subtitle2"}>
                                                {profileRating.toFixed(2)}
                                            </Typography>
                                        </Stack>
                                    )}
                                    secondary={(
                                        <Typography
                                            color="text.secondary"
                                            variant="body2"
                                        >
                                            Based on
                                            {' '}
                                            {profileRatingCounts}
                                            {' '}
                                            review
                                        </Typography>
                                    )}
                                />
                            </ListItem>}
                    </List>
                </CardContent>
            </Card>
            {!isCustomer && <>
                <Stack
                    alignItems="center"
                    direction={{
                        xs: 'column',
                        sm: 'row'
                    }}
                    spacing={1}
                >
                    <CertificatesCarousel userId={profile.id}/>
                </Stack>
            </>}
        </Stack>
    );
};

SpecialistAbout.propTypes = {
    email: PropTypes.string.isRequired,
};
