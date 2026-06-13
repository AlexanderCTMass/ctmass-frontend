import { memo, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Stack,
    Typography,
    useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Chart } from 'src/components/chart';
import { tradesApi } from 'src/api/trades';
import { paths } from 'src/paths';

const getRandomViews = () => Math.floor(Math.random() * 10) + 1;

const getLast6Months = () => {
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
            name: date.toLocaleDateString('en-US', { month: 'short' }),
            fullName: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        });
    }

    return months;
};

const generateMockData = (trades, months) => {
    const seriesData = {};

    trades.forEach((trade) => {
        const label = trade.primarySpecialtyLabel || trade.title || 'Trade';
        if (!seriesData[label]) {
            seriesData[label] = [];
        }

        months.forEach(() => {
            seriesData[label].push(getRandomViews());
        });
    });

    return Object.entries(seriesData).slice(0, 3).map(([name, data]) => ({
        name,
        data
    }));
};

const StatisticsChart = memo(({ title, series, categories, colors, total }) => {
    const theme = useTheme();

    const chartOptions = useMemo(() => ({
        chart: {
            background: 'transparent',
            stacked: true,
            toolbar: {
                show: false
            },
            zoom: {
                enabled: false
            }
        },
        colors: colors || [theme.palette.primary.main, theme.palette.error.main, theme.palette.success.main],
        dataLabels: {
            enabled: false
        },
        fill: {
            opacity: 1,
            type: 'solid'
        },
        grid: {
            borderColor: theme.palette.divider,
            strokeDashArray: 2,
            xaxis: {
                lines: {
                    show: false
                }
            },
            yaxis: {
                lines: {
                    show: true
                }
            }
        },
        legend: {
            horizontalAlign: 'center',
            labels: {
                colors: theme.palette.text.secondary
            },
            position: 'bottom',
            show: true
        },
        plotOptions: {
            bar: {
                columnWidth: '50%',
                borderRadius: 4
            }
        },
        stroke: {
            colors: ['transparent'],
            show: true,
            width: 2
        },
        theme: {
            mode: theme.palette.mode
        },
        xaxis: {
            axisBorder: {
                color: theme.palette.divider,
                show: true
            },
            axisTicks: {
                color: theme.palette.divider,
                show: true
            },
            categories: categories,
            labels: {
                offsetY: 5,
                style: {
                    colors: theme.palette.text.secondary
                }
            }
        },
        yaxis: {
            labels: {
                formatter: (value) => (value > 0 ? `${value}` : `${value}`),
                offsetX: -10,
                style: {
                    colors: theme.palette.text.secondary
                }
            }
        }
    }), [theme, categories, colors]);

    return (
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <CardHeader
                title={title}
                subheader="Last 6 months"
                action={
                    total !== undefined && (
                        <Typography variant="h5" fontWeight={700} sx={{ pr: 1, pt: 0.5, color: 'text.primary' }}>
                            {total}
                        </Typography>
                    )
                }
                titleTypographyProps={{
                    variant: 'h6',
                    fontWeight: 600
                }}
            />
            <CardContent>
                <Chart
                    height={350}
                    options={chartOptions}
                    series={series}
                    type="bar"
                />
            </CardContent>
        </Card>
    );
});

StatisticsChart.propTypes = {
    title: PropTypes.string.isRequired,
    series: PropTypes.array.isRequired,
    categories: PropTypes.array.isRequired,
    colors: PropTypes.array,
    total: PropTypes.number
};

StatisticsChart.displayName = 'StatisticsChart';

const EmptyState = memo(({ title, description, onCreateClick }) => (
    <Card
        elevation={0}
        sx={{
            border: '1px solid',
            borderColor: 'divider',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}
    >
        <CardContent>
            <Stack spacing={3} alignItems="center" textAlign="center" sx={{ py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                    {title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
                    {description}
                </Typography>
                <Button
                    variant="contained"
                    size="large"
                    onClick={onCreateClick}
                    sx={{ mt: 2 }}
                >
                    Create Resume
                </Button>
            </Stack>
        </CardContent>
    </Card>
));

EmptyState.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    onCreateClick: PropTypes.func.isRequired
};

EmptyState.displayName = 'EmptyState';

const StatisticsSection = ({ userId }) => {
    const navigate = useNavigate();
    const theme = useTheme();
    const [trades, setTrades] = useState([]);
    const [loading, setLoading] = useState(true);

    const months = useMemo(() => getLast6Months(), []);

    useEffect(() => {
        const fetchTrades = async () => {
            if (!userId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const userTrades = await tradesApi.getTradesByUser(userId);
                setTrades(userTrades);
            } catch (error) {
                console.error('Failed to fetch trades:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTrades();
    }, [userId]);

    const tradesSeries = useMemo(() => {
        if (!trades.length) return [];
        return generateMockData(trades, months);
    }, [trades, months]);

    const requestsSeries = useMemo(() => {
        if (!trades.length) return [];
        return generateMockData(trades, months);
    }, [trades, months]);

    const handleCreateTrade = () => {
        navigate(paths.dashboard.trades.create);
    };

    if (loading) {
        return (
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                <Box sx={{ flex: 1 }}>
                    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', height: 400 }}>
                        <CardContent>
                            <Typography variant="body2" color="text.secondary" align="center">
                                Loading...
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
                <Box sx={{ flex: 1 }}>
                    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', height: 400 }}>
                        <CardContent>
                            <Typography variant="body2" color="text.secondary" align="center">
                                Loading...
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            </Stack>
        );
    }

    if (!trades.length) {
        return (
            <EmptyState
                title="You don't have any resumes yet"
                description="Create your first resume to start receiving views and orders from clients"
                onCreateClick={handleCreateTrade}
            />
        );
    }

    const categories = months.map((m) => m.name);
    const tradesTotal = tradesSeries.reduce((sum, series) =>
        sum + series.data.reduce((a, b) => a + b, 0), 0
    );
    const requestsTotal = requestsSeries.reduce((sum, series) =>
        sum + series.data.reduce((a, b) => a + b, 0), 0
    );

    return (
        <Stack spacing={3}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                <Box sx={{ flex: 1 }}>
                    <StatisticsChart
                        title="View Trades Statistics Summary"
                        series={tradesSeries}
                        categories={categories}
                        total={tradesTotal}
                        colors={[
                            theme.palette.error.main,
                            theme.palette.warning.main,
                            theme.palette.success.main
                        ]}
                    />
                </Box>
                <Box sx={{ flex: 1 }}>
                    <StatisticsChart
                        title="View Request Statistics Summary"
                        series={requestsSeries}
                        categories={categories}
                        total={requestsTotal}
                        colors={[
                            theme.palette.error.main,
                            theme.palette.warning.main,
                            theme.palette.success.main
                        ]}
                    />
                </Box>
            </Stack>
            <Box sx={{ textAlign: 'right' }}>
                <Button variant="text" color="primary" sx={{ fontWeight: 600 }}>
                    View All Statistics
                </Button>
            </Box>
        </Stack>
    );
};

StatisticsSection.propTypes = {
    userId: PropTypes.string
};

StatisticsSection.defaultProps = {
    userId: null
};

export default memo(StatisticsSection);
