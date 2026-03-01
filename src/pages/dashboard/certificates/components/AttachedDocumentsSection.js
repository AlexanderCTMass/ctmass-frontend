import { memo, useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Divider, Stack, Typography } from '@mui/material';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { downloadFile } from 'src/utils/downloadFile';
import ImageModalWindow from 'src/pages/cabinet/profiles/my/ImageModalWindow';

const AttachedDocumentsSection = ({ files }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalIndex, setModalIndex] = useState(0);

    const imageUrls = useMemo(
        () => (files || []).map((f) => f.url).filter(Boolean),
        [files]
    );

    const handleViewFull = useCallback((index) => {
        setModalIndex(index);
        setModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setModalOpen(false);
    }, []);

    const handleDownloadAll = useCallback(() => {
        (files || []).forEach((f, i) => {
            setTimeout(() => {
                downloadFile(f.url, f.name || `document-${i + 1}`);
            }, i * 600);
        });
    }, [files]);

    if (!files || files.length === 0) return null;

    return (
        <Box>
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1.5 }}
            >
                <Typography variant="h6" fontWeight={700}>
                    Attached Documents
                </Typography>
                <Button
                    size="small"
                    startIcon={<FileDownloadOutlinedIcon />}
                    onClick={handleDownloadAll}
                >
                    Download All
                </Button>
            </Stack>

            <Divider sx={{ mb: 2.5 }} />

            <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap' }}>
                {files.map((file, index) => (
                    <Box key={file.id || index}>
                        <Box
                            component="img"
                            src={file.url}
                            alt={`Preview ${index + 1}`}
                            sx={{
                                width: 180,
                                height: 180,
                                objectFit: 'cover',
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                                cursor: 'pointer',
                                display: 'block',
                                transition: 'opacity 0.2s',
                                '&:hover': { opacity: 0.82 }
                            }}
                            onClick={() => handleViewFull(index)}
                        />
                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            sx={{ mt: 0.75, width: 180 }}
                        >
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.4 }}
                            >
                                Preview {index + 1}
                            </Typography>
                            <Button
                                size="small"
                                variant="text"
                                sx={{ fontSize: 12, py: 0, px: 0.5, minWidth: 'auto' }}
                                onClick={() => handleViewFull(index)}
                            >
                                View Full
                            </Button>
                        </Stack>
                    </Box>
                ))}
            </Box>

            <ImageModalWindow
                open={modalOpen}
                handleClose={handleCloseModal}
                images={imageUrls}
                currentIndex={modalIndex}
                setCurrentIndex={setModalIndex}
            />
        </Box>
    );
};

AttachedDocumentsSection.propTypes = {
    files: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string,
            url: PropTypes.string,
            name: PropTypes.string
        })
    )
};

AttachedDocumentsSection.defaultProps = {
    files: []
};

export default memo(AttachedDocumentsSection);
