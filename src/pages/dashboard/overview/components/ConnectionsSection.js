import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Avatar,
    Badge,
    Box,
    Button,
    Menu,
    MenuItem,
    Paper,
    Stack,
    Typography,
    ListItemIcon,
    ListItemText,
    styled
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import IosShareIcon from '@mui/icons-material/IosShare';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import SettingsIcon from '@mui/icons-material/Settings';
import {
    EmailShareButton,
    FacebookShareButton,
    TelegramShareButton,
    TwitterShareButton,
    WhatsappShareButton
} from 'react-share';
import TelegramIcon from '@mui/icons-material/Telegram';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import FacebookIcon from '@mui/icons-material/Facebook';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import LinkIcon from '@mui/icons-material/Link';
import XIcon from '@untitled-ui/icons-react/build/esm/X';
import toast from 'react-hot-toast';
import { profileApi } from 'src/api/profile';
import { paths } from 'src/paths';
import { useOnlineStatus } from 'src/contexts/online-status-context';
import { InviteDialog } from 'src/pages/cabinet/profiles/my/Connections/InviteDialog';
import { SpecialistQRBusinessCard } from 'src/sections/dashboard/specialist-profile/public/specialist-qr-business-card';
import ManageConnectionsModal from '../modals/ManageConnectionsModal';


const RippleBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
        backgroundColor: '#44b700',
        color: '#44b700',
        boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
        '&::after': {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            animation: 'ripple 1.2s infinite ease-in-out',
            border: '1px solid currentColor',
            content: '""'
        }
    },
    '@keyframes ripple': {
        '0%': {
            transform: 'scale(.8)',
            opacity: 1
        },
        '100%': {
            transform: 'scale(2.4)',
            opacity: 0
        }
    }
}));

const OnlineBadgeAvatar = memo(({ user, isOnline, onClick }) => {
    return (
        <Box
            onClick={onClick}
            sx={{
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                    transform: 'scale(1.05)'
                }
            }}
        >
            <RippleBadge
                variant="dot"
                overlap="circular"
                invisible={!isOnline}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right'
                }}
            >
                <Avatar
                    src={user.avatar}
                    alt={user.businessName || user.name}
                    sx={{
                        width: 56,
                        height: 56,
                        border: '2px solid',
                        borderColor: 'background.paper'
                    }}
                />
            </RippleBadge>
            <Typography
                variant="caption"
                align="center"
                display="block"
                sx={{
                    mt: 0.5,
                    maxWidth: 56,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                }}
            >
                {(user.businessName || user.name || '').split(' ')[0]}
            </Typography>
        </Box>
    );
});

OnlineBadgeAvatar.propTypes = {
    user: PropTypes.object.isRequired,
    isOnline: PropTypes.bool,
    onClick: PropTypes.func
};

OnlineBadgeAvatar.displayName = 'OnlineBadgeAvatar';

const MoreContactsCircle = memo(({ count, onClick }) => {
    return (
        <Box
            onClick={onClick}
            sx={{
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                    transform: 'scale(1.05)'
                }
            }}
        >
            <Avatar
                sx={{
                    width: 56,
                    height: 56,
                    bgcolor: 'grey.300',
                    color: 'text.primary',
                    fontWeight: 600,
                    border: '2px solid',
                    borderColor: 'background.paper'
                }}
            >
                +{count}
            </Avatar>
        </Box>
    );
});

MoreContactsCircle.propTypes = {
    count: PropTypes.number.isRequired,
    onClick: PropTypes.func.isRequired
};

MoreContactsCircle.displayName = 'MoreContactsCircle';

const ConnectionsSection = ({ profile, userSpecialties }) => {
    const navigate = useNavigate();
    const { onlineUsers } = useOnlineStatus();
    const [frequentContacts, setFrequentContacts] = useState([]);
    const [newRequests, setNewRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
    const [shareMenuAnchor, setShareMenuAnchor] = useState(null);
    const [qrOpen, setQrOpen] = useState(false);
    const [manageModalOpen, setManageModalOpen] = useState(false);

    const profileId = profile?.profile?.id;
    const profileUrl = useMemo(() => {
        if (!profile?.profile) return '';
        const pageName = profile.profile.profilePage || profile.profile.id;
        return `${process.env.REACT_APP_HOST_P || ''}/contractors/first1000/${pageName}`;
    }, [profile]);

    useEffect(() => {
        const fetchConnections = async () => {
            if (!profileId) return;

            try {
                setLoading(true);
                const friendIds = await profileApi.getConfirmedFriends(profileId);

                if (friendIds.length > 0) {
                    const profiles = await profileApi.getProfilesById(friendIds, 100);
                    setFrequentContacts(profiles.slice(0, 10).reverse());
                }

                const incomingRequests = await profileApi.getIncomingFriendRequests(profileId);
                if (incomingRequests.length > 0) {
                    const requestIds = incomingRequests.map((r) => r.otherUserId);
                    const requestProfiles = await profileApi.getProfilesById(requestIds);
                    setNewRequests(requestProfiles.slice(0, 10));
                }
            } catch (error) {
                console.error('Failed to fetch connections:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchConnections();
    }, [profileId]);

    const visibleFrequentContacts = useMemo(
        () => frequentContacts.slice(0, 5),
        [frequentContacts]
    );

    const visibleNewRequests = useMemo(
        () => newRequests.slice(0, 5),
        [newRequests]
    );

    const remainingFrequentCount = Math.max(0, frequentContacts.length - 5);
    const remainingRequestsCount = Math.max(0, newRequests.length - 5);

    const handleOpenInviteDialog = useCallback(() => {
        setInviteDialogOpen(true);
    }, []);

    const handleCloseInviteDialog = useCallback(() => {
        setInviteDialogOpen(false);
    }, []);

    const handleOpenShareMenu = useCallback((event) => {
        setShareMenuAnchor(event.currentTarget);
    }, []);

    const handleCloseShareMenu = useCallback(() => {
        setShareMenuAnchor(null);
    }, []);

    const handleOpenQr = useCallback(() => {
        setQrOpen(true);
    }, []);

    const handleCloseQr = useCallback(() => {
        setQrOpen(false);
    }, []);

    const handleOpenManageModal = useCallback(() => {
        setManageModalOpen(true);
    }, []);

    const handleCloseManageModal = useCallback(() => {
        setManageModalOpen(false);
    }, []);

    const handleFriendRemoved = useCallback((person) => {
        setFrequentContacts(prev => prev.filter(c => c.id !== person.id));
    }, []);

    const handleShareQr = useCallback(() => {
        handleCloseShareMenu();
        handleOpenQr();
    }, [handleCloseShareMenu, handleOpenQr]);

    const handleCopyLink = useCallback(() => {
        handleCloseShareMenu();
        navigator.clipboard.writeText(profileUrl).then(() => {
            toast.success('Link copied!', {
                duration: 3000,
                position: 'bottom-center',
                icon: '🔗'
            });
        }).catch(() => {
            toast.error('Failed to copy link');
        });
    }, [profileUrl, handleCloseShareMenu]);

    const getShareMessage = useCallback(() => {
        const name = profile?.profile?.businessName || profile?.profile?.name || 'Specialist';
        const bio = profile?.profile?.about || '';
        return `Check out ${name}'s profile on Ctmass.com! ${bio ? `About them: "${bio}"` : ''}`;
    }, [profile]);

    const handleContactClick = useCallback((contactId) => {
        const href = paths.specialist.publicPage.replace(':profileId', contactId);
        navigate(href);
    }, [navigate]);

    const newRequestsBadgeCount = newRequests.length > 0 ? newRequests.length : 0;

    return (
        <>
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    p: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <Typography variant="h6" fontWeight={700} mb={3}>
                    My Friends & Connections
                </Typography>

                <Box sx={{ flex: 1 }}>
                    <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        spacing={4}
                        divider={
                            <Box
                                sx={{
                                    width: { xs: '100%', md: '1px' },
                                    height: { xs: '1px', md: 'auto' },
                                    bgcolor: 'divider'
                                }}
                            />
                        }
                    >
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" color="text.secondary" mb={2}>
                                Frequent Contacts
                            </Typography>
                            <Stack direction="row" spacing={2} flexWrap="wrap" gap={2}>
                                {loading ? (
                                    <Typography variant="body2" color="text.secondary">
                                        Loading...
                                    </Typography>
                                ) : visibleFrequentContacts.length > 0 ? (
                                    <>
                                        {visibleFrequentContacts.map((contact) => (
                                            <OnlineBadgeAvatar
                                                key={contact.id}
                                                user={contact}
                                                isOnline={onlineUsers[contact.id]}
                                                onClick={() => handleContactClick(contact.id)}
                                            />
                                        ))}
                                        {remainingFrequentCount > 0 && (
                                            <MoreContactsCircle
                                                count={remainingFrequentCount}
                                                onClick={handleOpenManageModal}
                                            />
                                        )}
                                    </>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        No contacts yet
                                    </Typography>
                                )}
                            </Stack>
                        </Box>

                        <Box sx={{ flex: 1 }}>
                            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    New Requests For Connections
                                </Typography>
                                {newRequestsBadgeCount > 0 && (
                                    <Badge
                                        badgeContent={newRequestsBadgeCount}
                                        color="success"
                                        sx={{
                                            '& .MuiBadge-badge': {
                                                fontSize: '0.65rem',
                                                height: 18,
                                                minWidth: 18,
                                                padding: '0 4px'
                                            }
                                        }}
                                    />
                                )}
                            </Stack>
                            <Stack direction="row" spacing={2} flexWrap="wrap" gap={2}>
                                {loading ? (
                                    <Typography variant="body2" color="text.secondary">
                                        Loading...
                                    </Typography>
                                ) : visibleNewRequests.length > 0 ? (
                                    <>
                                        {visibleNewRequests.map((request) => (
                                            <OnlineBadgeAvatar
                                                key={request.id}
                                                user={request}
                                                isOnline={onlineUsers[request.id]}
                                                onClick={handleOpenManageModal}
                                            />
                                        ))}
                                        {remainingRequestsCount > 0 && (
                                            <MoreContactsCircle
                                                count={remainingRequestsCount}
                                                onClick={handleOpenManageModal}
                                            />
                                        )}
                                    </>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        No new requests
                                    </Typography>
                                )}
                            </Stack>
                        </Box>
                    </Stack>
                </Box>

                <Stack
                    direction="row"
                    spacing={2}
                    mt={3}
                    justifyContent="space-between"
                    alignItems="center"
                    flexWrap="wrap"
                    gap={1}
                >
                    <Stack direction="row" spacing={2} flexWrap="wrap" gap={1}>
                        <Button
                            variant="contained"
                            startIcon={<PersonAddIcon />}
                            onClick={handleOpenInviteDialog}
                        >
                            Invite Friends
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<IosShareIcon />}
                            onClick={handleOpenShareMenu}
                        >
                            Share My Profile
                        </Button>
                    </Stack>
                    <Button
                        variant="text"
                        color="primary"
                        endIcon={<SettingsIcon />}
                        onClick={handleOpenManageModal}
                        sx={{ fontWeight: 600 }}
                    >
                        Manage My Connections
                    </Button>
                </Stack>
            </Paper>

            <Menu
                anchorEl={shareMenuAnchor}
                open={Boolean(shareMenuAnchor)}
                onClose={handleCloseShareMenu}
                PaperProps={{
                    sx: { minWidth: 200 }
                }}
            >
                <MenuItem onClick={handleShareQr}>
                    <ListItemIcon>
                        <QrCode2Icon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>QR Code</ListItemText>
                </MenuItem>

                <EmailShareButton
                    url={profileUrl}
                    subject={`Check out ${profile?.profile?.businessName || 'this'} profile`}
                    body={getShareMessage()}
                    onClick={handleCloseShareMenu}
                    style={{ width: '100%', textAlign: 'left' }}
                >
                    <MenuItem sx={{ width: '100%' }}>
                        <ListItemIcon>
                            <AlternateEmailIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Email</ListItemText>
                    </MenuItem>
                </EmailShareButton>

                <FacebookShareButton
                    url={profileUrl}
                    quote={getShareMessage()}
                    onClick={handleCloseShareMenu}
                    style={{ width: '100%', textAlign: 'left' }}
                >
                    <MenuItem sx={{ width: '100%' }}>
                        <ListItemIcon>
                            <FacebookIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Facebook</ListItemText>
                    </MenuItem>
                </FacebookShareButton>

                <TwitterShareButton
                    url={profileUrl}
                    title={getShareMessage()}
                    onClick={handleCloseShareMenu}
                    style={{ width: '100%', textAlign: 'left' }}
                >
                    <MenuItem sx={{ width: '100%' }}>
                        <ListItemIcon>
                            <XIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Twitter</ListItemText>
                    </MenuItem>
                </TwitterShareButton>

                <TelegramShareButton
                    url={profileUrl}
                    title={getShareMessage()}
                    onClick={handleCloseShareMenu}
                    style={{ width: '100%', textAlign: 'left' }}
                >
                    <MenuItem sx={{ width: '100%' }}>
                        <ListItemIcon>
                            <TelegramIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Telegram</ListItemText>
                    </MenuItem>
                </TelegramShareButton>

                <WhatsappShareButton
                    url={profileUrl}
                    title={getShareMessage()}
                    onClick={handleCloseShareMenu}
                    style={{ width: '100%', textAlign: 'left' }}
                >
                    <MenuItem sx={{ width: '100%' }}>
                        <ListItemIcon>
                            <WhatsAppIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>WhatsApp</ListItemText>
                    </MenuItem>
                </WhatsappShareButton>

                <MenuItem onClick={handleCopyLink}>
                    <ListItemIcon>
                        <LinkIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Copy Link</ListItemText>
                </MenuItem>
            </Menu>

            <InviteDialog
                open={inviteDialogOpen}
                onClose={handleCloseInviteDialog}
                profileId={profileId}
            />

            <SpecialistQRBusinessCard
                open={qrOpen}
                onClose={handleCloseQr}
                user={profile?.profile}
                userSpecialties={userSpecialties}
                url={profileUrl}
            />

            <ManageConnectionsModal
                open={manageModalOpen}
                onClose={handleCloseManageModal}
                profileId={profileId}
                onFriendRemoved={handleFriendRemoved}
            />
        </>
    );
};

ConnectionsSection.propTypes = {
    profile: PropTypes.object,
    userSpecialties: PropTypes.array
};

ConnectionsSection.defaultProps = {
    profile: null,
    userSpecialties: []
};

export default memo(ConnectionsSection);
