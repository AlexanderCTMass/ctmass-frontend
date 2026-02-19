import { memo } from 'react';
import PropTypes from 'prop-types';
import {
    Avatar,
    Box,
    Typography
} from '@mui/material';
import { format, formatDistanceToNow } from 'date-fns';

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

const getFallbackAuthorData = (authorId) => {
    const hash = simpleHash(authorId || 'default');
    const index = hash % AVATAR_MAPPING.length;
    const selected = AVATAR_MAPPING[index];
    return {
        businessName: selected.name,
        avatar: `/assets/avatars/${selected.image}`
    };
};

const ReviewComment = memo(({ comment, authorsData }) => {
    if (!comment || !comment.authorId) {
        return null;
    }

    const isValidDate = (date) => {
        return date && !isNaN(new Date(date).getTime());
    };

    const date = isValidDate(comment.date) ? new Date(comment.date) : comment.date?.toDate?.() || new Date();

    const authorData = comment?.authorData || authorsData[comment?.authorId] ||
        getFallbackAuthorData(comment.authorId);

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
                <Avatar
                    src={authorData.avatar}
                    sx={{
                        width: 28,
                        height: 28,
                        mr: 1.5,
                        fontSize: '0.8rem',
                        bgcolor: 'primary.main',
                    }}
                    alt={authorData.businessName}
                />
                <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                        {authorData.businessName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {formatDistanceToNow(date, { addSuffix: true })}
                    </Typography>
                </Box>
            </Box>
            <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                {comment.text}
            </Typography>
        </Box>
    );
});

ReviewComment.propTypes = {
    comment: PropTypes.object,
    authorsData: PropTypes.object
};

export default ReviewComment;
