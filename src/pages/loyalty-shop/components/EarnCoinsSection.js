import { memo, useMemo } from 'react';
import {
    Box,
    Chip,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    Stack,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import WorkIcon from '@mui/icons-material/Work';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import StarIcon from '@mui/icons-material/Star';
import { useLoyaltyConfig } from 'src/hooks/use-loyalty-config';

const ACTION_ICON_MAP = {
    REGISTER: <PersonAddIcon />,
    COMPLETE_PROFILE: <AccountCircleIcon />,
    POST_PROJECT: <HomeWorkIcon />,
    POST_PROJECT_WITH_PHOTOS: <AddPhotoAlternateIcon />,
    ADD_PORTFOLIO: <WorkIcon />,
    INVITE_HOMEOWNER_POSTS_PROJECT: <GroupAddIcon />,
    INVITE_CONTRACTOR_COMPLETES_JOB: <GroupAddIcon />,
    CONTRACTOR_INVITES_HOMEOWNER_POSTS: <EmojiPeopleIcon />,
    HOMEOWNER_REFERS_NEIGHBOR_HIRES: <EmojiPeopleIcon />,
};

const CATEGORY_COLOR_MAP = {
    onboarding: '#4CAF50',
    project: '#FF9800',
    review: '#2196F3',
    referral: '#9C27B0',
    engagement: '#00BCD4',
    admin: '#F44336',
};

const ROLE_KEY_LABEL_MAP = {
    homeowner: 'Homeowner',
    contractor: 'Contractor',
    partner: 'Partner',
};

const getCoinsForDisplay = (rule) => {
    if (rule.roleRules) {
        const values = [
            rule.roleRules.homeowner?.enabled ? rule.roleRules.homeowner.coins : null,
            rule.roleRules.contractor?.enabled ? rule.roleRules.contractor.coins : null,
            rule.roleRules.partner?.enabled ? rule.roleRules.partner.coins : null,
            rule.roleRules.default?.coins ?? null,
        ].filter((v) => v !== null && v > 0);
        return values.length > 0 ? Math.max(...values) : 0;
    }
    return rule.coinsAwarded ?? 0;
};

const getEnabledRoleLabels = (rule) => {
    if (!rule.roleRules) {
        return rule.role ? [rule.role] : [];
    }
    const labels = [];
    for (const key of ['homeowner', 'contractor', 'partner']) {
        if (rule.roleRules[key]?.enabled) {
            labels.push(ROLE_KEY_LABEL_MAP[key]);
        }
    }
    const allEnabled = labels.length === 3;
    return allEnabled ? [] : labels;
};

const normalizeRule = (rule) => ({
    actionType: rule.actionType,
    coins: getCoinsForDisplay(rule),
    label: rule.displayName || rule.actionType,
    description: rule.description || '',
    icon: ACTION_ICON_MAP[rule.actionType] || <StarIcon />,
    color: CATEGORY_COLOR_MAP[rule.category] || '#607D8B',
    roles: getEnabledRoleLabels(rule),
    maxPerUser: rule.maxPerUser ?? null,
});

const ActionCard = memo(({ action }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    return (
        <Box
            sx={{
                p: 2.5,
                borderRadius: 2,
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                transition: 'box-shadow 0.2s',
                width: '100%',
                '&:hover': {
                    boxShadow: `0 4px 16px ${action.color}22`,
                    borderColor: `${action.color}44`,
                },
            }}
        >
            <Stack direction="row" spacing={2} alignItems="flex-start">
                <Box
                    sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        backgroundColor: `${action.color}18`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: action.color,
                        flexShrink: 0,
                    }}
                >
                    {action.icon}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {action.label}
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0 }}>
                            <MonetizationOnIcon sx={{ color: '#FFC107', fontSize: 18 }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#FFC107' }}>
                                +{action.coins}
                            </Typography>
                        </Stack>
                    </Stack>
                    {action.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.5 }}>
                            {action.description}
                        </Typography>
                    )}
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
                        {action.roles.map((role) => (
                            <Chip
                                key={role}
                                label={role}
                                size="small"
                                sx={{
                                    height: 20,
                                    fontSize: '0.7rem',
                                    backgroundColor: `${action.color}18`,
                                    color: action.color,
                                    fontWeight: 600,
                                }}
                            />
                        ))}
                        {action.maxPerUser === 1 && (
                            <Chip
                                label="Once only"
                                size="small"
                                variant="outlined"
                                sx={{ height: 20, fontSize: '0.7rem', opacity: 0.7 }}
                            />
                        )}
                    </Stack>
                </Box>
            </Stack>
        </Box>
    );
});

ActionCard.displayName = 'ActionCard';

const EarnCoinsSection = memo(({ open, onClose }) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const { rules, loading } = useLoyaltyConfig();

    const actions = useMemo(() => rules.map(normalizeRule), [rules]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullScreen={fullScreen}
            maxWidth="md"
            fullWidth
            disableScrollLock
            PaperProps={{
                sx: { borderRadius: fullScreen ? 0 : 3 },
            }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <MonetizationOnIcon sx={{ color: '#FFC107', fontSize: 28 }} />
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                                How to Earn CTMASS Coins
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Complete actions to earn coins and unlock rewards
                            </Typography>
                        </Box>
                    </Stack>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Stack>
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ pt: 2.5 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Grid container spacing={2} alignItems="stretch">
                        {actions.map((action) => (
                            <Grid item xs={12} sm={6} key={action.actionType} sx={{ display: 'flex' }}>
                                <ActionCard action={action} />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </DialogContent>
        </Dialog>
    );
});

EarnCoinsSection.displayName = 'EarnCoinsSection';

export default EarnCoinsSection;
