import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { TextField, Typography, Box } from "@mui/material";

// Стилизованные константы
const sectionTitleStyle = {
    mt: 3,
    mb: 1,
    color: "text.secondary",
    fontWeight: "bold",
    textTransform: "uppercase"
};

const textFieldStyle = {
    mt: 1,
    "& .MuiOutlinedInput-root": {
        padding: 1
    }
};

const About = ({ editMode, profile, setProfile }) => {
    const handleAboutChange = (e) => {
        setProfile(prev => ({
            ...prev,
            about: e.target.value
        }));
    };

    return (
        <Box component="section" sx={{mr: 1.5}}>
            <Typography variant="subtitle1" sx={sectionTitleStyle}>
                About
            </Typography>

            {editMode ? (
                <TextField
                    fullWidth
                    multiline
                    minRows={4}
                    maxRows={8}
                    variant="outlined"
                    value={profile.about || ''}
                    onChange={handleAboutChange}
                    sx={textFieldStyle}
                    inputProps={{
                        maxLength: 500,
                        'aria-label': 'Edit about section'
                    }}
                />
            ) : (
                <Typography variant="body1" paragraph sx={{textAlign: 'justify'}}>
                    {profile.about || 'No information provided'}
                </Typography>
            )}
        </Box>
    );
};

About.propTypes = {
    editMode: PropTypes.bool.isRequired,
    profile: PropTypes.shape({
        about: PropTypes.string
    }).isRequired,
    setProfile: PropTypes.func.isRequired
};

export default memo(About);