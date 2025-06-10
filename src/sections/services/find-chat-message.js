import PropTypes from 'prop-types';
import {formatDistanceToNowStrict} from 'date-fns';
import {Avatar, Box, Button, Card, CardMedia, Link, Stack, Typography} from '@mui/material';

export const FindChatMessage = (props) => {
    const {
        previousSame,
        authorAvatar, authorName, body, contentType, createdAt, position, event = () => {
        }, ...other
    } = props;

    const ago = formatDistanceToNowStrict(createdAt);

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
                {contentType === 'button' ? (
                        <Button
                            variant={"outlined"}
                            onClick={event}
                        >
                            {body}
                        </Button>
                    ) :
                    (<>
                        {!Boolean(previousSame) ? <Avatar
                            src={authorAvatar || undefined}
                            sx={{
                                height: 32,
                                width: 32
                            }}
                        /> : <Box sx={{
                            height: 32,
                            width: 32
                        }}></Box>}
                        <Box sx={{flexGrow: 1}}>
                            <Card
                                sx={{
                                    backgroundColor: position === 'right' ? 'primary.main' : 'background.paper',
                                    color: position === 'right' ? 'primary.contrastText' : 'text.primary',
                                    px: 2,
                                    py: 1
                                }}
                            >
                                {!Boolean(previousSame) && <Box sx={{mb: 1}}>
                                    <Link
                                        color="inherit"
                                        sx={{cursor: 'pointer'}}
                                        variant="subtitle2"
                                    >
                                        {authorName}
                                    </Link>
                                </Box>}
                                {contentType === 'image' && (
                                    <CardMedia
                                        onClick={() => {
                                        }}
                                        image={body}
                                        sx={{
                                            height: 200,
                                            width: 200
                                        }}
                                    />
                                )}
                                {contentType === 'text' && (
                                    <Typography
                                        color="inherit"
                                        variant="body1"
                                    >
                                        {body}
                                    </Typography>
                                )}
                            </Card>
                        </Box></>)}
            </Stack>
        </Box>
    );
};

FindChatMessage.propTypes = {
    authorAvatar: PropTypes.string.isRequired,
    authorName: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
    contentType: PropTypes.string.isRequired,
    createdAt: PropTypes.number.isRequired,
    position: PropTypes.oneOf(['left', 'right'])
};
