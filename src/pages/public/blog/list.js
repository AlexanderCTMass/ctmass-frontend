import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Container,
    FormControl,
    IconButton,
    InputAdornment,
    MenuItem,
    OutlinedInput,
    Select,
    Skeleton,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { blogService } from 'src/service/blog-service';
import { Seo } from 'src/components/seo';
import { useMounted } from 'src/hooks/use-mounted';
import { usePageView } from 'src/hooks/use-page-view';
import { useAuth } from 'src/hooks/use-auth';
import { paths } from 'src/paths';
import { PublicPostCard } from 'src/sections/public/blog/post-card';
import { RouterLink } from 'src/components/router-link';
import { btn, EmptyState, fieldSx, focusRingSx, PageHero } from 'src/components/ctmass-ui';
import { BRAND, RADIUS, SHADOW } from 'src/theme/ctmass-tokens';

const Page = () => {
    const navigate = useNavigate();
    const isMounted = useMounted();
    const { user } = useAuth();

    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [authorFilter, setAuthorFilter] = useState('all');
    const [categories, setCategories] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        filtered: 0
    });

    usePageView();

    const loadPosts = useCallback(async () => {
        try {
            setLoading(true);
            const data = await blogService.getPosts(50);

            if (isMounted()) {
                setPosts(data);
                setFilteredPosts(data);

                // Extract unique categories
                const uniqueCategories = [...new Set(data.map(post => post.category).filter(Boolean))];
                setCategories(uniqueCategories);

                // Extract unique authors
                const authorMap = new Map();
                data.forEach(post => {
                    if (post.author && post.author.id && !authorMap.has(post.author.id)) {
                        authorMap.set(post.author.id, {
                            id: post.author.id,
                            name: post.author.name,
                            avatar: post.author.avatar,
                            postCount: data.filter(p => p.author?.id === post.author.id).length
                        });
                    }
                });
                setAuthors(Array.from(authorMap.values()));

                setStats({
                    total: data.length,
                    filtered: data.length
                });

                setError(null);
            }
        } catch (err) {
            console.error('Error loading posts:', err);
            if (isMounted()) {
                setError('Failed to load posts');
            }
        } finally {
            if (isMounted()) {
                setLoading(false);
            }
        }
    }, [isMounted]);

    useEffect(() => {
        loadPosts();
    }, [loadPosts]);

    // Filter posts when search, category, or author changes
    useEffect(() => {
        let filtered = posts;

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(post =>
                post.title?.toLowerCase().includes(query) ||
                post.shortDescription?.toLowerCase().includes(query) ||
                post.author?.name?.toLowerCase().includes(query)
            );
        }

        // Apply category filter
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(post => post.category === categoryFilter);
        }

        // Apply author filter
        if (authorFilter !== 'all') {
            filtered = filtered.filter(post => post.author?.id === authorFilter);
        }

        setFilteredPosts(filtered);
        setStats(prev => ({
            ...prev,
            filtered: filtered.length
        }));
    }, [searchQuery, categoryFilter, authorFilter, posts]);

    const handlePostClick = (postId) => {
        navigate(paths.blog.details.replace(':postId', postId));
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleAuthorChange = (event) => {
        setAuthorFilter(event.target.value);
    };

    const clearAllFilters = () => {
        setSearchQuery('');
        setCategoryFilter('all');
        setAuthorFilter('all');
    };

    const hasActiveFilters = searchQuery || categoryFilter !== 'all' || authorFilter !== 'all';

    const [featuredPost, ...restPosts] = filteredPosts;
    const showFeatured = !hasActiveFilters && featuredPost;
    const gridPosts = showFeatured ? restPosts : filteredPosts;

    const renderCard = (post, featured = false) => (
        <PublicPostCard
            key={post.id}
            id={post.id}
            authorAvatar={post.author?.avatar}
            authorName={post.author?.name}
            category={post.category}
            cover={post.cover}
            publishedAt={post.publishedAt}
            readTime={post.readTime}
            shortDescription={post.shortDescription}
            title={post.title}
            likes={post.likes}
            comments={post.comments?.length || 0}
            onClick={() => handlePostClick(post.id)}
            featured={featured}
        />
    );

    return (
        <>
            <Seo title="Blog" />
            <Box component="main" sx={{ flexGrow: 1, bgcolor: BRAND.mist, pb: 10 }}>
                <PageHero
                    title="Blog"
                    subtitle="Tips, finished projects and stories from homeowners and pros in Connecticut and Massachusetts."
                    maxWidth="xl"
                    action={user ? (
                        <Button component={RouterLink} href={paths.dashboard.blog.postCreate} startIcon={<AddRoundedIcon />} sx={{ ...btn.green, minHeight: 52, px: 3, width: { xs: '100%', md: 'auto' } }}>
                            Write a post
                        </Button>
                    ) : null}
                >
                    <Box
                        role="search"
                        sx={{
                            mt: { xs: 3, md: 4 },
                            p: 1,
                            display: 'grid',
                            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) 260px' },
                            alignItems: 'center',
                            gap: 1,
                            bgcolor: '#FFFFFF',
                            borderRadius: RADIUS.card,
                            border: `1px solid ${alpha(BRAND.navy, 0.1)}`,
                            boxShadow: SHADOW.md
                        }}
                    >
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Search articles or authors"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            inputProps={{ 'aria-label': 'Search articles' }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchRoundedIcon sx={{ color: BRAND.navy }} />
                                    </InputAdornment>
                                ),
                                endAdornment: searchQuery ? (
                                    <InputAdornment position="end">
                                        <IconButton aria-label="Clear search" size="small" onClick={() => setSearchQuery('')}>
                                            <CloseRoundedIcon fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                ) : null
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': { height: 52, borderRadius: RADIUS.tile, fontWeight: 500 },
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent !important' },
                                '& .MuiOutlinedInput-root.Mui-focused': { bgcolor: BRAND.mist, boxShadow: `inset 0 0 0 2px ${alpha(BRAND.green, 0.5)}` }
                            }}
                        />
                        <FormControl sx={{ ...fieldSx, '& .MuiOutlinedInput-root': { height: 52, borderRadius: RADIUS.tile } }}>
                            <Select
                                value={authorFilter}
                                onChange={handleAuthorChange}
                                input={<OutlinedInput />}
                                inputProps={{ 'aria-label': 'Author' }}
                                renderValue={(selected) => {
                                    if (selected === 'all') return 'All authors';
                                    return authors.find((a) => a.id === selected)?.name || 'All authors';
                                }}
                            >
                                <MenuItem value="all">All authors</MenuItem>
                                {authors.map((author) => (
                                    <MenuItem key={author.id} value={author.id}>
                                        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ width: '100%' }}>
                                            <Avatar src={author.avatar} sx={{ width: 26, height: 26 }} />
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography noWrap sx={{ fontSize: 14, fontWeight: 600 }}>{author.name}</Typography>
                                                <Typography sx={{ fontSize: 12, color: BRAND.muted }}>
                                                    {author.postCount} {author.postCount === 1 ? 'post' : 'posts'}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </PageHero>

                <Container maxWidth="xl" sx={{ pt: { xs: 3, md: 5 } }}>
                    {categories.length > 0 && (
                        <Box
                            role="group"
                            aria-label="Categories"
                            sx={{
                                display: 'flex',
                                gap: 1,
                                overflowX: 'auto',
                                mx: { xs: -2, sm: 0 },
                                px: { xs: 2, sm: 0 },
                                pb: 0.5,
                                mb: { xs: 3, md: 4 },
                                scrollbarWidth: 'none',
                                '&::-webkit-scrollbar': { display: 'none' }
                            }}
                        >
                            {['all', ...categories].map((category) => {
                                const active = categoryFilter === category;
                                return (
                                    <Box
                                        key={category}
                                        component="button"
                                        type="button"
                                        aria-pressed={active}
                                        onClick={() => setCategoryFilter(category)}
                                        sx={{
                                            flexShrink: 0,
                                            height: 38,
                                            px: 1.75,
                                            border: `1px solid ${active ? BRAND.navy : alpha(BRAND.navy, 0.12)}`,
                                            borderRadius: RADIUS.pill,
                                            bgcolor: active ? BRAND.navy : '#FFFFFF',
                                            color: active ? '#FFFFFF' : BRAND.navy,
                                            font: 'inherit',
                                            fontSize: 14,
                                            fontWeight: 600,
                                            whiteSpace: 'nowrap',
                                            cursor: 'pointer',
                                            transition: 'background-color .2s ease, color .2s ease, border-color .2s ease',
                                            '&:hover': { borderColor: BRAND.navy },
                                            ...focusRingSx
                                        }}
                                    >
                                        {category === 'all' ? 'All' : category}
                                    </Box>
                                );
                            })}
                        </Box>
                    )}

                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
                        <Typography sx={{ fontWeight: 600, color: BRAND.muted }}>
                            {loading ? 'Loading articles' : `${stats.filtered} of ${stats.total} articles`}
                        </Typography>
                        {hasActiveFilters && (
                            <Button onClick={clearAllFilters} sx={{ ...btn.text, minHeight: 36, fontSize: 14 }}>
                                Clear filters
                            </Button>
                        )}
                    </Stack>

                    {error && <Alert severity="error" sx={{ mb: 3, borderRadius: RADIUS.inner }}>We couldn't load the blog. Please try again.</Alert>}

                    {loading ? (
                        <Stack spacing={{ xs: 2, md: 3 }}>
                            <Skeleton variant="rounded" height={380} sx={{ borderRadius: RADIUS.panel }} />
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: { xs: 2, md: 3 } }}>
                                {[0, 1, 2].map((i) => <Skeleton key={i} variant="rounded" height={360} sx={{ borderRadius: RADIUS.card }} />)}
                            </Box>
                        </Stack>
                    ) : filteredPosts.length === 0 ? (
                        <EmptyState
                            icon={<ArticleOutlinedIcon />}
                            title="No articles found"
                            text="Try another search or category."
                            action={hasActiveFilters ? <Button onClick={clearAllFilters} sx={btn.outline}>Clear filters</Button> : null}
                        />
                    ) : (
                        <Stack spacing={{ xs: 2, md: 3 }}>
                            {showFeatured && renderCard(featuredPost, true)}
                            {gridPosts.length > 0 && (
                                <Box
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' },
                                        gap: { xs: 2, md: 3 }
                                    }}
                                >
                                    {gridPosts.map((post) => renderCard(post))}
                                </Box>
                            )}
                        </Stack>
                    )}
                </Container>
            </Box>
        </>
    );
};

export default Page;
