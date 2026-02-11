import { useMemo } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    useTheme
} from '@mui/material';
import Chart from 'react-apexcharts';

const generateWeeklyData = (totalViews) => {
    const data = [];
    let remaining = totalViews;

    for (let i = 0; i < 6; i++) {
        const maxValue = Math.max(1, Math.floor(remaining / (7 - i)));
        const value = Math.floor(Math.random() * maxValue) + 1;
        data.push(value);
        remaining -= value;
    }

    data.push(Math.max(0, remaining));

    return data;
};

function ViewsSparklineChart({ totalViews }) {
    const theme = useTheme();

    const weeklyData = useMemo(() => generateWeeklyData(totalViews), [totalViews]);

    const chartOptions = useMemo(() => ({
        chart: {
            type: 'area',
            sparkline: {
                enabled: false
            },
            toolbar: {
                show: false
            },
            zoom: {
                enabled: false
            }
        },
        stroke: {
            curve: 'smooth',
            width: 3
        },
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'light',
                type: 'vertical',
                shadeIntensity: 0.5,
                opacityFrom: 0.4,
                opacityTo: 0.1,
                stops: [0, 100]
            }
        },
        colors: [theme.palette.primary.main, theme.palette.error.main, theme.palette.info.main],
        dataLabels: {
            enabled: false
        },
        grid: {
            show: true,
            borderColor: theme.palette.divider,
            strokeDashArray: 3,
            padding: {
                top: 0,
                right: 10,
                bottom: 0,
                left: 10
            }
        },
        xaxis: {
            categories: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
            labels: {
                style: {
                    colors: theme.palette.text.secondary,
                    fontSize: '12px'
                }
            },
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            }
        },
        yaxis: {
            show: true,
            labels: {
                style: {
                    colors: theme.palette.text.secondary,
                    fontSize: '12px'
                }
            }
        },
        tooltip: {
            theme: theme.palette.mode,
            x: {
                show: true
            },
            y: {
                formatter: (value) => `${value} views`
            }
        },
        legend: {
            show: true,
            position: 'top',
            horizontalAlign: 'left',
            labels: {
                colors: theme.palette.text.primary
            }
        }
    }), [theme]);

    const series = useMemo(() => [
        {
            name: 'Total view',
            data: weeklyData
        },
        {
            name: 'Show in search',
            data: weeklyData.map(val => Math.floor(val * 0.6))
        },
        {
            name: 'Click',
            data: weeklyData.map(val => Math.floor(val * 0.3))
        }
    ], [weeklyData]);

    return (
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                        7-day Views Sparkline
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Views trend over the last 7 days
                    </Typography>
                </Box>

                <Chart
                    options={chartOptions}
                    series={series}
                    type="area"
                    height={350}
                />

                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        Total views this week: <strong>{totalViews}</strong>
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
}

export default ViewsSparklineChart;
