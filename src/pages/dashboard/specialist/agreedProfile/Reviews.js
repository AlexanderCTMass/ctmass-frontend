import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';
import {
    Avatar,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    InputAdornment,
    List,
    ListItem,
    Rating,
    Skeleton,
    TextField,
    Typography
} from "@mui/material";
import {format, formatDistanceToNow} from 'date-fns';
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import ImageModalWindow from "./ImageModalWindow";
import {profileApi} from "../../../../api/profile/index";
import {useAuth} from "../../../../hooks/use-auth";
import {extendedProfileApi} from "./data/extendedProfileApi";

const Comment = memo(({comment, authorsData}) => {
    if (!comment || !comment.authorId) {
        return null; // или возвращаем fallback-компонент
    }

    const isValidDate = (date) => {
        return date && !isNaN(new Date(date).getTime());
    };

    const date = isValidDate(comment.date) ? new Date(comment.date) : comment.date.toDate();

    // Используем authorData из комментария, если он есть, иначе из authorsData
    const authorData = comment?.authorData || authorsData[comment?.authorId] || {
        businessName: comment.authorId,
        avatar: null,
    };

    return (
        <Box sx={{
            mt: 1.5,
            borderLeft: '2px solid',
            borderColor: 'divider',
            pl: 2,
            position: 'relative'
        }}>
            <Box display="flex" alignItems="center" mb={0.5}>
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        fontSize: '0.75rem'
                    }}
                >
                    {format(date, 'd MMMM yyyy')}
                </Typography>
                {authorData ? (
                    <Avatar src={authorData.avatar} sx={{
                        width: 28,
                        height: 28,
                        mr: 1.5,
                        fontSize: '0.8rem',
                        bgcolor: 'primary.main',
                    }}/>
                ) : (
                    <Skeleton variant="circular" width={28} height={28}/>
                )}
                <Box>
                    {authorData ? (
                        <Typography variant="subtitle2" fontWeight="bold">
                            {authorData.businessName}
                        </Typography>
                    ) : (
                        <Skeleton variant="text" width={100} height={24}/>
                    )}
                    <Typography variant="caption" color="text.secondary">
                        {formatDistanceToNow(date, {addSuffix: true})}
                    </Typography>
                </Box>
            </Box>
            <Typography variant="body2" sx={{wordBreak: 'break-word'}}>
                {comment.text}
            </Typography>
        </Box>
    )
});

const Reviews = ({profile, setProfile}) => {
    const [openAllReviews, setOpenAllReviews] = useState(false);
    const [imageModal, setImageModal] = useState({
        open: false,
        images: [],
        currentIndex: 0
    });

    const [comments, setComments] = useState(() =>
        profile?.reviews?.reduce((acc, review) => {
            acc[review.id] = Array.isArray(review.comments)
                ? review.comments.map(c => ({...c, date: c.date || new Date().toISOString()}))
                : [];
            return acc;
        }, {})
    );

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Состояние для хранения данных авторов
    const [authorsData, setAuthorsData] = useState({});

    const {user} = useAuth();

    // Загрузка данных авторов для первых 3 отзывов
    useEffect(() => {
        const fetchInitialAuthorsData = async () => {
            if (!profile?.reviews || profile?.reviews.length===0) return;

            const visibleReviews = profile.reviews.slice(0, 3);
            const authorIds = visibleReviews.map(review => review.authorId);
            const uniqueAuthorIds = [...new Set(authorIds)]; // Убираем дубликаты

            try {
                const authorsProfiles = await profileApi.getProfilesById(uniqueAuthorIds);

                const authorsDataMap = authorsProfiles.reduce((acc, profile) => {
                    acc[profile.id] = profile;
                    return acc;
                }, {});

                setAuthorsData(prev => ({...prev, ...authorsDataMap}));
            } catch (err) {
                console.error("Failed to load initial authors data:", err);
            }
        };

        fetchInitialAuthorsData();
    }, [profile?.reviews]);

    // Загрузка данных авторов для всех отзывов при открытии модального окна
    useEffect(() => {
        if (!openAllReviews) return;

        const fetchAllAuthorsData = async () => {
            if (!profile?.reviews) return;

            const allAuthorIds = profile.reviews.map(review => review.authorId);
            const uniqueAuthorIds = [...new Set(allAuthorIds)]; // Убираем дубликаты

            try {
                const authorsProfiles = await profileApi.getProfilesById(uniqueAuthorIds);

                const authorsDataMap = authorsProfiles.reduce((acc, profile) => {
                    acc[profile.id] = profile;
                    return acc;
                }, {});

                setAuthorsData(prev => ({...prev, ...authorsDataMap}));
            } catch (err) {
                console.error("Failed to load all authors data:", err);
            }
        };

        fetchAllAuthorsData();
    }, [openAllReviews, profile?.reviews]);

    const handleOpenImage = useCallback((images, index) => {
        setImageModal({
            open: true,
            images,
            currentIndex: index
        });
    }, []);

    // Обработчик добавления комментария
    const handleCommentSubmit = useCallback(async (reviewId, text) => {
        setIsSubmitting(true);

        // Данные текущего пользователя
        const currentUserData = {
            id: user.id,
            avatar: user.avatar,
            businessName: user.businessName,
        };

        // Добавляем данные текущего пользователя в authorsData
        setAuthorsData(prev => ({
            ...prev,
            [user.id]: currentUserData,
        }));

        debugger
        // Новый комментарий
        const newComment = {
            id: Date.now(), // Уникальный идентификатор комментария
            authorId: user.id, // Идентификатор текущего пользователя
            text: text, // Текст комментария
            date: new Date().toISOString(), // Текущая дата и время
            // authorData: currentUserData, // Добавляем данные автора в комментарий
        };
        await extendedProfileApi.addReview(profile.profile.id, reviewId, newComment)

        const newCommentWithAuthorData = {
            ...newComment,
            authorData: currentUserData, // Добавляем authorData локально
        };

        // Добавляем комментарий в состояние
        setComments(prev => {
            const updatedComments = {
                ...prev,
                [reviewId]: [
                    ...(prev[reviewId] || []), // Существующие комментарии
                    newCommentWithAuthorData // Новый комментарий
                ]
            };
            return updatedComments;
        });

        // Обновляем profile
        const updatedProfile = {
            ...profile,
            reviews: profile.reviews.map(review => {
                if (review.id === reviewId) {
                    return {
                        ...review,
                        comments: [
                            ...(review.comments || []),
                            newComment
                        ]
                    };
                }
                return review;
            })
        };

        // Вызываем функцию обновления profile
        setProfile(updatedProfile);

        setIsSubmitting(false);
    }, [user.id, user.businessName, user.avatar, profile, setProfile]);

    const ReviewItem = memo(({review, isDetailed}) => {
        const [commentText, setCommentText] = useState('');

        const handleSubmit = useCallback(() => {
            handleCommentSubmit(review.id, commentText);
            setCommentText('');
        }, [commentText, review.id, handleCommentSubmit]);

        // Данные автора текущего отзыва
        const authorData = authorsData[review.authorId] || {
            businessName: review.authorId,
            avatar: null,
        };

        return (
            <ListItem sx={{p: 0, alignItems: "flex-start"}}>
                <Box width="100%" position="relative">
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            fontSize: '0.75rem'
                        }}
                    >
                        {review.date
                            ? formatDistanceToNow(review.date.toDate(), {addSuffix: true}) : 'recently'}
                    </Typography>
                    <Box display="flex" alignItems="center" mb={1.5}>
                        {authorData ? (
                            <Avatar src={authorData.avatar} sx={{mr: 2, width: 40, height: 40}}/>
                        ) : (
                            <Skeleton variant="circular" width={40} height={40}/>
                        )}
                        <Box>
                            {authorData ? (
                                <Typography variant="subtitle1" fontWeight="bold">
                                    {authorData.businessName}
                                </Typography>
                            ) : (
                                <Skeleton variant="text" width={150} height={24}/>
                            )}
                        </Box>
                    </Box>

                    <Rating value={review.rating} precision={0.5} readOnly size="small"/>
                    <Typography variant="body1" mt={1} mb={isDetailed ? 2 : 0}>
                        {review.text}
                    </Typography>

                    {isDetailed && review.images?.length > 0 && (
                        <Box display="flex" gap={1} mt={2} flexWrap="wrap">
                            {review.images.map((img, index) => (
                                <Box
                                    key={index}
                                    component="img"
                                    src={img}
                                    alt={`Review content ${index + 1}`}
                                    sx={{
                                        width: 100,
                                        height: 100,
                                        borderRadius: 1,
                                        cursor: 'pointer',
                                        objectFit: 'cover'
                                    }}
                                    onClick={() => handleOpenImage(review.images, index)}
                                />
                            ))}
                        </Box>
                    )}

                    {isDetailed && (
                        <Box mt={3}>
                            <Typography variant="subtitle2" fontWeight="bold" mb={2}>
                                Comments ({(comments[review.id] || []).length})
                            </Typography>

                            {(comments[review.id] || []).map(comment => (
                                comment ? (
                                    <Comment
                                        key={comment.id}
                                        comment={comment}
                                        authorsData={authorsData} // Передаем authorsData в Comment
                                    />
                                ) : null))}

                            <Box mt={3} position="relative">
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={2}
                                    variant="outlined"
                                    placeholder="Write a comment..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    disabled={isSubmitting}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={handleSubmit}
                                                    disabled={!commentText.trim() || isSubmitting}
                                                    sx={{mr: -1}}
                                                >
                                                    {isSubmitting ? (
                                                        <CircularProgress size={24}/>
                                                    ) : (
                                                        <SendIcon color="primary"/>
                                                    )}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Box>
                        </Box>
                    )}
                </Box>
            </ListItem>
        );
    });

    const visibleReviews = useMemo(() => profile?.reviews?.slice(0, 3), [profile?.reviews]);

    return (
        <Box>
            <Typography variant="h6" color="text.secondary" mb={2}>
                Reviews ({profile?.reviews?.length || 0})
            </Typography>

            {(!visibleReviews || visibleReviews.length === 0) && (
                <Typography color="secondary">there are no reviews yet</Typography>
            )}

            <List disablePadding>
                {visibleReviews?.map(review => (
                    <React.Fragment key={review.id}>
                        <ReviewItem
                            review={review}
                            isDetailed={false}
                        />
                        <Divider sx={{my: 2}}/>
                    </React.Fragment>
                ))}

                {visibleReviews && visibleReviews.length > 0 && (<Button
                        variant="outlined"
                        fullWidth
                        onClick={() => setOpenAllReviews(true)}
                        sx={{borderRadius: 1}}
                    >
                        View All Reviews
                    </Button>
                )}
            </List>

            <Dialog
                fullWidth
                maxWidth="md"
                open={openAllReviews}
                onClose={() => setOpenAllReviews(false)}
                scroll="paper"
            >
                <DialogTitle sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                }}>
                    <Typography variant="h6">All Reviews</Typography>
                    <IconButton onClick={() => setOpenAllReviews(false)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers>
                    <List disablePadding>
                        {profile?.reviews?.map((review, index) => (
                            <React.Fragment key={review.id}>
                                <ReviewItem
                                    review={review}
                                    isDetailed={true}
                                />
                                {index < profile?.reviews?.length - 1 && (
                                    <Divider sx={{my: 3, mx: -2}}/>
                                )}
                            </React.Fragment>
                        ))}
                    </List>
                </DialogContent>
            </Dialog>

            <ImageModalWindow
                open={imageModal.open}
                handleClose={() => setImageModal(prev => ({...prev, open: false}))}
                images={imageModal.images}
                currentIndex={imageModal.currentIndex}
                setCurrentIndex={(index) => setImageModal(prev => ({...prev, currentIndex: index}))}
            />
        </Box>
    );
};
export default memo(Reviews);