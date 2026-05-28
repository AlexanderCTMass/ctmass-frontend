import { memo, useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Divider, Stack, Typography } from '@mui/material';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { downloadFile } from 'src/utils/downloadFile';
import ImageModalWindow from 'src/pages/cabinet/profiles/my/ImageModalWindow';
import { isPdf, PdfThumbnail, PdfPreviewModal } from 'src/components/pdf-preview';

const AttachedDocumentsSection = ({ files }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalIndex, setModalIndex] = useState(0);
    const [pdfPreview, setPdfPreview] = useState({ open: false, url: '', name: '' });

    const imageFiles = useMemo(
        () => (files || []).filter((f) => f.url && !isPdf(f)),
        [files]
    );

    const imageUrls = useMemo(
        () => imageFiles.map((f) => f.url),
        [imageFiles]
    );

    const handleViewImage = useCallback((file) => {
        const index = imageFiles.findIndex((f) => f === file);
        setModalIndex(index >= 0 ? index : 0);
        setModalOpen(true);
    }, [imageFiles]);

    const handleCloseModal = useCallback(() => {
        setModalOpen(false);
    }, []);

    const handleViewPdf = useCallback((file) => {
        setPdfPreview({ open: true, url: file.url, name: file.name });
    }, []);

    const handleClosePdf = useCallback(() => {
        setPdfPreview((prev) => ({ ...prev, open: false }));
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
                {files.map((file, index) => {
                    const pdf = file.url && isPdf(file);
                    return (
                        <Box key={file.id || index}>
                            {pdf ? (
                                <PdfThumbnail
                                    url={file.url}
                                    label={file.name}
                                    onClick={() => handleViewPdf(file)}
                                    sx={{
                                        width: 180,
                                        height: 180,
                                        borderRadius: 2,
                                        border: '1px solid',
                                        borderColor: 'divider'
                                    }}
                                />
                            ) : (
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
                                    onClick={() => handleViewImage(file)}
                                />
                            )}
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
                                    {pdf ? 'PDF' : `Preview ${index + 1}`}
                                </Typography>
                                <Button
                                    size="small"
                                    variant="text"
                                    sx={{ fontSize: 12, py: 0, px: 0.5, minWidth: 'auto' }}
                                    onClick={() => (pdf ? handleViewPdf(file) : handleViewImage(file))}
                                >
                                    View Full
                                </Button>
                            </Stack>
                        </Box>
                    );
                })}
            </Box>

            <ImageModalWindow
                open={modalOpen}
                handleClose={handleCloseModal}
                images={imageUrls}
                currentIndex={modalIndex}
                setCurrentIndex={setModalIndex}
            />

            <PdfPreviewModal
                open={pdfPreview.open}
                url={pdfPreview.url}
                name={pdfPreview.name}
                onClose={handleClosePdf}
            />
        </Box>
    );
};

AttachedDocumentsSection.propTypes = {
    files: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string,
            url: PropTypes.string,
            name: PropTypes.string,
            type: PropTypes.string
        })
    )
};

AttachedDocumentsSection.defaultProps = {
    files: []
};

export default memo(AttachedDocumentsSection);
