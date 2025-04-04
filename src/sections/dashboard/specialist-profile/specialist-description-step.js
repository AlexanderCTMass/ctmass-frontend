import PropTypes from 'prop-types';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import {Button, CircularProgress, Stack, SvgIcon, Typography, useMediaQuery} from '@mui/material';
import * as React from "react";
import {useEffect, useState} from "react";
import {extendedProfileApi} from "src/pages/cabinet/profiles/my/data/extendedProfileApi";
import {INFO} from "src/libs/log";
import {ProfileAboutEditArea} from "src/components/profile-about-edit-area";
import useUserSpecialties from "src/hooks/use-userSpecialties";

const useUserEducations = (userId) => {
    const [educations, setEducations] = useState([]);
    const [isFetching, setIsFetching] = useState(false);

    useEffect(() => {
        setIsFetching(false);
        const fetchData = async () => {
            const response = await extendedProfileApi.getEducation(userId);
            INFO("Fetched educations", response);
            setEducations(response);
            setIsFetching(true);
        };

        if (userId) {
            fetchData();
        }
    }, [userId]);

    return {educations, isFetching};
};


export const SpecialistDescriptionStep = (props) => {
    const {profile, onNext, onBack, ...other} = props;
    const [content, setContent] = useState(profile.about);
    const mdUp = useMediaQuery((theme) => theme.breakpoints.up('md'));
    const {userSpecialties, isFetching: isFetchingUserSpecialties} = useUserSpecialties(profile.id);
    const {educations: userEducations, isFetching: isFetchingUserEducations} = useUserEducations(profile.id);

    const handleOnNext = () => {
        if (profile.about === content)
            onNext();
        else {
            onNext({
                about: content,
                profileDataProgress: 5
            });
        }
    }
    return (
        <Stack
            spacing={3}
            {...other}>
            <div>
                <Typography variant="h6">
                    Why should customers hire you?
                </Typography>
                <Typography variant="body2">
                    Explain what makes your business stand out and why you'll do a great job.
                </Typography>
            </div>
            {!isFetchingUserSpecialties ? (
                <CircularProgress/>
            ) : (<>
                <ProfileAboutEditArea
                    label="About Your Business"
                    initialValue={content}
                    onTextChange={setContent}
                    profile={{
                        ...profile,
                        specialties: userSpecialties,
                        education: userEducations
                    }}
                />
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
                    >
                        Next
                    </Button>
                    <Button
                        color="inherit"
                        onClick={onBack}
                    >
                        Back
                    </Button>
                </Stack>
            </>)}
        </Stack>
    );
};

SpecialistDescriptionStep.propTypes = {
    onBack: PropTypes.func,
    onNext: PropTypes.func
};
