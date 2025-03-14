import PropTypes from 'prop-types';
import {formatDistanceToNowStrict} from 'date-fns';
import ArchiveIcon from '@untitled-ui/icons-react/build/esm/Archive';
import Bell01Icon from '@untitled-ui/icons-react/build/esm/Bell01';
import Camera01Icon from '@untitled-ui/icons-react/build/esm/Camera01';
import DotsHorizontalIcon from '@untitled-ui/icons-react/build/esm/DotsHorizontal';
import PhoneIcon from '@untitled-ui/icons-react/build/esm/Phone';
import SlashCircle01Icon from '@untitled-ui/icons-react/build/esm/SlashCircle01';
import Trash02Icon from '@untitled-ui/icons-react/build/esm/Trash02';
import {
    Avatar,
    AvatarGroup,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Stack,
    SvgIcon,
    Tooltip,
    Typography
} from '@mui/material';
import {useAuth} from 'src/hooks/use-auth'; // Используем реального пользователя
import {usePopover} from 'src/hooks/use-popover';
import {ChatFeatureToggles} from "src/sections/dashboard/chat/ChatFeatureToggles";
import {RouterLink} from "src/components/router-link";
import {paths} from "src/paths";
import {INFO} from "src/libs/log";

const getRecipients = (participants, userId) => {
    INFO("getRecipients", participants, userId);
    if (!participants || !userId) return [];
    return participants.filter((participant) => participant.id !== userId);
};

const getDisplayName = (recipients) => {
    if (!recipients?.length) return 'Unknown';
    return recipients
        .map((participant) => participant.businessName || participant.name || participant.email || 'Unknown')
        .join(', ');
};

const getLastActive = (recipients) => {
    if (recipients.length !== 1 || !recipients[0]?.lastActivity) return null;

    const lastActivity = recipients[0].lastActivity;
    const timestamp = typeof lastActivity === 'number'
        ? lastActivity
        : lastActivity.toMillis(); // Обрабатываем Firebase Timestamp

    return formatDistanceToNowStrict(timestamp, {addSuffix: true});
};

export const ChatThreadToolbar = (props) => {
    const {participants = [], ...other} = props;
    const {user} = useAuth(); // Используем реального пользователя
    const popover = usePopover();

    const recipients = getRecipients(participants, user?.id);
    const displayName = getDisplayName(recipients);
    const lastActive = getLastActive(recipients);

    return (
        <>
            <Stack
                alignItems="center"
                direction="row"
                justifyContent="space-between"
                spacing={2}
                sx={{
                    flexShrink: 0,
                    minHeight: 64,
                    px: 2,
                    py: 1
                }}
                {...other}>
                <Stack
                    alignItems="center"
                    direction="row"
                    spacing={2}
                >
                    <AvatarGroup
                        max={2}
                        sx={{
                            ...(recipients.length > 1 && {
                                '& .MuiAvatar-root': {
                                    height: 30,
                                    width: 30,
                                    '&:nth-of-type(2)': {
                                        mt: '10px'
                                    }
                                }
                            })
                        }}
                    >
                        {recipients.map((recipient) => (
                            <Avatar
                                key={recipient.id}
                                src={recipient.avatar || '/assets/default-avatar.png'}
                                alt={recipient.businessName || recipient.name || recipient.email}
                            />
                        ))}
                    </AvatarGroup>
                    <div>
                        <Typography component={RouterLink} variant="subtitle2"
                                    href={paths.cabinet.profiles.profile.replace(":profileId", recipients?.[0]?.id || "") + `?returnTo=${window.location.href}&returnLabel=Back to project responses`}>
                            {displayName}
                        </Typography>
                        {lastActive && (
                            <Typography
                                color="text.secondary"
                                variant="caption"
                            >
                                Last active {lastActive}
                            </Typography>
                        )}
                    </div>
                </Stack>
                {ChatFeatureToggles.chatActions &&
                    <Stack
                        alignItems="center"
                        direction="row"
                        spacing={1}
                    >
                        <Tooltip title="Call">
                            <IconButton>
                                <SvgIcon>
                                    <PhoneIcon/>
                                </SvgIcon>
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Video call">
                            <IconButton>
                                <SvgIcon>
                                    <Camera01Icon/>
                                </SvgIcon>
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="More options">
                            <IconButton
                                onClick={popover.handleOpen}
                                ref={popover.anchorRef}
                            >
                                <SvgIcon>
                                    <DotsHorizontalIcon/>
                                </SvgIcon>
                            </IconButton>
                        </Tooltip>
                    </Stack>}
            </Stack>
            <Menu
                anchorEl={popover.anchorRef.current}
                keepMounted
                onClose={popover.handleClose}
                open={popover.open}
            >
                <MenuItem onClick={popover.handleClose}>
                    <ListItemIcon>
                        <SvgIcon>
                            <SlashCircle01Icon/>
                        </SvgIcon>
                    </ListItemIcon>
                    <ListItemText primary="Block"/>
                </MenuItem>
                <MenuItem onClick={popover.handleClose}>
                    <ListItemIcon>
                        <SvgIcon>
                            <Trash02Icon/>
                        </SvgIcon>
                    </ListItemIcon>
                    <ListItemText primary="Delete"/>
                </MenuItem>
                <MenuItem onClick={popover.handleClose}>
                    <ListItemIcon>
                        <SvgIcon>
                            <ArchiveIcon/>
                        </SvgIcon>
                    </ListItemIcon>
                    <ListItemText primary="Archive"/>
                </MenuItem>
                <MenuItem onClick={popover.handleClose}>
                    <ListItemIcon>
                        <SvgIcon>
                            <Bell01Icon/>
                        </SvgIcon>
                    </ListItemIcon>
                    <ListItemText primary="Mute"/>
                </MenuItem>
            </Menu>
        </>
    );
};

ChatThreadToolbar.propTypes = {
    participants: PropTypes.array
};
