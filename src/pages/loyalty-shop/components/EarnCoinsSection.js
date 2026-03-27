import { memo } from 'react';
import {
    Box,
    Chip,
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

const EARN_ACTIONS = [
    {
        actionType: 'REGISTER',
        coins: 50,
        label: 'Create an Account',
        description: 'Sign up and join the CTMASS platform.',
        icon: <PersonAddIcon />,
        role: null,
        maxPerUser: 1,
        color: '#4CAF50',
    },
    {
        actionType: 'COMPLETE_PROFILE',
        coins: 30,
        label: 'Complete Your Profile',
        description: 'Fill in all required profile fields: name, email, phone, and avatar.',
        icon: <AccountCircleIcon />,
        role: null,
        maxPerUser: 1,
        color: '#2196F3',
    },
    {
        actionType: 'POST_PROJECT',
        coins: 20,
        label: 'Post a Project',
        description: 'Create a project to find a contractor.',
        icon: <HomeWorkIcon />,
        role: 'Homeowner',
        maxPerUser: null,
        color: '#FF9800',
    },
    {
        actionType: 'POST_PROJECT_WITH_PHOTOS',
        coins: 35,
        label: 'Post a Project with Photos',
        description: 'Create a project and attach photos for a bigger bonus.',
        icon: <AddPhotoAlternateIcon />,
        role: 'Homeowner',
        maxPerUser: null,
        color: '#FF5722',
    },
    {
        actionType: 'ADD_PORTFOLIO',
        coins: 25,
        label: 'Add Portfolio Item',
        description: 'Showcase your work by adding a portfolio entry.',
        icon: <WorkIcon />,
        role: 'Contractor',
        maxPerUser: null,
        color: '#9C27B0',
    },
    {
        actionType: 'INVITE_HOMEOWNER_POSTS_PROJECT',
        coins: 40,
        label: 'Refer a Homeowner Who Posts',
        description: 'Invite a homeowner who then creates their first project.',
        icon: <GroupAddIcon />,
        role: null,
        maxPerUser: null,
        color: '#00BCD4',
    },
    {
        actionType: 'INVITE_CONTRACTOR_COMPLETES_JOB',
        coins: 60,
        label: 'Refer a Contractor Who Completes a Job',
        description: 'Invite a contractor who successfully completes a project.',
        icon: <GroupAddIcon />,
        role: null,
        maxPerUser: null,
        color: '#3F51B5',
    },
    {
        actionType: 'CONTRACTOR_INVITES_HOMEOWNER_POSTS',
        coins: 40,
        label: 'As Contractor: Refer a Homeowner Who Posts',
        description: 'As a contractor, invite a homeowner who creates a project.',
        icon: <EmojiPeopleIcon />,
        role: 'Contractor',
        maxPerUser: null,
        color: '#009688',
    },
    {
        actionType: 'HOMEOWNER_REFERS_NEIGHBOR_HIRES',
        coins: 50,
        label: 'Refer a Neighbor Who Hires',
        description: 'Refer your neighbor who ends up hiring a contractor.',
        icon: <EmojiPeopleIcon />,
        role: 'Homeowner',
        maxPerUser: null,
        color: '#E91E63',
    },
];

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
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.5 }}>
                        {action.description}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        {action.role && (
                            <Chip
                                label={action.role}
                                size="small"
                                sx={{
                                    height: 20,
                                    fontSize: '0.7rem',
                                    backgroundColor: `${action.color}18`,
                                    color: action.color,
                                    fontWeight: 600,
                                }}
                            />
                        )}
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
                <Grid container spacing={2} alignItems="stretch">
                    {EARN_ACTIONS.map((action) => (
                        <Grid item xs={12} sm={6} key={action.actionType} sx={{ display: 'flex' }}>
                            <ActionCard action={action} />
                        </Grid>
                    ))}
                </Grid>
            </DialogContent>
        </Dialog>
    );
});

EarnCoinsSection.displayName = 'EarnCoinsSection';

export default EarnCoinsSection;
