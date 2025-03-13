import React, {memo} from 'react';
import PropTypes from 'prop-types';
import {Box, Typography, useMediaQuery} from "@mui/material";
import {QuillEditor} from "src/components/quill-editor";

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

const About = ({editMode, profile, setProfile}) => {

    const mdUp = useMediaQuery((theme) => theme.breakpoints.up('md'));

    const handleAboutChange = (e) => {
        const temp = {
            ...profile.profile,
            about: e
        };

        setProfile(prev => ({
            ...prev,
            profile: temp
        }));
    };

    const modules = mdUp ? {
        toolbar: [
            [{'header': [1, 2, false]}],
            ['bold', 'italic', 'underline', 'blockquote'],
            [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
            // ['link', 'image'],
            ['clean']
        ],
    } : {
        toolbar: [
            ['bold', 'italic', 'underline'],
            [{'list': 'ordered'}, {'list': 'bullet'},]
        ],
    }

    return (
        <Box component="section" sx={{mr: 1.5}}>
            <Typography variant="subtitle1" sx={sectionTitleStyle}>
                About
            </Typography>

            {editMode ? (
                <QuillEditor
                    onChange={handleAboutChange}
                    modules={modules}
                    placeholder="You can mention: years in business, what you're passionate aboute, special skills or equipment"
                    sx={mdUp ? {height: 200} : {height: 400}}
                    value={profile?.profile?.about || ''}
                />
            ) : (
                <div>
                    {profile?.profile?.about ? (
                        <div>
                            <Typography label="HTML Content"
                                        value={profile?.profile?.about}
                                        variant="body1"
                                        sx={{textAlign: 'justify'}}>
                            </Typography>
                            <div
                                dangerouslySetInnerHTML={{__html: profile?.profile?.about}}
                                style={{
                                    borderRadius: '4px',
                                }}
                            />
                        </div>) : (
                        <div>
                            <Typography label="HTML Content"
                                        value={'No information provided'}
                                        color="text.secondary" fontSize="14px"
                                        sx={{textAlign: 'justify'}}>
                            </Typography>
                            <div
                                dangerouslySetInnerHTML={{__html: 'No information provided'}}
                                style={{
                                    color: 'text.secondary',
                                    fontSize: '14px',
                                    borderRadius: '4px',
                                }}
                            />
                        </div>)}
                </div>
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