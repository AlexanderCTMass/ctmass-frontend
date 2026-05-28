import PropTypes from 'prop-types';
import {
    Box,
    Chip,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    Typography
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CloseIcon from '@mui/icons-material/Close';
import { downloadFile } from 'src/utils/downloadFile';

const PDF_URL_RE = /\.pdf($|\?|#)/i;

export const isPdfUrl = (url = '') => typeof url === 'string' && PDF_URL_RE.test(url);

export const isPdf = (file) => {
    if (!file) return false;
    if (typeof file === 'string') return isPdfUrl(file);
    const type = file.type || '';
    return type === 'application/pdf' || isPdfUrl(file.url || '') || isPdfUrl(file.preview || '');
};

const withViewerHints = (url) => {
    if (!url) return url;
    const sep = url.includes('#') ? '&' : '#';
    return `${url}${sep}toolbar=0&navpanes=0&scrollbar=0&view=FitH`;
};

export const PdfThumbnail = ({ url, label, onClick, sx, badge = true }) => (
    <Box
        onClick={onClick}
        sx={{
            position: 'relative',
            overflow: 'hidden',
            cursor: onClick ? 'pointer' : 'default',
            backgroundColor: 'grey.100',
            ...sx
        }}
    >
        <Box
            component="iframe"
            src={withViewerHints(url)}
            title={label || 'PDF preview'}
            tabIndex={-1}
            scrolling="no"
            sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                // Oversize the iframe so the PDF viewer's scrollbar/controls
                // fall outside the clipped (overflow:hidden) container.
                width: 'calc(100% + 32px)',
                height: 'calc(100% + 32px)',
                border: 'none',
                pointerEvents: 'none',
                backgroundColor: '#fff'
            }}
        />
        {/* Overlay to capture clicks and prevent iframe interaction */}
        <Box sx={{ position: 'absolute', inset: 0 }} />
        {badge ? (
            <Chip
                icon={<PictureAsPdfIcon sx={{ fontSize: 16 }} />}
                label="PDF"
                size="small"
                color="error"
                sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    height: 22,
                    fontWeight: 600,
                    '& .MuiChip-label': { px: 0.75 }
                }}
            />
        ) : (
            <PictureAsPdfIcon
                sx={{
                    position: 'absolute',
                    top: 2,
                    left: 2,
                    fontSize: 16,
                    color: 'error.main',
                    filter: 'drop-shadow(0 0 1px rgba(255,255,255,0.9))'
                }}
            />
        )}
    </Box>
);

PdfThumbnail.propTypes = {
    url: PropTypes.string.isRequired,
    label: PropTypes.string,
    onClick: PropTypes.func,
    sx: PropTypes.object,
    badge: PropTypes.bool
};

export const PdfPreviewModal = ({ open, url, name, onClose }) => (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { height: '90vh' } }}>
        <DialogTitle sx={{ py: 1.5 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
                    <PictureAsPdfIcon color="error" />
                    <Typography variant="subtitle1" fontWeight={600} noWrap>
                        {name || 'Document'}
                    </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                    <IconButton size="small" onClick={() => window.open(url, '_blank', 'noopener')} title="Open in new tab">
                        <OpenInNewIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => downloadFile(url, name || 'document.pdf')} title="Download">
                        <FileDownloadOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={onClose} title="Close">
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Stack>
            </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: '100%' }}>
            {url && (
                <Box
                    component="iframe"
                    src={url}
                    title={name || 'PDF document'}
                    sx={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                />
            )}
        </DialogContent>
    </Dialog>
);

PdfPreviewModal.propTypes = {
    open: PropTypes.bool.isRequired,
    url: PropTypes.string,
    name: PropTypes.string,
    onClose: PropTypes.func.isRequired
};
