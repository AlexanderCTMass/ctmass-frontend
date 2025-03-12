import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import Camera01Icon from '@untitled-ui/icons-react/build/esm/Camera01';
import Send01Icon from '@untitled-ui/icons-react/build/esm/Send01';
import CloseIcon from '@untitled-ui/icons-react/build/esm/XClose';
import { Box, Chip, IconButton, OutlinedInput, Stack, styled, SvgIcon, Tooltip } from '@mui/material';

const ScrollableBox = styled(Box)({
    display: 'flex',
    overflowX: 'auto',
    gap: '8px',
    padding: '8px 0',
    justifyContent: 'center',
    '&::-webkit-scrollbar': {
        height: '4px',
    },
    '&::-webkit-scrollbar-thumb': {
        backgroundColor: '#888',
        borderRadius: '2px',
    },
});

export const ChatMessageAdd = (props) => {
    const { disabled, templatesEnabled = false, onSend, isSending = false, ...other } = props;
    const [body, setBody] = useState('');
    const [files, setFiles] = useState([]);

    const templateMessages = [
        {
            text: 'Submit',
            color: 'success.main',
            onClick: () => {
                console.log('submit clicked');
                setBody('submit!');
            },
        },
        {
            text: 'Reject',
            color: 'error.main',
            onClick: () => {
                console.log('Reject clicked');
                setBody('Reject');
            },
        },
    ];

    const handleChange = (event) => {
        setBody(event.target.value);
    };

    const handleKeyUp = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); // Предотвращаем перенос строки
            handleSend();
        }
    };

    const handleAttachFiles = () => {
        if (isSending) return; // Блокируем выбор файлов во время отправки

        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = 'image/*';
        input.onchange = (e) => {
            const selectedFiles = Array.from(e.target.files);
            const validFiles = selectedFiles.filter((file) => file.size <= 5 * 1024 * 1024); // Фильтруем файлы по размеру (5 Мб)
            if (validFiles.length > 5) {
                alert('You can upload up to 5 files.');
                return;
            }
            if (validFiles.length !== selectedFiles.length) {
                alert('Some files exceed the allowed size (5 MB)');
            }
            setFiles((prevFiles) => [...prevFiles, ...validFiles].slice(0, 5)); // Ограничиваем количество файлов до 5
        };
        input.click();
    };

    const handleRemoveFile = (index) => {
        if (isSending) return; // Блокируем удаление файлов во время отправки
        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    const handleSend = useCallback(() => {
        if ((!body && files.length === 0) || isSending) return; // Блокируем отправку, если идет отправка

        onSend?.(body, files);
        setBody('');
        setFiles([]);
    }, [body, files, onSend, isSending]);

    return (
        <Box>
            {templatesEnabled && (
                <ScrollableBox>
                    {templateMessages.map((template, index) => (
                        <Chip
                            key={index}
                            label={template.text}
                            onClick={template.onClick}
                            sx={{
                                cursor: 'pointer',
                                backgroundColor: template.color,
                                width: '15%',
                                color: 'common.white',
                                transition: 'transform 0.2s',
                                '&:hover': {
                                    backgroundColor: template.color,
                                    transform: 'scale(1.1)',
                                },
                            }}
                        />
                    ))}
                </ScrollableBox>
            )}

            {files.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1, p: 2, overflowX: 'auto' }}>
                    {files.map((file, index) => (
                        <Box key={index} sx={{ position: 'relative', opacity: isSending ? 0.5 : 1 }}>
                            <img
                                src={URL.createObjectURL(file)}
                                alt={`file-${index}`}
                                style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 4 }}
                            />
                            {!isSending && (
                                <IconButton
                                    size="small"
                                    sx={{
                                        position: 'absolute',
                                        top: 4,
                                        right: 4,
                                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                        },
                                    }}
                                    onClick={() => handleRemoveFile(index)}
                                >
                                    <SvgIcon fontSize="small">
                                        <CloseIcon />
                                    </SvgIcon>
                                </IconButton>
                            )}
                        </Box>
                    ))}
                </Box>
            )}

            <Stack
                alignItems="center"
                direction="row"
                spacing={2}
                sx={{
                    px: 3,
                    py: 1,
                }}
                {...other}
            >
                <OutlinedInput
                    disabled={disabled || isSending} // Блокируем поле ввода во время отправки
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
                        alignItems: 'center',
                        display: 'flex',
                        m: -2,
                        ml: 2,
                    }}
                >
                    <Tooltip title="Send">
                        <Box sx={{ m: 1 }}>
                            <IconButton
                                color="primary"
                                disabled={(!body && files.length === 0) || disabled || isSending} // Блокируем кнопку отправки во время отправки
                                sx={{
                                    backgroundColor: 'primary.main',
                                    color: 'primary.contrastText',
                                    '&:hover': {
                                        backgroundColor: 'primary.dark',
                                    },
                                }}
                                onClick={handleSend}
                            >
                                <SvgIcon>
                                    <Send01Icon />
                                </SvgIcon>
                            </IconButton>
                        </Box>
                    </Tooltip>
                    <Tooltip title="Attach files">
                        <Box
                            sx={{
                                display: {
                                    xs: 'none',
                                    sm: 'inline-flex',
                                },
                                m: 1,
                            }}
                        >
                            <IconButton
                                disabled={disabled || isSending} // Блокируем кнопку выбора фото во время отправки
                                edge="end"
                                onClick={handleAttachFiles}
                            >
                                <SvgIcon>
                                    <Camera01Icon />
                                </SvgIcon>
                            </IconButton>
                        </Box>
                    </Tooltip>
                </Box>
            </Stack>
        </Box>
    );
};

ChatMessageAdd.propTypes = {
    disabled: PropTypes.bool,
    onSend: PropTypes.func,
    isSending: PropTypes.bool, // Новый пропс для блокировки интерфейса
};

ChatMessageAdd.defaultProps = {
    disabled: false,
    isSending: false,
};