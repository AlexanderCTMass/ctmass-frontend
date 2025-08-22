import ArchiveIcon from '@untitled-ui/icons-react/build/esm/Archive';
import ClipboardIcon from '@untitled-ui/icons-react/build/esm/Clipboard';
import DotsHorizontalIcon from '@untitled-ui/icons-react/build/esm/DotsHorizontal';
import Download01Icon from '@untitled-ui/icons-react/build/esm/Download01';
import FileCheck03Icon from '@untitled-ui/icons-react/build/esm/FileCheck03';
import TelegramIcon from '@mui/icons-material/Telegram';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import LinkIcon from '@mui/icons-material/Link';
import {
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    SvgIcon,
    Tooltip
} from '@mui/material';
import { usePopover } from 'src/hooks/use-popover';
import Share07Icon from "@untitled-ui/icons-react/build/esm/Share07";
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import {
    EmailShareButton,
    FacebookShareButton,
    GabShareButton,
    HatenaShareButton,
    InstapaperShareButton,
    LineShareButton,
    LinkedinShareButton,
    LivejournalShareButton,
    MailruShareButton,
    OKShareButton,
    PinterestShareButton,
    PocketShareButton,
    RedditShareButton,
    TelegramShareButton,
    TumblrShareButton,
    TwitterShareButton,
    ViberShareButton,
    VKShareButton,
    WhatsappShareButton,
    WorkplaceShareButton,
} from "react-share";
import FacebookIcon from "@mui/icons-material/Facebook";
import * as React from "react";
import XIcon from "@untitled-ui/icons-react/build/esm/X";
import toast from "react-hot-toast";

export const SharingMenu = (props) => {
    const { url, title, post, user } = props;
    const popover = usePopover();

    const handlePostShare = () => {
        popover.handleClose();

        try {
            navigator.clipboard.writeText(url).then(r => {
                toast.success('Post url copy to clipboard. Paste from the clipboard into the text of a message in any messenger or mailer!', {
                    duration: 10000,
                    position: "center"
                })
            }).catch(r => {
                toast.error('Something went wrong!');
            });
        } catch (err) {
            toast.error('Something went wrong!');
            console.error(err);
        }

    }

    return (
        <>
            <Tooltip title="Share to review post">
                <IconButton
                    onClick={popover.handleOpen}
                    ref={popover.anchorRef}
                    {...props}>
                    <SvgIcon>
                        <Share07Icon />
                    </SvgIcon>
                </IconButton>
            </Tooltip>
            <Menu
                anchorEl={popover.anchorRef.current}
                anchorOrigin={{
                    horizontal: {
                        md: 'right',
                        xs: "center"
                    },
                    vertical: {
                        md: 'bottom',
                        xs: "center"
                    }
                }}
                onClose={popover.handleClose}
                open={popover.open}
                PaperProps={{
                    sx: {
                        maxWidth: '100%',
                        width: 200
                    }
                }}
                transformOrigin={{
                    horizontal: {
                        md: 'right',
                        xs: "center"
                    },
                    vertical: {
                        md: 'top',
                        xs: "center"
                    }
                }}
            >
                <EmailShareButton url={url}
                    subject={user.name + " from the website Ctmass.com shares his work with you"}
                    body={"Please leave a review on this work" + '\n' + post.description}
                    beforeOnClick={popover.handleClose}
                >
                    <MenuItem>
                        <ListItemIcon>
                            <SvgIcon>
                                <AlternateEmailIcon />
                            </SvgIcon>
                        </ListItemIcon>
                        <ListItemText primary="Email" />
                    </MenuItem>
                </EmailShareButton>
                <FacebookShareButton url={url}
                    hashtag={"Please leave a review on this work!" + '\n' + post.description}
                    beforeOnClick={popover.handleClose}
                >
                    <MenuItem>
                        <ListItemIcon>
                            <SvgIcon>
                                <FacebookIcon />
                            </SvgIcon>
                        </ListItemIcon>
                        <ListItemText primary="Facebook" />
                    </MenuItem>
                </FacebookShareButton>
                <TelegramShareButton url={url} title={"Please leave a review on this work by " + user.name}
                    beforeOnClick={popover.handleClose}
                >
                    <MenuItem>
                        <ListItemIcon>
                            <SvgIcon>
                                <TelegramIcon />
                            </SvgIcon>
                        </ListItemIcon>
                        <ListItemText primary="Telegram" />
                    </MenuItem>
                </TelegramShareButton>
                <WhatsappShareButton url={url} title={"Please leave a review on this work by " + user.name}
                    beforeOnClick={popover.handleClose}
                >
                    <MenuItem>
                        <ListItemIcon>
                            <SvgIcon>
                                <WhatsAppIcon />
                            </SvgIcon>
                        </ListItemIcon>
                        <ListItemText primary="Whatsapp" />
                    </MenuItem>
                </WhatsappShareButton>
                <TwitterShareButton url={url} title={"Please leave a review on this work by " + user.name}
                    beforeOnClick={popover.handleClose}
                    hashtags={["CTMASS"]}>
                    <MenuItem>
                        <ListItemIcon>
                            <SvgIcon>
                                <XIcon />
                            </SvgIcon>
                        </ListItemIcon>
                        <ListItemText primary="X" />
                    </MenuItem>
                </TwitterShareButton>
                <MenuItem onClick={handlePostShare}>
                    <ListItemIcon>
                        <SvgIcon>
                            <LinkIcon />
                        </SvgIcon>
                    </ListItemIcon>
                    <ListItemText primary="Copy post url" />
                </MenuItem>
            </Menu>
        </>
    );
};
