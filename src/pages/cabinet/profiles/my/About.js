import React, {memo} from 'react';
import PropTypes from 'prop-types';
import {Box, Typography, useMediaQuery} from "@mui/material";
import {QuillEditor} from "src/components/quill-editor";

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
    const stripHtmlTags = (html) => {
        return html.replace(/<[^>]+>/g, '').trim();
    };

    const isAboutEmpty = (about) => {
        if (!about) return true; // Если about отсутствует
        const textWithoutTags = stripHtmlTags(about);
        return textWithoutTags.length === 0;
    };

    return (
        <Box component="section" sx={{mr: 1.5}}>
            <Typography variant="h6" color="text.secondary" sx={{mt: 4}}>
                ABOUT
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
                    {!isAboutEmpty(profile?.profile?.about) ? (
                        <div>
                            <Typography
                                variant="body1"
                                sx={{ textAlign: 'justify' }}
                                dangerouslySetInnerHTML={{ __html: profile.profile.about }}
                            />
                        </div>
                    ) : (
                        <div>
                            <Typography
                                variant="body1"
                                color="text.secondary"
                                sx={{ textAlign: 'justify', fontSize: '14px', mt:1 }}
                            >
                                No information provided
                            </Typography>
                        </div>
                    )}
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