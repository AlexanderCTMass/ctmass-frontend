import {
    Grid,
    Card,
    Stack,
    Typography,
    Avatar,
    LinearProgress,
    SvgIcon
} from '@mui/material';
import {
    Inventory as InventoryIcon,
    Visibility as VisibilityIcon,
    Favorite as FavoriteIcon,
    AttachMoney as MoneyIcon,
    CheckCircle as ActiveIcon,
    Drafts,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    LocalOffer as LocalOfferIcon
} from '@mui/icons-material';
import { SeverityPill } from 'src/components/severity-pill';

export const StatsCards = ({ stats, onFilterChange }) => {
    // Расчет процента изменений (для демо, в реальности нужно считать на основе предыдущих данных)
    const trends = {
        views: 12,
        likes: 5,
        value: 8,
        active: 3,
        draft: -2
    };

    return (
        <Grid container spacing={3}>
            {/* Total Listings */}
            <Grid item xs={12} md={6} lg={3}>
                <Card>
                    <Stack alignItems="center" direction="row" spacing={2} sx={{ p: 3 }}>
                        <Stack spacing={1} sx={{ flexGrow: 1 }}>
                            <Typography color="text.secondary" variant="overline">
                                Total Listings
                            </Typography>
                            <Stack alignItems="center" direction="row" spacing={1}>
                                <Typography variant="h5">
                                    {stats.total}
                                </Typography>
                                <SeverityPill color="info">
                                    +{Math.round(stats.active / stats.total * 100) || 0}% active
                                </SeverityPill>
                            </Stack>
                        </Stack>
                        <Avatar
                            sx={{
                                backgroundColor: 'primary.main',
                                color: 'primary.contrastText',
                                height: 48,
                                width: 48
                            }}
                        >
                            <SvgIcon>
                                <InventoryIcon />
                            </SvgIcon>
                        </Avatar>
                    </Stack>
                </Card>
            </Grid>

            {/* Active Listings */}
            <Grid item xs={12} md={6} lg={3}>
                <Card>
                    <Stack alignItems="center" direction="row" spacing={2} sx={{ p: 3 }}>
                        <Stack spacing={1} sx={{ flexGrow: 1 }}>
                            <Typography color="text.secondary" variant="overline">
                                Active Listings
                            </Typography>
                            <Stack alignItems="center" direction="row" spacing={1}>
                                <Typography variant="h5">
                                    {stats.active}
                                </Typography>
                                <SeverityPill color="success">
                                    +{trends.active}%
                                </SeverityPill>
                            </Stack>
                        </Stack>
                        <Avatar
                            sx={{
                                backgroundColor: 'success.main',
                                color: 'success.contrastText',
                                height: 48,
                                width: 48
                            }}
                        >
                            <SvgIcon>
                                <ActiveIcon />
                            </SvgIcon>
                        </Avatar>
                    </Stack>
                </Card>
            </Grid>

            {/* Drafts */}
            <Grid item xs={12} md={6} lg={3}>
                <Card>
                    <Stack alignItems="center" direction="row" spacing={2} sx={{ p: 3 }}>
                        <Stack spacing={1} sx={{ flexGrow: 1 }}>
                            <Typography color="text.secondary" variant="overline">
                                Drafts
                            </Typography>
                            <Stack alignItems="center" direction="row" spacing={1}>
                                <Typography variant="h5">
                                    {stats.draft}
                                </Typography>
                                <SeverityPill color="warning">
                                    {trends.draft}%
                                </SeverityPill>
                            </Stack>
                        </Stack>
                        <Avatar
                            sx={{
                                backgroundColor: 'warning.main',
                                color: 'warning.contrastText',
                                height: 48,
                                width: 48
                            }}
                        >
                            <SvgIcon>
                                <Drafts />
                            </SvgIcon>
                        </Avatar>
                    </Stack>
                </Card>
            </Grid>

            {/* Sold */}
            <Grid item xs={12} md={6} lg={3}>
                <Card>
                    <Stack alignItems="center" direction="row" spacing={2} sx={{ p: 3 }}>
                        <Stack spacing={1} sx={{ flexGrow: 1 }}>
                            <Typography color="text.secondary" variant="overline">
                                Sold
                            </Typography>
                            <Stack alignItems="center" direction="row" spacing={1}>
                                <Typography variant="h5">
                                    {stats.sold || 0}
                                </Typography>
                                <SeverityPill color="info">
                                    +2%
                                </SeverityPill>
                            </Stack>
                        </Stack>
                        <Avatar
                            sx={{
                                backgroundColor: 'info.main',
                                color: 'info.contrastText',
                                height: 48,
                                width: 48
                            }}
                        >
                            <SvgIcon>
                                <LocalOfferIcon />
                            </SvgIcon>
                        </Avatar>
                    </Stack>
                </Card>
            </Grid>

            {/* Total Views */}
            <Grid item xs={12} md={6} lg={3}>
                <Card>
                    <Stack alignItems="center" direction="row" spacing={2} sx={{ p: 3 }}>
                        <Stack spacing={1} sx={{ flexGrow: 1 }}>
                            <Typography color="text.secondary" variant="overline">
                                Total Views
                            </Typography>
                            <Stack alignItems="center" direction="row" spacing={1}>
                                <Typography variant="h5">
                                    {stats.totalViews?.toLocaleString() || 0}
                                </Typography>
                                <SeverityPill color="success">
                                    +{trends.views}%
                                </SeverityPill>
                            </Stack>
                        </Stack>
                        <Avatar
                            sx={{
                                backgroundColor: 'secondary.main',
                                color: 'secondary.contrastText',
                                height: 48,
                                width: 48
                            }}
                        >
                            <SvgIcon>
                                <VisibilityIcon />
                            </SvgIcon>
                        </Avatar>
                    </Stack>
                </Card>
            </Grid>

            {/* Total Likes */}
            <Grid item xs={12} md={6} lg={3}>
                <Card>
                    <Stack alignItems="center" direction="row" spacing={2} sx={{ p: 3 }}>
                        <Stack spacing={1} sx={{ flexGrow: 1 }}>
                            <Typography color="text.secondary" variant="overline">
                                Total Likes
                            </Typography>
                            <Stack alignItems="center" direction="row" spacing={1}>
                                <Typography variant="h5">
                                    {stats.totalLikes?.toLocaleString() || 0}
                                </Typography>
                                <SeverityPill color="success">
                                    +{trends.likes}%
                                </SeverityPill>
                            </Stack>
                        </Stack>
                        <Avatar
                            sx={{
                                backgroundColor: 'error.main',
                                color: 'error.contrastText',
                                height: 48,
                                width: 48
                            }}
                        >
                            <SvgIcon>
                                <FavoriteIcon />
                            </SvgIcon>
                        </Avatar>
                    </Stack>
                </Card>
            </Grid>

            {/* Total Value */}
            <Grid item xs={12} md={6} lg={3}>
                <Card>
                    <Stack spacing={1} sx={{ p: 3 }}>
                        <Typography color="text.secondary" variant="overline">
                            Total Value
                        </Typography>
                        <Stack alignItems="center" direction="row" spacing={1}>
                            <Typography variant="h5">
                                ${stats.totalValue?.toLocaleString() || 0}
                            </Typography>
                            <LinearProgress
                                color="success"
                                sx={{ flexGrow: 1 }}
                                value={75}
                                variant="determinate"
                            />
                        </Stack>
                    </Stack>
                </Card>
            </Grid>

            {/* Conversion Rate */}
            <Grid item xs={12} md={6} lg={3}>
                <Card
                    sx={{
                        alignItems: 'center',
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText',
                        display: 'flex',
                        justifyContent: 'space-between'
                    }}
                >
                    <Stack alignItems="center" direction="row" spacing={2} sx={{ p: 3 }}>
                        <Stack spacing={1} sx={{ flexGrow: 1 }}>
                            <Typography color="inherit" variant="overline">
                                Conversion Rate
                            </Typography>
                            <Typography color="inherit" variant="h5">
                                {stats.active && stats.total
                                    ? Math.round((stats.active / stats.total) * 100)
                                    : 0}%
                            </Typography>
                        </Stack>
                        <Avatar
                            sx={{
                                backgroundColor: 'primary.contrastText',
                                color: 'primary.main',
                                height: 48,
                                width: 48
                            }}
                        >
                            <SvgIcon>
                                <TrendingUpIcon />
                            </SvgIcon>
                        </Avatar>
                    </Stack>
                </Card>
            </Grid>
        </Grid>
    );
};

// Альтернативная версия с кликабельными карточками для фильтрации
export const StatsCardsClickable = ({ stats, onFilterChange }) => {
    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={3}>
                <Card
                    sx={{
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: (theme) => theme.shadows[4]
                        }
                    }}
                    onClick={() => onFilterChange?.('all')}
                >
                    <Stack alignItems="center" direction="row" spacing={2} sx={{ p: 3 }}>
                        <Stack spacing={1} sx={{ flexGrow: 1 }}>
                            <Typography color="text.secondary" variant="overline">
                                All Listings
                            </Typography>
                            <Typography variant="h5">
                                {stats.total}
                            </Typography>
                        </Stack>
                        <Avatar
                            sx={{
                                backgroundColor: 'primary.main',
                                color: 'primary.contrastText',
                                height: 48,
                                width: 48
                            }}
                        >
                            <SvgIcon>
                                <InventoryIcon />
                            </SvgIcon>
                        </Avatar>
                    </Stack>
                </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={3}>
                <Card
                    sx={{
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: (theme) => theme.shadows[4]
                        }
                    }}
                    onClick={() => onFilterChange?.('active')}
                >
                    <Stack alignItems="center" direction="row" spacing={2} sx={{ p: 3 }}>
                        <Stack spacing={1} sx={{ flexGrow: 1 }}>
                            <Typography color="text.secondary" variant="overline">
                                Active
                            </Typography>
                            <Typography variant="h5">
                                {stats.active}
                            </Typography>
                        </Stack>
                        <Avatar
                            sx={{
                                backgroundColor: 'success.main',
                                color: 'success.contrastText',
                                height: 48,
                                width: 48
                            }}
                        >
                            <SvgIcon>
                                <ActiveIcon />
                            </SvgIcon>
                        </Avatar>
                    </Stack>
                </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={3}>
                <Card
                    sx={{
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: (theme) => theme.shadows[4]
                        }
                    }}
                    onClick={() => onFilterChange?.('draft')}
                >
                    <Stack alignItems="center" direction="row" spacing={2} sx={{ p: 3 }}>
                        <Stack spacing={1} sx={{ flexGrow: 1 }}>
                            <Typography color="text.secondary" variant="overline">
                                Drafts
                            </Typography>
                            <Typography variant="h5">
                                {stats.draft}
                            </Typography>
                        </Stack>
                        <Avatar
                            sx={{
                                backgroundColor: 'warning.main',
                                color: 'warning.contrastText',
                                height: 48,
                                width: 48
                            }}
                        >
                            <SvgIcon>
                                <Drafts />
                            </SvgIcon>
                        </Avatar>
                    </Stack>
                </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={3}>
                <Card
                    sx={{
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: (theme) => theme.shadows[4]
                        }
                    }}
                    onClick={() => onFilterChange?.('sold')}
                >
                    <Stack alignItems="center" direction="row" spacing={2} sx={{ p: 3 }}>
                        <Stack spacing={1} sx={{ flexGrow: 1 }}>
                            <Typography color="text.secondary" variant="overline">
                                Sold
                            </Typography>
                            <Typography variant="h5">
                                {stats.sold || 0}
                            </Typography>
                        </Stack>
                        <Avatar
                            sx={{
                                backgroundColor: 'info.main',
                                color: 'info.contrastText',
                                height: 48,
                                width: 48
                            }}
                        >
                            <SvgIcon>
                                <LocalOfferIcon />
                            </SvgIcon>
                        </Avatar>
                    </Stack>
                </Card>
            </Grid>
        </Grid>
    );
};