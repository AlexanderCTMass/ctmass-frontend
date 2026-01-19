import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    ButtonBase,
    Paper,
    Stack,
    Typography,
    useMediaQuery
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import Diversity3Icon from '@mui/icons-material/Diversity3';

const ICON_POOL = ['🌟', '🤝', '🎖️', '🌱', '💡', '🛠️', '🧭', '🚀', '🧩', '🏳️‍🌈', '🎓', '🛡️', '🏅', '🌍', '💼'];

const hashString = (value) => {
    if (!value) {
        return 0;
    }
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
        hash = (hash << 5) - hash + value.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
};

const pickIcon = (value, fallback) => {
    if (fallback) {
        return fallback;
    }
    const index = hashString(value) % ICON_POOL.length;
    return ICON_POOL[index];
};

const humanize = (value) =>
    String(value || '')
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, (letter) => letter.toUpperCase());

const CommunityAttributesSection = ({ groups, dictionary, summary }) => {
    const theme = useTheme();

    const items = useMemo(() => {
        const unique = Array.from(new Set((groups || []).filter(Boolean)));

        return unique
            .map((value, index) => {
                const key = String(value.value || value);
                const dictionaryKey = key.toLowerCase();
                const definition = dictionary?.[key] || dictionary?.[dictionaryKey] || {};

                const label = value.label || definition.label || definition.name || humanize(key);
                const description = value.description || definition.description || '';
                const icon = pickIcon(key, value.icon || definition.icon);

                return {
                    key,
                    label,
                    description,
                    icon,
                    order: typeof definition.order === 'number' ? definition.order : index
                };
            })
            .sort((a, b) => {
                if (a.order !== b.order) {
                    return a.order - b.order;
                }
                return a.label.localeCompare(b.label);
            });
    }, [groups, dictionary]);

    const [activeKey, setActiveKey] = useState(items[0]?.key || null);

    useEffect(() => {
        setActiveKey(items[0]?.key || null);
    }, [items]);

    const activeItem = items.find((item) => item.key === activeKey) || null;
    const descriptionText = activeItem?.description?.trim()
        ? activeItem.description.trim()
        : 'Description will be added soon.';
    const summaryText = summary?.trim() || '';
    const hasGroups = items.length > 0;

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                p: { xs: 3, md: 4 }
            }}
        >
            <Stack spacing={3}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Diversity3Icon color="primary" />
                    <Typography variant="h6" fontWeight={700}>
                        Community Attributes
                    </Typography>
                </Stack>

                <Typography variant="body2" color="text.secondary">
                    {summaryText ||
                        'This professional participates in the following community initiatives and affinity groups.'}
                </Typography>

                {hasGroups ? (
                    <Box
                        sx={{
                            overflow: 'auto',
                            mx: { xs: -3, md: -4 },
                            px: { xs: 3, md: 4 },
                            '&::-webkit-scrollbar': {
                                height: 8
                            },
                            '&::-webkit-scrollbar-track': {
                                backgroundColor: 'transparent'
                            },
                            '&::-webkit-scrollbar-thumb': {
                                backgroundColor: (t) => alpha(t.palette.primary.main, 0.2),
                                borderRadius: 4,
                                '&:hover': {
                                    backgroundColor: (t) => alpha(t.palette.primary.main, 0.3)
                                }
                            }
                        }}
                    >
                        <Stack
                            direction="row"
                            spacing={1.5}
                            sx={{
                                pb: 1,
                                minWidth: 'fit-content'
                            }}
                        >
                            {items.map((item) => {
                                const isActive = item.key === activeKey;
                                return (
                                    <ButtonBase
                                        key={item.key}
                                        onClick={() => setActiveKey(item.key)}
                                        sx={(themeArg) => ({
                                            position: 'relative',
                                            flexShrink: 0,
                                            borderRadius: 999,
                                            border: '1px solid',
                                            borderColor: isActive
                                                ? themeArg.palette.primary.main
                                                : themeArg.palette.divider,
                                            background: isActive
                                                ? `linear-gradient(135deg, ${alpha(themeArg.palette.primary.main, 0.2)}, ${alpha(themeArg.palette.primary.main, 0.05)})`
                                                : alpha(themeArg.palette.primary.main, 0.06),
                                            color: isActive
                                                ? themeArg.palette.primary.main
                                                : themeArg.palette.text.primary,
                                            px: 2,
                                            py: 1.25,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 0.75,
                                            textAlign: 'left',
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                borderColor: themeArg.palette.primary.main,
                                                background: `linear-gradient(135deg, ${alpha(themeArg.palette.primary.main, 0.16)}, ${alpha(themeArg.palette.primary.main, 0.04)})`
                                            },
                                        })}
                                    >
                                        <Box
                                            component="span"
                                            sx={{
                                                fontSize: 18,
                                                lineHeight: 1
                                            }}
                                        >
                                            {item.icon}
                                        </Box>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: 600,
                                                lineHeight: 1.2,
                                                textAlign: 'center',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {item.label}
                                        </Typography>
                                    </ButtonBase>
                                );
                            })}
                        </Stack>
                    </Box>
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        Community attributes have not been specified.
                    </Typography>
                )}

                {hasGroups && (
                    <Box
                        sx={{
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            backgroundColor: (t) => alpha(t.palette.primary.main, 0.04),
                            p: { xs: 2.5, md: 3 }
                        }}
                    >
                        <Stack spacing={1.5}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="subtitle1" fontWeight={600}>
                                    {activeItem?.label || 'Community attribute'}
                                </Typography>
                            </Stack>
                            <Typography variant="body2" color="text.secondary">
                                {descriptionText}
                            </Typography>
                        </Stack>
                    </Box>
                )}
            </Stack>
        </Paper>
    );
};

CommunityAttributesSection.propTypes = {
    groups: PropTypes.arrayOf(
        PropTypes.oneOfType([PropTypes.string, PropTypes.object])
    ),
    dictionary: PropTypes.objectOf(
        PropTypes.shape({
            label: PropTypes.string,
            description: PropTypes.string,
            icon: PropTypes.string,
            order: PropTypes.number
        })
    ),
    summary: PropTypes.string
};

CommunityAttributesSection.defaultProps = {
    groups: [],
    dictionary: {},
    summary: ''
};

export default CommunityAttributesSection;