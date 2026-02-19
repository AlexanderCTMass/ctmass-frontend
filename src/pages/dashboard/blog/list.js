import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowLeftIcon from '@untitled-ui/icons-react/build/esm/ArrowLeft';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import {
    Box,
    Container,
    Divider,
    Stack,
    SvgIcon,
    Typography,
    Unstable_Grid2 as Grid,
    CircularProgress,
    Alert,
    TextField,
    InputAdornment,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Chip,
    Avatar,
    ListItemAvatar,
    ListItemText, Button
} from '@mui/material';
import SearchMdIcon from '@untitled-ui/icons-react/build/esm/SearchMd';
import { blogService } from 'src/service/blog-service';
import { Seo } from 'src/components/seo';
import { useMounted } from 'src/hooks/use-mounted';
import { usePageView } from 'src/hooks/use-page-view';
import { useAuth } from 'src/hooks/use-auth';
import { paths } from 'src/paths';
import { PostNewsletter } from 'src/sections/dashboard/blog/post-newsletter';
import { PostCard } from 'src/sections/dashboard/blog/post-card';
import { profileService } from 'src/service/profile-service';
import { BlogHeader, BlogHeaderActions } from "src/sections/dashboard/blog/blog-header";

// Компонент для отображения опции автора в селекте
const AuthorMenuItem = ({ author }) => (
    <MenuItem value={author.id}>
        <Stack direction="row" spacing={1} alignItems="center">
            <Avatar src={author.avatar} sx={{ width: 24, height: 24 }} />
            <Typography variant="body2">{author.name}</Typography>
        </Stack>
    </MenuItem>
);

const Page = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const isMounted = useMounted();
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
            const data = await blogService.getPosts(50); // Увеличим лимит для фильтрации

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
        navigate(paths.dashboard.blog.postDetails.replace(':postId', postId));
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleCategoryChange = (event) => {
        setCategoryFilter(event.target.value);
    };

    const handleAuthorChange = (event) => {
        setAuthorFilter(event.target.value);
    };

    const clearAllFilters = () => {
        setSearchQuery('');
        setCategoryFilter('all');
        setAuthorFilter('all');
    };

    const userName = profileService.getUserName(user);
    const hasActiveFilters = searchQuery || categoryFilter !== 'all' || authorFilter !== 'all';

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <>
            <Seo title="Blog: Post List" />
            <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
                <Container maxWidth="xl">
                    <BlogHeader
                        title="Blog"
                        breadcrumbs={[{ label: 'List' }]}
                        action={<BlogHeaderActions.List />}
                    />

                    {error && (
                        <Alert severity="error" sx={{ mb: 4 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Stats и активные фильтры */}
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ mb: 2 }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            Showing {stats.filtered} of {stats.total} posts
                        </Typography>

                        {hasActiveFilters && (
                            <Button
                                size="small"
                                onClick={clearAllFilters}
                                color="inherit"
                            >
                                Clear all filters
                            </Button>
                        )}
                    </Stack>

                    {/* Filters */}
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={2}
                        sx={{ mb: 4 }}
                    >
                        <TextField
                            label="Search posts by title or content..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            sx={{ flex: 2 }}
                            size="small"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SvgIcon fontSize="small">
                                            <SearchMdIcon />
                                        </SvgIcon>
                                    </InputAdornment>
                                ),
                                endAdornment: searchQuery && (
                                    <InputAdornment position="end">
                                        <Button
                                            size="small"
                                            onClick={() => setSearchQuery('')}
                                            sx={{ minWidth: 'auto', p: 0.5 }}
                                        >
                                            ✕
                                        </Button>
                                    </InputAdornment>
                                )
                            }}
                        />

                        <FormControl variant={"filled"} size="small" sx={{ minWidth: 180 }}>
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={categoryFilter}
                                onChange={handleCategoryChange}
                                label="Category"
                            >
                                <MenuItem value="all">
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <span>All Categories</span>
                                        <Chip
                                            label={categories.length}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Stack>
                                </MenuItem>
                                {categories.map((category) => (
                                    <MenuItem key={category} value={category}>
                                        {category}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl variant={"filled"} size="small" sx={{ minWidth: 200 }}>
                            <InputLabel>Author</InputLabel>
                            <Select
                                value={authorFilter}
                                onChange={handleAuthorChange}
                                label="Author"
                                renderValue={(selected) => {
                                    if (selected === 'all') return 'All Authors';
                                    const author = authors.find(a => a.id === selected);
                                    return author ? author.name : 'All Authors';
                                }}
                            >
                                <MenuItem value="all">
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <span>All Authors</span>
                                        <Chip
                                            label={authors.length}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Stack>
                                </MenuItem>
                                {authors.map((author) => (
                                    <MenuItem key={author.id} value={author.id}>
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
                                            <Avatar src={author.avatar} sx={{ width: 24, height: 24 }} />
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="body2">{author.name}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {author.postCount} {author.postCount === 1 ? 'post' : 'posts'}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Stack>

                    {/* Активные фильтры в виде чипсов */}
                    {hasActiveFilters && (
                        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                            {searchQuery && (
                                <Chip
                                    label={`Search: "${searchQuery}"`}
                                    size="small"
                                    onDelete={() => setSearchQuery('')}
                                />
                            )}
                            {categoryFilter !== 'all' && (
                                <Chip
                                    label={`Category: ${categoryFilter}`}
                                    size="small"
                                    onDelete={() => setCategoryFilter('all')}
                                />
                            )}
                            {authorFilter !== 'all' && (
                                <Chip
                                    label={`Author: ${authors.find(a => a.id === authorFilter)?.name}`}
                                    size="small"
                                    onDelete={() => setAuthorFilter('all')}
                                />
                            )}
                        </Stack>
                    )}

                    <Typography variant="h4">
                        Recent Articles
                    </Typography>
                    <Typography color="text.secondary" sx={{ mt: 2 }} variant="body1">
                        Discover the latest news, tips and user research insights.
                    </Typography>

                    <Divider sx={{ my: 4 }} />

                    {filteredPosts.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                No posts found
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Try adjusting your search or filter criteria
                            </Typography>
                            {hasActiveFilters && (
                                <Button
                                    variant="outlined"
                                    onClick={clearAllFilters}
                                >
                                    Clear all filters
                                </Button>
                            )}
                        </Box>
                    ) : (
                        <Grid container spacing={4}>
                            {filteredPosts.map((post) => (
                                <Grid key={post.id} xs={12} md={6}>
                                    <PostCard
                                        id={post.id}
                                        authorAvatar={post.author?.avatar}
                                        authorName={post.author?.name}
                                        authorId={post.author?.id}
                                        category={post.category}
                                        cover={post.cover}
                                        publishedAt={post.publishedAt}
                                        readTime={post.readTime}
                                        shortDescription={post.shortDescription}
                                        title={post.title}
                                        likes={post.likes}
                                        comments={post.comments?.length || 0}
                                        onClick={() => handlePostClick(post.id)}
                                        sx={{ height: '100%', cursor: 'pointer' }}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    )}

                    <Stack
                        alignItems="center"
                        direction="row"
                        justifyContent="center"
                        spacing={1}
                        sx={{ mt: 4, mb: 8 }}
                    >
                        <Button
                            disabled
                            startIcon={<SvgIcon><ArrowLeftIcon /></SvgIcon>}
                        >
                            Newer
                        </Button>
                        <Button
                            endIcon={<SvgIcon><ArrowRightIcon /></SvgIcon>}
                        >
                            Older posts
                        </Button>
                    </Stack>

                    <Box sx={{ mt: 8 }}>
                        <PostNewsletter />
                    </Box>
                </Container>
            </Box>
        </>
    );
};

export default Page;