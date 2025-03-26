import React, {useEffect, useRef, useState} from 'react';
import {Box, CircularProgress, IconButton, InputAdornment, Stack, TextField, Tooltip, Typography} from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import {INFO} from "src/libs/log";
import toast from "react-hot-toast";


const SmartTextArea = ({
                           label,
                           initialValue,
                           minRows = 4,
                           maxRows = 10,
                           onTextChange,
                           placeholder,
                           generate = () => 'empty text'
                       }) => {
    const [displayText, setDisplayText] = useState(initialValue || '');
    const [fullText, setFullText] = useState(initialValue || '');
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const typingInterval = useRef(null);
    const typingIndex = useRef(0);

    // Эффект для анимации печатания
    useEffect(() => {
        if (isTyping && fullText) {
            typingInterval.current = setInterval(() => {
                setDisplayText(prev => {
                    const newText = fullText.substring(0, typingIndex.current + 1);
                    typingIndex.current += 1;

                    if (typingIndex.current >= fullText.length) {
                        clearInterval(typingInterval.current);
                        setIsTyping(false);
                    }

                    return newText;
                });
            }, 7);

            return () => clearInterval(typingInterval.current);
        }
    }, [isTyping, fullText]);

    const generateText = () => {
        setIsLoading(true);
        setFullText('');
        setDisplayText('');

        // Имитация задержки загрузки
        setTimeout(() => {
            try {
                const generatedText = generate();
                setFullText(generatedText);
                setIsTyping(true);
                typingIndex.current = 0;
                onTextChange(generatedText);
                toast.success('Text generated successfully');
            } catch (err) {
                toast.error('Error generating text');
                console.error("Generation error:", err);
            } finally {
                setIsLoading(false);
            }
        }, 500);
    };


    const handleChange = (e) => {
        const newText = e.target.value;
        setDisplayText(newText);
        setFullText(newText);
        onTextChange(newText);

        // Сбросить анимацию при ручном редактировании
        if (typingInterval.current) {
            clearInterval(typingInterval.current);
            setIsTyping(false);
        }
    };

    return (
        <Box sx={{position: 'relative'}}>
            <TextField
                label={label}
                multiline
                fullWidth
                minRows={minRows} // минимальное количество строк
                maxRows={maxRows} // максимальное количество строк перед появлением скролла
                value={displayText}
                onChange={handleChange}
                placeholder={placeholder}
                InputProps={{
                    maxLength: 1000,
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                onClick={generateText}
                                disabled={isLoading}
                                aria-label="Generate text"
                            >
                                {isLoading ? (
                                    <CircularProgress size={24}/>
                                ) : (
                                    <Tooltip title="Generate text">
                                        <AutoFixHighIcon/>
                                    </Tooltip>
                                )}
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
                sx={{
                    '& .MuiInputBase-root': {
                        transition: 'all 0.3s ease',
                        background: isTyping ? 'rgba(0, 0, 0, 0.02)' : 'inherit'
                    }
                }}
            />

            {isTyping && (
                <Typography
                    variant="caption"
                    sx={{
                        position: 'absolute',
                        right: 10,
                        bottom: 10,
                        color: 'text.secondary',
                        animation: 'blink 1s infinite',
                        '@keyframes blink': {
                            '0%': {opacity: 0},
                            '50%': {opacity: 1},
                            '100%': {opacity: 0}
                        }
                    }}
                >
                    typing...
                </Typography>
            )}
        </Box>
    );
};

export default SmartTextArea;