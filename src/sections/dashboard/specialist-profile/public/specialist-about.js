import PropTypes from 'prop-types';
import BookOpen01Icon from '@untitled-ui/icons-react/build/esm/BookOpen01';
import Briefcase01Icon from '@untitled-ui/icons-react/build/esm/Briefcase01';
import Home02Icon from '@untitled-ui/icons-react/build/esm/Home02';
import Mail01Icon from '@untitled-ui/icons-react/build/esm/Mail01';
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    LinearProgress,
    Link,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText, Rating,
    Stack,
    SvgIcon, Tooltip,
    Typography, useMediaQuery
} from '@mui/material';
import * as React from "react";
import ReviewsOutlinedIcon from '@mui/icons-material/ReviewsOutlined';
import {useCallback, useEffect, useState} from "react";
import {useMounted} from "../../../../hooks/use-mounted";
import {socialApi} from "../../../../api/social";
import {servicesFeedApi} from "../../../../api/servicesFeed";


export const SpecialistAbout = (props) => {
    const {
        profile,
        userSpecialties,
        isOwner,
        currentCity,
        currentJobCompany,
        currentJobTitle,
        email,
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
                    <Typography
                        color="text.secondary"
                        sx={{mb: 2}}
                        variant="subtitle2"
                    >
                        <div dangerouslySetInnerHTML={{__html: profile.description}}/>
                    </Typography>

                    <List disablePadding>
                        {profile.address &&
                            <ListItem
                                disableGutters
                                divider
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
                                                {profile.address.location.place_name}
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
                            (<ListItem disableGutters>
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
                            </ListItem>)}

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
                        </ListItem>
                    </List>
                </CardContent>
            </Card>

            <Typography
                color="text.primary"
                variant={"h6"}
                gutterBottom
                sx={{mt: 2, pl: "24px"}}
            >
                Specialties:
            </Typography>
            {filteredUserSpecialties.map((spec) => {
                if (spec) return (
                    <Card>
                        <Stack
                            alignItems="center"
                            direction={{
                                xs: 'column',
                                sm: 'row'
                            }}
                            spacing={3}

                            sx={smUp ? {
                                px: 4,
                                py: 3,
                                minHeight: 117,
                                backgroundImage: `linear-gradient(to right, rgba(255,255,255,1) 56%, rgba(255,255,255,0)), url(${spec && spec.img ? spec.img : ""})`,
                                backgroundPosition: 'right',
                                backgroundSize: 'contain',
                                backgroundRepeat: 'no-repeat',
                                ':hover': {
                                    boxShadow: (theme) => `${theme.palette.primary.main} 0 0 5px`,
                                    cursor: 'pointer'
                                },
                            } : {
                                py:1,
                                minHeight: "auto",
                            }}
                        >
                            <Box>
                                <Typography
                                    color={spec && !spec.accepted ? "red" : "text.primary"}
                                    variant={"h6"}
                                    gutterBottom
                                >
                                    {spec.label}
                                </Typography>
                                {spec && !spec.accepted &&
                                    (<Typography variant="caption" component="div" sx={{color: "red"}}>
                                        not confirmed by the admin
                                    </Typography>)}
                            </Box>
                        </Stack>
                    </Card>
                )
            })}
        </Stack>
    );
};

SpecialistAbout.propTypes = {
    currentCity: PropTypes.string.isRequired,
    currentJobCompany: PropTypes.string.isRequired,
    currentJobTitle: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    originCity: PropTypes.string.isRequired,
    previousJobCompany: PropTypes.string.isRequired,
    previousJobTitle: PropTypes.string.isRequired,
    profileProgress: PropTypes.number.isRequired,
    quote: PropTypes.string.isRequired
};
