import React from 'react';
import PropTypes from 'prop-types';
import {ImageList} from '@mui/material';
import {PhotosDropzone} from "src/components/photos-dropzone";
import {PreviewEditable} from "src/components/myfancy/image-preview-editable";
import Fancybox from "src/components/myfancy/myfancybox";

export const FileUploadSection = ({
                                      files,
                                      onDrop,
                                      onRemove,
                                      onRemoveAll,
                                      accept = {'image/*,.pdf': []},
                                      caption = "Attach photos or pdf",
                                      maxFiles = 3
                                  }) => {
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
                <Fancybox
                    options={{
                        Carousel: {
                            infinite: false,
                        },
                    }}
                >
                    <ImageList cols={4} rowHeight={100}>
                        {files.map((file, index) => (
                            <a
                                data-fancybox="gallery"
                                href={file.preview}
                                className={"my-fancy-link"}
                                key={index}
                            >
                                <PreviewEditable
                                    attach={{preview: file.preview}}
                                    onRemove={() => onRemove(index)}
                                />
                            </a>
                        ))}
                    </ImageList>
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