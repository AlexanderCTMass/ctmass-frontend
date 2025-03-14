import PropTypes from 'prop-types';
import {formatDistanceToNowStrict} from 'date-fns';
import {Avatar, Box, Card, CardMedia, ImageList, Link, Stack, Typography} from '@mui/material';
import {alpha} from "@mui/material/styles";
import {getValidDate} from "src/utils/date-locale";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import DoneIcon from "@mui/icons-material/Done";
import React from "react";
import {Preview} from "src/components/myfancy/image-preview";
import Fancybox from "src/components/myfancy/myfancybox";
import {INFO} from "src/libs/log";

export const ChatMessage = (props) => {
    const {authorAvatar, authorName, body, attachments, createdAt, position, showUserInfo, isRead, ...other} = props;

    const ago = formatDistanceToNowStrict(getValidDate(createdAt));

    const strings = body?.split("%INFO:") || [];
    if (strings.length === 3) {
        return (
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexGrow: 1
            }}
                 {...other}>
                <Card
                    sx={{
                        border: '1px solid',
                        borderColor: 'warning.main',
                        color: 'text.primary',
                        px: 2,
                        py: 1
                    }}
                >
                    <div dangerouslySetInnerHTML={{__html: strings[position === 'right' ? 1 : 2]}}/>
                </Card>
            </Box>
        )
    }

    const isHtmlBody = body && body.startsWith("%HTML:");
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: position === 'right' ? 'flex-end' : 'flex-start'
            }}
            {...other}>
            <Stack
                alignItems="flex-start"
                direction={position === 'right' ? 'row-reverse' : 'row'}
                spacing={2}
                sx={{
                    maxWidth: 500,
                    ml: position === 'right' ? 'auto' : 0,
                    mr: position === 'left' ? 'auto' : 0
                }}
            >
                {showUserInfo &&
                    <Avatar
                        src={authorAvatar || undefined}
                        sx={{
                            height: 32,
                            width: 32
                        }}
                    />}
                <Box sx={{flexGrow: 1}}>
                    <Card
                        sx={{
                            backgroundColor: position === 'right' ? 'primary.main' : '',
                            color: position === 'right' ? 'primary.contrastText' : 'text.primary',
                            px: 2,
                            py: 1
                        }}
                    >
                        {showUserInfo &&
                            <Box sx={{mb: 1}}>
                                <Link
                                    color="inherit"
                                    sx={{cursor: 'pointer'}}
                                    variant="caption"
                                >
                                    {authorName}
                                </Link>
                            </Box>}
                        {isHtmlBody && <div dangerouslySetInnerHTML={{__html: body.replace("%HTML:", "")}}/>}
                        {attachments && attachments.length > 0 && (
                            <Fancybox
                                options={{
                                    Carousel: {
                                        infinite: false,
                                    },
                                }}
                            >
                                <ImageList
                                    gap={1}
                                    variant="quilted"
                                >
                                    {attachments.map((attachment) =>
                                        <a data-fancybox="gallery" href={attachment.url} className={"my-fancy-link"}>
                                            <Preview attach={{preview: attachment.url}}/>
                                        </a>
                                    )}
                                </ImageList>
                            </Fancybox>
                        )}
                        {body && !isHtmlBody &&
                            (
                                <Typography
                                    color="inherit"
                                    variant="body1"
                                    sx={{
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                    }}
                                >
                                    {body}
                                </Typography>
                            )}
                    </Card>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: position === 'right' ? 'flex-end' : 'flex-start',
                            mt: 1,
                            px: 2
                        }}
                    >
                        <Typography
                            color="text.secondary"
                            noWrap
                            variant="caption"
                        >
                            {ago}
                            {' '}
                            ago
                        </Typography>
                        {isRead ?
                            <DoneAllIcon sx={{color: "green", fontSize: "18px", ml: 1}}/>
                            :
                            <DoneIcon sx={{color: "gray", fontSize: "18px", ml: 1}}/>
                        }
                    </Box>
                </Box>
            </Stack>
        </Box>
    );
};

ChatMessage.propTypes = {
    authorAvatar: PropTypes.string.isRequired,
    authorName: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
    attachments: PropTypes.array,
    createdAt: PropTypes.number.isRequired,
    position: PropTypes.oneOf(['left', 'right'])
};
