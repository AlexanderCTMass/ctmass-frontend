import TelegramIcon from '@mui/icons-material/Telegram';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import LinkIcon from '@mui/icons-material/Link';
import {
    IconButton,
    ListItemIcon,
    ListItemText,
    MenuItem,
    SvgIcon,
    Tooltip,
    Paper,
    MenuList,
    ClickAwayListener,
    Popper, Stack
} from '@mui/material';
import { usePopover } from 'src/hooks/use-popover';
import Share07Icon from "@untitled-ui/icons-react/build/esm/Share07";
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import {
    EmailShareButton,
    FacebookShareButton,
    TelegramShareButton,
    TwitterShareButton,
    WhatsappShareButton,
} from "react-share";
import FacebookIcon from "@mui/icons-material/Facebook";
import * as React from "react";
import XIcon from "@untitled-ui/icons-react/build/esm/X";
import toast from "react-hot-toast";

export const SharingProfileMenu = (props) => {
    const { url, user } = props;
    const popover = usePopover();

    const getShareMessage = () => {
        return `Check out ${user.name}'s profile on Ctmass.com! ${user.bio ? `About them: "${user.bio}"` : ''}`;
    };

    const handlePostShare = () => {
        popover.handleClose();

        try {
            navigator.clipboard.writeText(url).then(() => {
                toast.success('Link copied! Share it anywhere!', {
                    duration: 3000,
                    position: 'bottom-center',
                    icon: '🔗',
                });
            }).catch(() => {
                toast.error('Failed to copy link');
            });
        } catch (err) {
            toast.error('Sharing not supported');
            console.error(err);
        }
    };

    const handleNativeShare = async () => {
        popover.handleClose();
        try {
            await navigator.share({
                title: `${user.name}'s Profile`,
                text: getShareMessage(),
                url: url,
            });
        } catch (err) {
            console.log("Native share not supported or cancelled");
        }
    };

    return (
        <>
            <Tooltip title="Share profile">
                <IconButton
                    onClick={popover.handleOpen}
                    ref={popover.anchorRef}
                    {...props}>
                    <SvgIcon>
                        <Share07Icon />
                    </SvgIcon>
                </IconButton>
            </Tooltip>

            {popover.open && (
                <Popper
                    open={popover.open}
                    anchorEl={popover.anchorRef.current}
                    placement="bottom-end"
                    disablePortal
                    modifiers={[
                        {
                            name: 'offset',
                            options: {
                                offset: [0, 8], // 8px отступа от кнопки
                            },
                        },
                    ]}
                    sx={{
                        zIndex: 1300,
                    }}
                    PaperProps={{
                        sx: {
                            borderRadius: 2, // Закругленные углы
                            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', // Тень
                            backgroundColor: 'white',
                        }
                    }}
                >
                    <Paper>
                        <ClickAwayListener onClickAway={popover.handleClose}>
                            <MenuList autoFocusItem={popover.open} dense>
                                <Stack direction="column">
                                    <EmailShareButton
                                        url={url}
                                        subject={`${user.name}'s Profile on Ctmass.com`}
                                        body={getShareMessage()}
                                        beforeOnClick={popover.handleClose}
                                    >
                                        <MenuItem>
                                            <ListItemIcon>
                                                <AlternateEmailIcon fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText sx={{ textAlign: 'left' }}>Email</ListItemText>
                                        </MenuItem>
                                    </EmailShareButton>

                                    <FacebookShareButton
                                        url={url}
                                        quote={getShareMessage()}
                                        hashtag="#Ctmass"
                                        beforeOnClick={popover.handleClose}
                                    >
                                        <MenuItem>
                                            <ListItemIcon>
                                                <FacebookIcon fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText sx={{ textAlign: 'left' }}>Facebook</ListItemText>
                                        </MenuItem>
                                    </FacebookShareButton>

                                    <TelegramShareButton
                                        url={url}
                                        title={getShareMessage()}
                                        beforeOnClick={popover.handleClose}
                                    >
                                        <MenuItem>
                                            <ListItemIcon>
                                                <TelegramIcon fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText sx={{ textAlign: 'left' }}>Telegram</ListItemText>
                                        </MenuItem>
                                    </TelegramShareButton>

                                    <WhatsappShareButton
                                        url={url}
                                        title={getShareMessage()}
                                        beforeOnClick={popover.handleClose}
                                    >
                                        <MenuItem>
                                            <ListItemIcon>
                                                <WhatsAppIcon fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText sx={{ textAlign: 'left' }}>WhatsApp</ListItemText>
                                        </MenuItem>
                                    </WhatsappShareButton>

                                    <TwitterShareButton
                                        url={url}
                                        title={getShareMessage()}
                                        beforeOnClick={popover.handleClose}
                                        hashtags={["Ctmass"]}
                                    >
                                        <MenuItem>
                                            <ListItemIcon>
                                                <XIcon fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText sx={{ textAlign: 'left' }}>Twitter</ListItemText>
                                        </MenuItem>
                                    </TwitterShareButton>

                                    <MenuItem onClick={handleNativeShare}>
                                        <ListItemIcon>
                                            <Share07Icon fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText>More options...</ListItemText>
                                    </MenuItem>

                                    <MenuItem onClick={handlePostShare}>
                                        <ListItemIcon>
                                            <LinkIcon fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary="Copy link" />
                                    </MenuItem>
                                </Stack>
                            </MenuList>
                        </ClickAwayListener>
                    </Paper>
                </Popper>
            )}
        </>
    );
};