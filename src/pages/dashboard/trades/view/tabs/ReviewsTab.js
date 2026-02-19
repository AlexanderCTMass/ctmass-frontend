import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Button,
    CircularProgress,
    Grid,
    InputAdornment,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from 'src/hooks/use-auth';
import { profileApi } from 'src/api/profile';
import { extendedProfileApi } from 'src/pages/cabinet/profiles/my/data/extendedProfileApi';
import { projectFlow } from 'src/flows/project/project-flow';
import ReviewCard from '../components/ReviewCard';
import NewReviewCard from '../components/NewReviewCard';
import ReviewDialog from '../components/ReviewDialog';
import { ReviewRequestModal } from '../modals/ReviewRequestModal';
import toast from 'react-hot-toast';

const simpleHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
};

const AVATAR_MAPPING = [
    { name: "Alcides Antonio", image: "avatar-alcides-antonio.png" },
    { name: "Anika Visser", image: "avatar-anika-visser.png" },
    { name: "Cao Yu", image: "avatar-cao-yu.png" },
    { name: "Carson Darrin", image: "avatar-carson-darrin.png" },
    { name: "Chinasa Neo", image: "avatar-chinasa-neo.png" },
    { name: "Fran Perez", image: "avatar-fran-perez.png" },
    { name: "Luila Albu", image: "avatar-luila-albu.png" },
    { name: "Jane Rotanson", image: "avatar-jane-rotanson.png" },
    { name: "Jie Yan Song", image: "avatar-jie-yan-song.png" },
    { name: "Marcus Finn", image: "avatar-marcus-finn.png" },
    { name: "Miron Vitold", image: "avatar-miron-vitold.png" },
    { name: "Nasimiyu Danai", image: "avatar-nasimiyu-danal.png" },
    { name: "Neha Punita", image: "avatar-neha-punita.png" },
    { name: "Omar Darboe", image: "avatar-omar-darboe.png" },
    { name: "Perjani Inyene", image: "avatar-perjani-inyene.png" },
    { name: "Seo Hyeon Ji", image: "avatar-seo-hyeon-ji.png" },
    { name: "Siegbert Gottfried", image: "avatar-siegbert-gottfried.png" }
];

const getFallbackAuthorData = (reviewId) => {
    const hash = simpleHash(reviewId || 'default');
    const index = hash % AVATAR_MAPPING.length;
    const selected = AVATAR_MAPPING[index];
    return {
        businessName: selected.name,
        avatar: `/assets/avatars/${selected.image}`
    };
};

const REVIEWS_PER_PAGE = 4;
const SCROLL_THRESHOLD = 100;

function ReviewsTab({ trade }) {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [filteredReviews, setFilteredReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [authorsData, setAuthorsData] = useState({});
    const [projectsData, setProjectsData] = useState({});
    const [comments, setComments] = useState({});
    const [likes, setLikes] = useState({});
    const [selectedReview, setSelectedReview] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [displayedCount, setDisplayedCount] = useState(REVIEWS_PER_PAGE);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [reviewRequestModalOpen, setReviewRequestModalOpen] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const scrollContainerRef = useRef(null);

    const newestReview = useMemo(() => {
        if (!reviews.length) return null;
        return reviews[0];
    }, [reviews]);

    const remainingReviews = useMemo(() => {
        if (!reviews.length) return [];
        return reviews.slice(1);
    }, [reviews]);

    useEffect(() => {
        const fetchReviews = async () => {
            if (!trade?.ownerId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const profile = await profileApi.get(trade.ownerId);
                setUserProfile(profile);

                const allReviews = await extendedProfileApi.getReviews(trade.ownerId);
                const portfolio = await extendedProfileApi.getPortfolio(trade.ownerId);

                const portfolioMap = {};
                portfolio.forEach(p => {
                    portfolioMap[p.id] = p;
                });

                const tradeReviews = allReviews.filter(review => {
                    if (!review.projectId) return false;
                    const portfolioItem = portfolioMap[review.projectId];
                    return portfolioItem && portfolioItem.tradeId === trade.id;
                });

                setReviews(tradeReviews);
                setFilteredReviews(tradeReviews.slice(1));

                const initialComments = {};
                const initialLikes = {};
                tradeReviews.forEach((review) => {
                    initialComments[review.id] = Array.isArray(review.comments) ? review.comments : [];
                    initialLikes[review.id] = Array.isArray(review.likes) ? review.likes : [];
                });
                setComments(initialComments);
                setLikes(initialLikes);
            } catch (error) {
                console.error('Failed to load reviews:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [trade?.ownerId, trade?.id]);

    useEffect(() => {
        const fetchAuthorsData = async () => {
            if (!reviews.length) return;

            const authorIds = [...new Set(reviews.map((r) => r.authorId).filter(Boolean))];
            if (!authorIds.length) return;

            try {
                const authorsProfiles = await profileApi.getProfilesById(authorIds);
                const map = {};
                authorsProfiles.forEach((profile) => {
                    map[profile.id] = {
                        ...profile,
                        businessName: profile.businessName || profile.name
                    };
                });
                setAuthorsData(map);
            } catch (err) {
                console.error('Failed to load authors data:', err);
            }
        };

        fetchAuthorsData();
    }, [reviews]);

    useEffect(() => {
        const fetchProjectsData = async () => {
            if (!reviews.length) return;

            const projectIds = [...new Set(reviews.map((r) => r.projectId).filter(Boolean))];
            if (!projectIds.length) return;

            try {
                const projectsMap = {};
                await Promise.all(
                    projectIds.map(async (id) => {
                        const portfolio = await profileApi.getPortfolioByUserAndId(trade.ownerId, id);
                        if (portfolio) {
                            projectsMap[id] = portfolio;
                        }
                    })
                );
                setProjectsData(projectsMap);
            } catch (err) {
                console.error('Failed to load projects data:', err);
            }
        };

        fetchProjectsData();
    }, [reviews, trade?.ownerId]);

    useEffect(() => {
        const filtered = remainingReviews.filter((review) =>
            review.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            authorsData[review.authorId]?.businessName?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredReviews(filtered);
        setDisplayedCount(REVIEWS_PER_PAGE);
    }, [searchQuery, remainingReviews, authorsData]);

    const handleScroll = useCallback((e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD;

        if (isNearBottom && !isLoadingMore && displayedCount < filteredReviews.length) {
            setIsLoadingMore(true);
            setTimeout(() => {
                setDisplayedCount((prev) => Math.min(prev + REVIEWS_PER_PAGE, filteredReviews.length));
                setIsLoadingMore(false);
            }, 500);
        }
    }, [isLoadingMore, displayedCount, filteredReviews.length]);

    const handleCardClick = useCallback((review) => {
        setSelectedReview(review);
    }, []);

    const handleCloseDialog = useCallback(() => {
        setSelectedReview(null);
    }, []);

    const handleLike = useCallback(async (reviewId) => {
        if (!user || !trade?.ownerId) return;

        const currentLikes = likes[reviewId] || [];
        const hasLiked = currentLikes.includes(user.id);
        const newLikes = hasLiked
            ? currentLikes.filter((id) => id !== user.id)
            : [...currentLikes, user.id];

        setLikes((prev) => ({
            ...prev,
            [reviewId]: newLikes
        }));
    }, [user, trade?.ownerId, likes]);

    const handleCommentSubmit = useCallback(async (reviewId, comment) => {
        if (!trade?.ownerId) return;

        try {
            await extendedProfileApi.addReviewComment(trade.ownerId, reviewId, comment);

            setComments((prev) => ({
                ...prev,
                [reviewId]: [...(prev[reviewId] || []), comment]
            }));

            setAuthorsData((prev) => ({
                ...prev,
                [comment.authorId]: comment.authorData
            }));
        } catch (err) {
            console.error('Failed to add comment:', err);
            throw err;
        }
    }, [trade?.ownerId]);

    const handleOpenReviewRequest = useCallback(() => {
        setReviewRequestModalOpen(true);
    }, []);

    const handleCloseReviewRequest = useCallback(() => {
        setReviewRequestModalOpen(false);
    }, []);

    const handleSubmitReviewRequest = useCallback(async (values) => {
        try {
            await projectFlow.sendTradeReviewRequest(
                user.id,
                user.businessName || user.name,
                user.email,
                trade.id,
                {
                    id: null,
                    projectName: values.projectName,
                    projectDate: values.date,
                    projectDescription: values.projectDescription,
                    specialtyId: values.specialty,
                    location: values.location,
                    files: values.files,
                    addToPortfolio: values.addToPortfolio
                },
                values.email,
                values.message
            );

            toast.success('Review request sent successfully!');
            setReviewRequestModalOpen(false);
        } catch (error) {
            console.error('Failed to send review request:', error);
            toast.error('Failed to send review request');
        }
    }, [user, trade]);

    const visibleReviews = useMemo(() => {
        return filteredReviews.slice(0, displayedCount);
    }, [filteredReviews, displayedCount]);

    const selectedAuthor = selectedReview
        ? authorsData[selectedReview.authorId] || getFallbackAuthorData(selectedReview.id)
        : null;

    const selectedProjectTitle = selectedReview?.projectId
        ? projectsData[selectedReview.projectId]?.title || projectsData[selectedReview.projectId]?.name
        : null;

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!reviews.length) {
        return (
            <>
                <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No reviews yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Reviews will appear here once customers start leaving feedback
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenReviewRequest}
                    >
                        Request Review
                    </Button>
                </Box>

                <ReviewRequestModal
                    open={reviewRequestModalOpen}
                    onClose={handleCloseReviewRequest}
                    onSubmit={handleSubmitReviewRequest}
                    profile={userProfile || {}}
                    trade={trade}
                    currentRequest={{}}
                    isEditMode={false}
                    existingRequests={[]}
                />
            </>
        );
    }

    return (
        <>
            <Stack spacing={4}>
                {newestReview && (
                    <Box>
                        <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
                            Latest Review
                        </Typography>
                        <NewReviewCard
                            review={newestReview}
                            authorData={authorsData[newestReview.authorId] || getFallbackAuthorData(newestReview.id)}
                            onReply={handleCardClick}
                        />
                    </Box>
                )}

                <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h6" fontWeight={700}>
                            All Reviews ({remainingReviews.length})
                        </Typography>
                        <Stack direction="row" spacing={2}>
                            <TextField
                                size="small"
                                placeholder="Search reviews..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                sx={{ width: 300 }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon fontSize="small" />
                                        </InputAdornment>
                                    )
                                }}
                            />
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleOpenReviewRequest}
                            >
                                Request Review
                            </Button>
                        </Stack>
                    </Stack>

                    <Box
                        ref={scrollContainerRef}
                        onScroll={handleScroll}
                        sx={{
                            maxHeight: 800,
                            overflowY: 'auto',
                            pr: 1
                        }}
                    >
                        {filteredReviews.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Typography variant="body2" color="text.secondary">
                                    No reviews found matching your search
                                </Typography>
                            </Box>
                        ) : (
                            <>
                                <Grid container spacing={3}>
                                    {visibleReviews.map((review) => {
                                        const authorData = authorsData[review.authorId] || getFallbackAuthorData(review.id);
                                        const projectTitle = review.projectId
                                            ? projectsData[review.projectId]?.title || projectsData[review.projectId]?.name
                                            : null;
                                        const reviewLikes = likes[review.id] || [];
                                        const reviewComments = comments[review.id] || [];
                                        const isLiked = user ? reviewLikes.includes(user.id) : false;

                                        return (
                                            <Grid item xs={12} sm={6} key={review.id}>
                                                <ReviewCard
                                                    review={review}
                                                    authorData={authorData}
                                                    projectTitle={projectTitle}
                                                    onCardClick={handleCardClick}
                                                    likesCount={reviewLikes.length}
                                                    commentsCount={reviewComments.length}
                                                    isLiked={isLiked}
                                                    onLike={handleLike}
                                                />
                                            </Grid>
                                        );
                                    })}
                                </Grid>

                                {displayedCount < filteredReviews.length && (
                                    <Box sx={{ textAlign: 'center', mt: 3, py: 2 }}>
                                        {isLoadingMore ? (
                                            <CircularProgress size={24} />
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">
                                                Scroll down to load more reviews...
                                            </Typography>
                                        )}
                                    </Box>
                                )}
                            </>
                        )}
                    </Box>
                </Box>
            </Stack>

            <ReviewDialog
                open={Boolean(selectedReview)}
                review={selectedReview}
                authorData={selectedAuthor}
                projectTitle={selectedProjectTitle}
                comments={selectedReview ? comments[selectedReview.id] || [] : []}
                authorsData={authorsData}
                onClose={handleCloseDialog}
                onCommentSubmit={handleCommentSubmit}
            />

            <ReviewRequestModal
                open={reviewRequestModalOpen}
                onClose={handleCloseReviewRequest}
                onSubmit={handleSubmitReviewRequest}
                profile={userProfile || {}}
                trade={trade}
                currentRequest={{}}
                isEditMode={false}
                existingRequests={[]}
            />
        </>
    );
}

ReviewsTab.propTypes = {
    trade: PropTypes.object.isRequired
};

export default ReviewsTab;
