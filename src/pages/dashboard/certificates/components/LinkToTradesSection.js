import { memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Card,
    CardContent,
    Checkbox,
    Chip,
    Typography
} from '@mui/material';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';

const STATUS_COLORS = {
    active: 'success',
    on_review: 'warning',
    rejected: 'error',
    draft: 'default'
};

const STATUS_LABELS = {
    active: 'Active',
    on_review: 'On Review',
    rejected: 'Rejected',
    draft: 'Draft'
};

const LinkToTradesSection = ({ trades, linkedTradeIds, onChange }) => {
    const handleToggle = useCallback((tradeId, checked) => {
        if (checked) {
            onChange([...linkedTradeIds, tradeId]);
        } else {
            onChange(linkedTradeIds.filter((id) => id !== tradeId));
        }
    }, [linkedTradeIds, onChange]);

    return (
        <Card variant="outlined" sx={{ borderRadius: 3, mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <LinkOutlinedIcon sx={{ color: 'primary.main', fontSize: 18 }} />
                    <Typography variant="overline" fontWeight={700} color="text.secondary" letterSpacing={1.5}>
                        Section 5: Link to Trades
                    </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Link this document to your trade resumes
                </Typography>

                {trades.length === 0 ? (
                    <Typography variant="body2" color="text.disabled">
                        No trades found. Create a trade first to link this document.
                    </Typography>
                ) : (
                    <Box>
                        {trades.map((trade) => {
                            const isLinked = linkedTradeIds.includes(trade.id);
                            const statusColor = STATUS_COLORS[trade.status] || 'default';
                            const statusLabel = STATUS_LABELS[trade.status] || trade.status;

                            return (
                                <Box
                                    key={trade.id}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                        px: 2,
                                        py: 1.5,
                                        border: '1px solid',
                                        borderColor: isLinked ? 'primary.main' : 'divider',
                                        borderRadius: 2,
                                        mb: 1,
                                        bgcolor: isLinked ? 'primary.alpha4' : 'transparent',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <Checkbox
                                        size="small"
                                        checked={isLinked}
                                        onChange={(e) => handleToggle(trade.id, e.target.checked)}
                                        sx={{ p: 0, color: 'primary.main' }}
                                    />

                                    <Typography variant="body2" fontWeight={500} sx={{ flexGrow: 1 }}>
                                        {trade.title}
                                    </Typography>

                                    <Chip
                                        label={statusLabel}
                                        size="small"
                                        color={statusColor}
                                        variant="outlined"
                                        sx={{ borderRadius: 1 }}
                                    />
                                </Box>
                            );
                        })}
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

LinkToTradesSection.propTypes = {
    trades: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            title: PropTypes.string.isRequired,
            status: PropTypes.string
        })
    ).isRequired,
    linkedTradeIds: PropTypes.arrayOf(PropTypes.string).isRequired,
    onChange: PropTypes.func.isRequired
};

export default memo(LinkToTradesSection);
