import CampaignIcon from '@mui/icons-material/Campaign';
import PostAddIcon from '@mui/icons-material/PostAdd';
import TaskIcon from '@mui/icons-material/Task';
import {Chip, Stack, Unstable_Grid2 as Grid} from '@mui/material';
import PlusIcon from '@untitled-ui/icons-react/build/esm/Plus';
import PropTypes from 'prop-types';
import * as React from "react";
import {useCallback, useState} from "react";
import {useNavigate} from "react-router-dom";
import {ProjectStatus} from "src/enums/project-state";
import {SpecialistAnyPostAdd} from "src/sections/dashboard/specialist-profile/public/specialist-post-add";
import {SpecialistProjectAdd} from "src/sections/dashboard/specialist-profile/public/specialist-project-add";
import {PopoverMenu} from "../../../../components/popover-menu";
import {useAuth} from "../../../../hooks/use-auth";
import {paths} from "../../../../paths";
import {SpecialistAbout} from "./specialist-about";
import {SpecialistPostCard} from './specialist-post-card';

function AdvertiseProjectIcon() {
    return <CampaignIcon color="primary"/>;
}

function CreateProjectIcon() {
    return <PostAddIcon color="primary"/>;
}

function CompletedIcon() {
    return <TaskIcon color="success"/>;
}

const tabs = [
    {label: 'All', value: 'all'},
    {label: 'Projects', value: 'project'},
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
    const [postEditable, setPostEditable] = useState();
    const [projectEditable, setProjectEditable] = useState();
    const navigate = useNavigate();

    const isCustomer = !profile.serviceProvided;

    const handlePostEditClose = (postType) => {
        setPostEditable(null);
        setProjectEditable(null);
    }

    const handlePostEdit = useCallback((post) => {
        if (post.postType === 'project') {
            setProjectEditable(post);
        } else {
            setPostEditable(post);
        }
    }, []);

    const isReviewExists = posts.filter((p) => (p.authorId === user.id && p.type === "review")).length > 0;
    const handleTabsChange = useCallback((event, value) => {
        setCurrentTab(value);
    }, []);

    const addMenuItems = [
        {
            title: "Create project ad",
            subtitle: "Promote your project to find the right specialists",
            onClick: () => {
                navigate(paths.dashboard.project.create);
            },
            icon: AdvertiseProjectIcon(),
            customer: true
        },
        {
            title: "Add completed project",
            subtitle: "Showcase your finished work and achievements",
            onClick: () => {
                setProjectEditable({
                    postType: "project",
                    projectStatus: ProjectStatus.COMPLETED,
                    authorId: user.id,
                    contractorId: user.id
                });
            },
            icon: CompletedIcon(),
            customer: false

        },
        {
            title: "Add any post",
            subtitle: "Share updates, ideas, or any information with the community",
            onClick: () => {
                setPostEditable({postType: "post"});
            },
            icon: CreateProjectIcon(),
            customer: true
        },
    ];

    const showAbout = isOwner || (isCustomer && profile.publicProfile) || !isCustomer;

    return (
        <div {...other}>
            <Grid
                container
                spacing={3}
            >
                {showAbout &&
                    <Grid
                        xl={3}
                        lg={4}
                        xs={12}
                    >
                        <SpecialistAbout
                            isOwner={isOwner}
                            isCustomer={isCustomer}
                            profile={profile}
                            userSpecialties={userSpecialties}
                            currentCity={profile.currentCity}
                            currentJobCompany={profile.currentJobCompany}
                            currentJobTitle={profile.currentJobTitle}
                            email={profile.email}
                            phone={profile.phone}
                            originCity={profile.originCity}
                            previousJobCompany={profile.previousJobCompany}
                            previousJobTitle={profile.previousJobTitle}
                            profileProgress={profile.profileProgress}
                            quote={profile.quote}
                            profileRating={profileRating}
                            profileRatingCounts={profileRatingCounts}
                        />
                    </Grid>}
                <Grid
                    xl={showAbout ? 9 : 12}
                    lg={showAbout ? 8 : 12}
                    xs={12}
                >
                    <Stack direction={"row"} spacing={1} justifyContent={"space-between"} alignItems={"center"}>
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
                        {isOwner && (
                            <PopoverMenu
                                tooltip={"Add post"}
                                icon={<PlusIcon/>}
                                items={addMenuItems.filter((item) => !isCustomer || item.customer)}/>
                        )}
                    </Stack>
                    <Stack spacing={3} sx={{mt: 3}}>
                        {/*{isOwner ? <SpecialistPostAdd handlePostsGet={handlePostsGet}/> :
                            (!isReviewExists ?
                                <SpecialistReviewAdd profile={profile} handlePostsGet={handlePostsGet}/> : <></>)}*/}
                        {posts.filter((p) => {
                            if (currentTab === "all")
                                return true;
                            if (currentTab === "project")
                                return p.postType === "project";
                            return p.postType !== "project";
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
                                handlePostEdit={handlePostEdit}
                            />
                        ))}
                    </Stack>
                </Grid>
            </Grid>
            <SpecialistProjectAdd handlePostsGet={handlePostsGet} onClose={handlePostEditClose}
                                  open={projectEditable} post={projectEditable} specialties={userSpecialties}/>
            <SpecialistAnyPostAdd handlePostsGet={handlePostsGet} onClose={handlePostEditClose}
                                  open={postEditable} post={postEditable}/>
        </div>
    );
};

SpecialistTimeline.propTypes = {
    posts: PropTypes.array,
    profile: PropTypes.object.isRequired
};
