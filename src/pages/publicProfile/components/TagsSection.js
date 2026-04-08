import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Chip,
    CircularProgress,
    Paper,
    Stack,
    Typography
} from '@mui/material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { profileApi } from 'src/api/profile';

const TagsSection = ({ tags }) => {
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(false);

    const normalizedTags = useMemo(
        () =>
            (tags || [])
                .map((tag) => (typeof tag === 'string' ? tag.replace(/^#/, '').trim() : ''))
                .filter(Boolean),
        [tags]
    );

    useEffect(() => {
        let active = true;

        const load = async () => {
            if (!normalizedTags.length) {
                setStats({});
                return;
            }
            setLoading(true);

            try {
                const response = await profileApi.getTagsCounters(normalizedTags);
                if (active) {
                    setStats(response || {});
                }
            } catch (error) {
                if (active) {
                    setStats({});
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        load();

        return () => {
            active = false;
        };
    }, [normalizedTags]);

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                p: { xs: 3, md: 4 },
                backgroundColor: 'background.paper'
            }}
        >
            <Stack spacing={2.5}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <LocalOfferIcon color="primary" />
                    <Typography variant="h6" fontWeight={700}>
                        Tags &amp; Keywords
                    </Typography>
                </Stack>

                {loading ? (
                    <CircularProgress size={24} />
                ) : normalizedTags.length ? (
                    <Box
                        sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 1
                        }}
                    >
                        {normalizedTags.map((tag) => (
                            <Chip
                                key={tag}
                                label={`${tag} ${stats[tag] ? stats[tag] : 0}`}
                                variant="outlined"
                                sx={{
                                    borderRadius: 999,
                                    fontWeight: 500
                                }}
                            />
                        ))}
                    </Box>
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        Tags have not been added yet.
                    </Typography>
                )}
            </Stack>
        </Paper>
    );
};

TagsSection.propTypes = {
    tags: PropTypes.arrayOf(PropTypes.string)
};

TagsSection.defaultProps = {
    tags: []
};

export default TagsSection;