import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Typography,
    Box,
    IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const AboutMeModal = ({ open, onClose, onSave, initialText }) => {
    const [aboutText, setAboutText] = useState(initialText);
    const [charCount, setCharCount] = useState(0);
    const maxChars = 1000;

    const handleTextChange = (e) => {
        const text = e.target.value;
        if (text.length <= maxChars) {
            setAboutText(text);
            setCharCount(text.length);
        }
    };

    const handleSave = () => {
        onSave(aboutText);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">About me</Typography>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent>
                <Typography variant="body2" color="text.secondary" paragraph>
                    Tell us about yourself in detail so that clients can get to know you better. Do not add links, contacts, or prices for services here.
                </Typography>

                <TextField
                    multiline
                    rows={8}
                    fullWidth
                    variant="outlined"
                    placeholder="I transform ordinary rooms into thoughtful spaces, where every detail works for the convenience of residents. From rough finishing to designer renovation, I personally control all stages. I use only certified materials, because I believe that high-quality renovation is an investment in quality of life."
                    value={aboutText}
                    onChange={handleTextChange}
                    inputProps={{ maxLength: maxChars }}
                />

                <Typography
                    variant="caption"
                    color={charCount === maxChars ? 'error' : 'text.secondary'}
                    display="block"
                    textAlign="right"
                    mt={1}
                >
                    {charCount}/{maxChars} characters
                </Typography>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={!aboutText.trim()}
                    fullWidth
                    size="large"
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AboutMeModal;