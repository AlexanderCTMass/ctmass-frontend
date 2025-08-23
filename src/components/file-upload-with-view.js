import React from 'react';
import PropTypes from 'prop-types';
import { ImageList, Stack, TextField } from '@mui/material';
import { PhotosDropzone } from "src/components/photos-dropzone";
import { PreviewEditable } from "src/components/myfancy/image-preview-editable";
import Fancybox from "src/components/myfancy/myfancybox";
import Grid from "@mui/material/Unstable_Grid2";

export const FileUploadSection = ({
    files,
    onDrop,
    onRemove,
    onRemoveAll,
    accept = { 'image/*,.pdf': [] },
    caption = "Attach photos or pdf",
    maxFiles = 3,
    onUpdate, updateFields
}) => {

    const isEditableCustomFields = onUpdate && updateFields?.length > 0;
    const columns = isEditableCustomFields ? 2 : 4;
    return (
        <>
            <PhotosDropzone
                accept={accept}
                caption={caption}
                maxFiles={maxFiles}
                onDrop={onDrop}
                onRemove={onRemove}
                onRemoveAll={onRemoveAll}
            />

            {files.length > 0 && (
                <Fancybox options={{ Carousel: { infinite: false } }}>
                    <Grid container spacing={2}>
                        {files.map((file, index) => (
                            <Grid item xs={12} md={12 / columns} key={file.preview + index}>
                                <PreviewEditable
                                    key={file.preview + index}
                                    attach={file}
                                    onRemove={() => onRemove(index)}
                                    onUpdate={onUpdate}
                                    updateFields={updateFields}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Fancybox>
            )}
        </>
    );
};

FileUploadSection.propTypes = {
    files: PropTypes.array.isRequired,
    onDrop: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    onRemoveAll: PropTypes.func.isRequired,
    accept: PropTypes.object,
    caption: PropTypes.string,
    maxFiles: PropTypes.number
};