import {useCallback, useEffect, useState} from 'react';
import {Box, Container, Stack, Typography} from '@mui/material';
import {servicesFeedApi} from 'src/api/servicesFeed';
import {Seo} from 'src/components/seo';
import {useMounted} from 'src/hooks/use-mounted';
import {usePageView} from 'src/hooks/use-page-view';
import {ServicePostAdd} from 'src/sections/dashboard/services-feed/service-post-add';
import {SocialPostCard} from 'src/sections/dashboard/social/social-post-card';
import {addDoc, collection,serverTimestamp } from "firebase/firestore";
import {firestore} from "src/libs/firebase";
import {useAuth} from "src/hooks/use-auth";
import {ServicePostCard} from "../../sections/dashboard/services-feed/service-post-card";
import {subMinutes} from "date-fns";

const usePosts = () => {
    const isMounted = useMounted();
    const [posts, setPosts] = useState([]);
    const {user} = useAuth();

    const handlePostsGet = useCallback(async () => {
        try {
            const response = await servicesFeedApi.getFeed({userId: user.id});
            const posts = [];
            response.forEach((doc) => {
                // doc.data() is never undefined for query doc snapshots
                posts.push(doc.data());
                console.log(doc.id, " => ", doc.data());

            });
            console.log(posts);
            if (isMounted()) {
                setPosts(posts);
            }
        } catch (err) {
            console.error(err);
        }
    }, [isMounted]);

    useEffect(() => {
            handlePostsGet();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []);

    return posts;
};

const Page = () => {
    const posts = usePosts();
    const {user} = useAuth();

    usePageView();

    const handlePostAdd = useCallback(async (post) => {
        await addDoc(collection(firestore, "completedWorks"), {createdAt: serverTimestamp(), ...post});
    }, []);

    return (
        <>
            <Seo title="Dashboard: Services Feed"/>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    py: 8
                }}
            >
                <Container maxWidth="lg">
                    <Stack spacing={1}>
                        <Typography
                            color="text.secondary"
                            variant="overline"
                        >
                            Services Feed
                        </Typography>
                        <Typography variant="h4">
                            Publish your completed works so that customers can find out your experience
                        </Typography>
                    </Stack>
                    <Stack
                        spacing={3}
                        sx={{mt: 3}}
                    >
                        <ServicePostAdd onSubmit={handlePostAdd}/>
                        {posts.map((post) => (
                            <ServicePostCard
                                key={post.id}
                                authorAvatar={user.avatar}
                                authorName={user.displayName}
                                comments={[]}
                                createdAt={post.createdAt.toDate()}
                                isLiked={post.isLiked}
                                likes={post.likes}
                                media={post.media}
                                message={post.description}
                            />
                        ))}
                    </Stack>
                </Container>
            </Box>
        </>
    );
};

export default Page;
