import PropTypes from 'prop-types';
import {Chip, Divider, Stack, Tab, Tabs, Unstable_Grid2 as Grid} from '@mui/material';
import {SpecialistPostAdd} from './specialist-post-add';
import {SpecialistPostCard} from './specialist-post-card';
import {SpecialistAbout} from "./specialist-about";
import {useAuth} from "../../../../hooks/use-auth";
import {SpecialistReviewAdd} from "./specialist-review-add";
import {useCallback, useState} from "react";

const tabs = [
    {label: 'All', value: 'all'},
    {label: 'Reviews', value: 'reviews'},
    {label: 'Posts', value: 'posts'}
];

export const SpecialistTimeline = (props) => {
    const {
        posts = [],
        isOwner,
        userSpecialties,
        handlePostsGet,
        handlePostRemove,
        profile,
        profileRating,
        profileRatingCounts,
        ...other
    } = props;
    const {user} = useAuth();
    const [currentTab, setCurrentTab] = useState('all');

    const isReviewExists = posts.filter((p) => (p.authorId === user.id && p.type === "review")).length > 0;
    const handleTabsChange = useCallback((event, value) => {
        setCurrentTab(value);
    }, []);

    return (
        <div {...other}>
            <Grid
                container
                spacing={4}
            >
                <Grid
                    lg={4}
                    xs={12}
                >
                    <SpecialistAbout
                        isOwner={isOwner}
                        profile={profile}
                        userSpecialties={userSpecialties}
                        currentCity={profile.currentCity}
                        currentJobCompany={profile.currentJobCompany}
                        currentJobTitle={profile.currentJobTitle}
                        email={profile.email}
                        originCity={profile.originCity}
                        previousJobCompany={profile.previousJobCompany}
                        previousJobTitle={profile.previousJobTitle}
                        profileProgress={profile.profileProgress}
                        quote={profile.quote}
                        profileRating={profileRating}
                        profileRatingCounts={profileRatingCounts}
                    />
                </Grid>
                <Grid
                    lg={8}
                    xs={12}
                >
                    <Stack direction={"row"} spacing={1}>
                        {tabs.map((tab) => (
                            <Chip
                                key={tab.value}
                                label={tab.label}
                                variant={tab.value === currentTab ? "filled" : "outlined"}
                                onClick={() => {
                                    setCurrentTab(tab.value);
                                }}
                            />
                        ))}
                    </Stack>
                    <Stack spacing={3} sx={{mt: 3}}>
                        {isOwner ? <SpecialistPostAdd handlePostsGet={handlePostsGet}/> :
                            (!isReviewExists ?
                                <SpecialistReviewAdd profile={profile} handlePostsGet={handlePostsGet}/> : <></>)}
                        {posts.filter((p) => {
                            if (currentTab === "all")
                                return true;
                            if (currentTab === "reviews")
                                return p.type === "review";
                            return p.type !== "review";
                        }).map((post) => (
                            <SpecialistPostCard
                                user={user}
                                handlePostRemove={handlePostRemove}
                                handlePostsGet={handlePostsGet}
                                key={post.id}
                                post={post}
                                rating={post.rating || 0}
                                comments={post.comments || []}
                                createdAt={post.createdAt ? post.createdAt.toDate() : new Date()}
                                isLiked={post.likes && post.likes.find(item => item === user.id)}
                                likes={post.likes ? post.likes.length : 0}
                                media={post.media}
                                message={post.message}
                            />
                        ))}
                    </Stack>
                </Grid>
            </Grid>
        </div>
    );
};

SpecialistTimeline.propTypes = {
    posts: PropTypes.array,
    profile: PropTypes.object.isRequired
};
