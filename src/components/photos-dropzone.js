import { Avatar, Box, Stack, SvgIcon, Typography, useMediaQuery } from '@mui/material';
import Upload01Icon from '@untitled-ui/icons-react/build/esm/Upload01';
import PropTypes from 'prop-types';
import * as React from "react";
import { useDropzone } from 'react-dropzone';

export const PhotosDropzone = (props) => {
    const {
        caption, onRemove, onRemoveAll, onUpload = () => {
        }, ...other
    } = props;
    const { getRootProps, getInputProps, isDragActive } = useDropzone(other);
    const smUp = useMediaQuery((theme) => theme.breakpoints.up('sm'));

    return (
        <div>
            <Box
                sx={{
                    alignItems: 'center',
                    border: 1,
                    borderRadius: 1,
                    borderStyle: 'dashed',
                    borderColor: 'divider',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    outline: 'none',
                    p: 3,
                    ...(isDragActive && {
                        backgroundColor: 'action.active',
                        opacity: 0.5
                    }),
                    '&:hover': {
                        backgroundColor: 'action.hover',
                        cursor: 'pointer',
                        opacity: 0.5
                    }
                }}
                {...getRootProps()}>
                <input {...getInputProps()} />
                <Stack
                    alignItems="center"
                    direction="row"
                    spacing={2}
                >
                    <Avatar
                        sx={{
                            height: 64,
                            width: 64
                        }}
                    >
                        <SvgIcon>
                            <Upload01Icon />
                        </SvgIcon>
                    </Avatar>
                    <Stack spacing={1}>
                        <Typography
                            sx={{
                                '& span': {
                                    textDecoration: 'underline'
                                }
                            }}
                            variant="h6"
                        >
                            <span>Click to upload</span>{smUp ? " or drag and drop" : ""}
                        </Typography>
                        {caption && (
                            <Typography
                                color="text.secondary"
                                variant="body2"
                            >
                                {caption}
                            </Typography>
                        )}
                    </Stack>
                </Stack>
            </Box>
        </div>
    );
};

PhotosDropzone.propTypes = {
    caption: PropTypes.string,
    onRemove: PropTypes.func,
    onRemoveAll: PropTypes.func,
    onUpload: PropTypes.func,
    // From Dropzone
    accept: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string.isRequired).isRequired),
    disabled: PropTypes.bool,
    getFilesFromEvent: PropTypes.func,
    maxFiles: PropTypes.number,
    maxSize: PropTypes.number,
    minSize: PropTypes.number,
    noClick: PropTypes.bool,
    noDrag: PropTypes.bool,
    noDragEventsBubbling: PropTypes.bool,
    noKeyboard: PropTypes.bool,
    onDrop: PropTypes.func,
    onDropAccepted: PropTypes.func,
    onDropRejected: PropTypes.func,
    onFileDialogCancel: PropTypes.func,
    preventDropOnDocument: PropTypes.bool
};
