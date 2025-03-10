import {useCallback, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import Attachment01Icon from '@untitled-ui/icons-react/build/esm/Attachment01';
import Camera01Icon from '@untitled-ui/icons-react/build/esm/Camera01';
import Send01Icon from '@untitled-ui/icons-react/build/esm/Send01';
import {Avatar, Box, IconButton, OutlinedInput, Stack, SvgIcon, Tooltip, Chip, styled} from '@mui/material';
import {useAuth} from "src/hooks/use-auth";

const ScrollableBox = styled(Box)({
    display: 'flex', overflowX: 'auto', gap: '8px', padding: '8px 0', justifyContent: 'center', // Центрируем чипсы
    '&::-webkit-scrollbar': {
        height: '4px',
    }, '&::-webkit-scrollbar-thumb': {
        backgroundColor: '#888', borderRadius: '2px',
    },
});

export const ChatMessageAdd = (props) => {
    const {disabled, onSend, ...other} = props;
    const {user} = useAuth();
    const fileInputRef = useRef(null);
    const [body, setBody] = useState('');
    const [attachment, setAttachment] = useState(null);

    const templateMessages = [{
        text: 'Submit', color: 'success.main', onClick: () => {
            console.log('submit clicked');
            setBody('submit!');
        },
    },
        //     {
        //     text: 'How can I help you?', color: 'info.main', onClick: () => {
        //         console.log('How can I help you clicked');
        //         setBody('How can I help you?');
        //     },
        // }, {
        //     text: 'Thank you!', color: 'warning.main', onClick: () => {
        //         console.log('Thank you clicked');
        //         setBody('Thank you!');
        //     },
        // },
        {
            text: 'Reject', color: 'error.main', onClick: () => {
                console.log('Reject clicked');
                setBody('Reject');
            },
        }]
    // {
    // text: 'I will get back to you soon.', color: 'primary.main', onClick: () => {
    //     console.log('I will get back to you soon clicked');
    //     setBody('I will get back to you soon.');
    // },


    const handleAttach = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback((event) => {
        const file = event.target.files[0];
        if (file) {
            setAttachment(file);
            onSend?.(null, file);
            setAttachment(null);
        }
    }, [onSend]);

    const handleChange = useCallback((event) => {
        setBody(event.target.value);
    }, []);

    const handleSend = useCallback(() => {
        if (!body && !attachment) return;

        onSend?.(body, attachment);
        setBody('');
        setAttachment(null);
    }, [body, attachment, onSend]);

    const handleKeyUp = useCallback((event) => {
        if (event.code === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    }, [handleSend]);

    return (<Box>
        <ScrollableBox sx={{ml: 3, mr: 9}}>
            {templateMessages.map((template, index) => (<Chip
                key={index}
                label={template.text}
                onClick={template.onClick}
                sx={{
                    cursor: 'pointer', backgroundColor: template.color,
                    width: '15%',
                    color: 'common.white', // Цвет текста
                    transition: 'transform 0.2s', // Анимация
                    '&:hover': {
                        backgroundColor: template.color,
                        transform: 'scale(1.1)', // Увеличение при наведении
                    },
                }}
            />))}
        </ScrollableBox>


        <Stack
            alignItems="center"
            direction="row"
            spacing={2}
            sx={{
                px: 3, py: 1
            }}
            {...other}>
            <Avatar
                sx={{
                    display: {
                        xs: 'none', sm: 'inline'
                    }
                }}
                src={user?.avatar || '/assets/default-avatar.png'}
            />
            <OutlinedInput
                disabled={disabled}
                fullWidth
                multiline
                maxRows={4}
                onChange={handleChange}
                onKeyUp={handleKeyUp}
                placeholder="Leave a message"
                size="small"
                value={body}
            />
            <Box
                sx={{
                    alignItems: 'center', display: 'flex', m: -2, ml: 2
                }}
            >
                <Tooltip title="Send">
                    <Box sx={{m: 1}}>
                        <IconButton
                            color="primary"
                            disabled={(!body && !attachment) || disabled}
                            sx={{
                                backgroundColor: 'primary.main', color: 'primary.contrastText', '&:hover': {
                                    backgroundColor: 'primary.dark'
                                }
                            }}
                            onClick={handleSend}
                        >
                            <SvgIcon>
                                <Send01Icon/>
                            </SvgIcon>
                        </IconButton>
                    </Box>
                </Tooltip>
                <Tooltip title="Attach photo">
                    <Box
                        sx={{
                            display: {
                                xs: 'none', sm: 'inline-flex'
                            }, m: 1
                        }}
                    >
                        <IconButton
                            disabled={disabled}
                            edge="end"
                            onClick={handleAttach}
                        >
                            <SvgIcon>
                                <Camera01Icon/>
                            </SvgIcon>
                        </IconButton>
                    </Box>
                </Tooltip>
                <Tooltip title="Attach file">
                    <Box
                        sx={{
                            display: {
                                xs: 'none', sm: 'inline-flex'
                            }, m: 1
                        }}
                    >
                        <IconButton
                            disabled={disabled}
                            edge="end"
                            onClick={handleAttach}
                        >
                            <SvgIcon>
                                <Attachment01Icon/>
                            </SvgIcon>
                        </IconButton>
                    </Box>
                </Tooltip>
            </Box>
            <input
                hidden
                ref={fileInputRef}
                type="file"
                accept="image/*, .pdf, .doc, .docx"
                onChange={handleFileChange}
            />
        </Stack>
    </Box>);
};

ChatMessageAdd.propTypes = {
    disabled: PropTypes.bool, onSend: PropTypes.func
};

ChatMessageAdd.defaultProps = {
    disabled: false
};