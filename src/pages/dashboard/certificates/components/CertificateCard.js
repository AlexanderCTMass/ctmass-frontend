import { memo, useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from 'src/hooks/use-auth';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Tooltip,
    Typography
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EditIcon from '@mui/icons-material/Edit';
import ShareIcon from '@mui/icons-material/Share';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import { paths } from 'src/paths';
import ImageModalWindow from 'src/pages/cabinet/profiles/my/ImageModalWindow';
import { isPdf, PdfThumbnail, PdfPreviewModal } from 'src/components/pdf-preview';
import { alpha } from '@mui/material/styles';
import { focusRingSx, IconTile, StatusPill } from 'src/components/ctmass-ui';
import { BRAND, FONT, RADIUS, SHADOW } from 'src/theme/ctmass-tokens';

const CertificateCard = ({ certificate, onToggleVisibility, onDelete }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [modalState, setModalState] = useState({ open: false, images: [], index: 0 });
    const [pdfPreview, setPdfPreview] = useState({ open: false, url: '', name: '' });
    const [confirmOpen, setConfirmOpen] = useState(false);

    const isPublic = certificate.isPrivate !== true;
    const files = useMemo(
        () => certificate.certificates || certificate.files || [],
        [certificate.certificates, certificate.files]
    );
    const attachmentsCount = files.length;

    const imageFiles = files.filter(
        (f) => f.url && (f.type?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(f.url))
    );
    const imageUrls = imageFiles.map((f) => f.url);

    const pdfFiles = useMemo(
        () => files.filter((f) => f.url && isPdf(f)),
        [files]
    );

    const publicUrl = useMemo(() => {
        if (!user?.id) return '';
        const path = paths.dashboard.certificates.publicPage
            .replace(':userId', user.id)
            .replace(':certId', certificate.id);
        return `${window.location.origin}${path}`;
    }, [user?.id, certificate.id]);

    const handleMenuOpen = useCallback((e) => {
        e.stopPropagation();
        setMenuAnchor(e.currentTarget);
    }, []);

    const handleMenuClose = useCallback(() => {
        setMenuAnchor(null);
    }, []);

    const handleEdit = useCallback(() => {
        handleMenuClose();
        const editPath = paths.dashboard.certificates.edit.replace(':certId', certificate.id);
        navigate(editPath);
    }, [certificate.id, navigate, handleMenuClose]);

    const handleViewPublic = useCallback(() => {
        handleMenuClose();
        const publicPath = paths.dashboard.certificates.publicPage
            .replace(':userId', user?.id)
            .replace(':certId', certificate.id);
        navigate(publicPath);
    }, [certificate.id, user?.id, navigate, handleMenuClose]);

    const handleToggle = useCallback(() => {
        onToggleVisibility(certificate.id, !isPublic);
    }, [certificate.id, isPublic, onToggleVisibility]);

    const handleImageClick = useCallback((index) => {
        setModalState({ open: true, images: imageUrls, index });
    }, [imageUrls]);

    const handleModalClose = useCallback(() => {
        setModalState((prev) => ({ ...prev, open: false }));
    }, []);

    const handlePdfClick = useCallback((file) => {
        setPdfPreview({ open: true, url: file.url, name: file.name });
    }, []);

    const handlePdfClose = useCallback(() => {
        setPdfPreview((prev) => ({ ...prev, open: false }));
    }, []);

    const handleShare = useCallback(async () => {
        handleMenuClose();
        if (!publicUrl) return;
        try {
            await navigator.clipboard.writeText(publicUrl);
            toast.success('Public link copied to clipboard');
        } catch (err) {
            console.error(err);
            toast.error('Failed to copy link');
        }
    }, [publicUrl, handleMenuClose]);

    const handleDeleteClick = useCallback(() => {
        handleMenuClose();
        setConfirmOpen(true);
    }, [handleMenuClose]);

    const handleConfirmDelete = useCallback(() => {
        setConfirmOpen(false);
        onDelete(certificate.id);
    }, [onDelete, certificate.id]);

    const displayTitle = certificate.institution || certificate.issuingOrganization || certificate.title || 'Untitled';
    const displaySubtitle = certificate.specialty || certificate.degree || '';
    const documentType = certificate.documentType || certificate.certificateType || '';

    return (
        <>
            <Card
                variant="outlined"
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    transition: 'box-shadow .25s ease, border-color .25s ease',
                    '&:hover': { boxShadow: SHADOW.md, borderColor: alpha(BRAND.navy, 0.16) }
                }}
            >
                <CardContent sx={{ p: 2.5, flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                        <IconTile size={44}><InsertDriveFileOutlinedIcon /></IconTile>

                        <Tooltip title={isPublic ? 'Visible on your profile. Click to hide.' : 'Hidden from your profile. Click to show.'}>
                            <Box
                                component="button"
                                type="button"
                                onClick={handleToggle}
                                sx={{ p: 0, border: 0, bgcolor: 'transparent', cursor: 'pointer', borderRadius: 999, ...focusRingSx }}
                            >
                                <StatusPill tone={isPublic ? 'green' : 'muted'} icon={isPublic ? <VisibilityIcon /> : <VisibilityOffIcon />}>
                                    {isPublic ? 'Public' : 'Private'}
                                </StatusPill>
                            </Box>
                        </Tooltip>
                    </Box>

                    <Typography sx={{ mb: 0.5, fontFamily: FONT.display, fontWeight: 700, fontSize: 18, lineHeight: 1.3, color: BRAND.navy, overflowWrap: 'anywhere' }}>
                        {displayTitle}
                    </Typography>

                    {displaySubtitle && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {displaySubtitle}
                        </Typography>
                    )}

                    {documentType && (
                        <StatusPill tone="navy" sx={{ mb: 1 }}>{documentType}</StatusPill>
                    )}

                    {(imageFiles.length > 0 || pdfFiles.length > 0) && (
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1.5 }}>
                            {imageFiles.map((file, index) => (
                                <Box
                                    key={file.id || index}
                                    component="img"
                                    src={file.url}
                                    alt={file.name || 'attachment'}
                                    onClick={() => handleImageClick(index)}
                                    sx={{
                                        width: 72,
                                        height: 72,
                                        objectFit: 'cover',
                                        borderRadius: 1.5,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        '&:hover': {
                                            transform: 'scale(1.05)',
                                            boxShadow: 3
                                        }
                                    }}
                                />
                            ))}
                            {pdfFiles.map((file, index) => (
                                <PdfThumbnail
                                    key={file.id || `pdf-${index}`}
                                    url={file.url}
                                    label={file.name}
                                    onClick={() => handlePdfClick(file)}
                                    badge={false}
                                    sx={{
                                        width: 72,
                                        height: 72,
                                        borderRadius: 1.5,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        '&:hover': {
                                            transform: 'scale(1.05)',
                                            boxShadow: 3
                                        }
                                    }}
                                />
                            ))}
                        </Box>
                    )}
                </CardContent>

                <Box
                    sx={{
                        px: 2.5,
                        py: 1.5,
                        borderTop: `1px solid ${alpha(BRAND.navy, 0.08)}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AttachFileIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                            {attachmentsCount === 1 ? '1 file' : `${attachmentsCount} files`}
                        </Typography>
                    </Box>

                    <IconButton aria-label="Document actions" onClick={handleMenuOpen} sx={{ color: BRAND.navy, bgcolor: alpha(BRAND.navy, 0.06), borderRadius: '12px', '&:hover': { bgcolor: alpha(BRAND.navy, 0.12) } }}>
                        <MoreVertIcon fontSize="small" />
                    </IconButton>
                </Box>

                <Menu
                    anchorEl={menuAnchor}
                    open={Boolean(menuAnchor)}
                    onClose={handleMenuClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    PaperProps={{ sx: { minWidth: 200, borderRadius: RADIUS.inner, boxShadow: SHADOW.lg, border: `1px solid ${alpha(BRAND.navy, 0.08)}` } }}
                >
                    <MenuItem onClick={handleEdit}>
                        <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>Edit document</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleShare}>
                        <ListItemIcon><ShareIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>Share document</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleViewPublic}>
                        <ListItemIcon><OpenInNewIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>View public</ListItemText>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
                        <ListItemIcon><DeleteOutlineIcon fontSize="small" color="error" /></ListItemIcon>
                        <ListItemText>Delete document</ListItemText>
                    </MenuItem>
                </Menu>
            </Card>

            <ImageModalWindow
                open={modalState.open}
                handleClose={handleModalClose}
                images={modalState.images}
                currentIndex={modalState.index}
                setCurrentIndex={(index) => setModalState((prev) => ({ ...prev, index }))}
            />

            <PdfPreviewModal
                open={pdfPreview.open}
                url={pdfPreview.url}
                name={pdfPreview.name}
                onClose={handlePdfClose}
            />

            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: RADIUS.card, boxShadow: SHADOW.lg } }}>
                <DialogTitle sx={{ fontFamily: FONT.display, fontWeight: 800, color: BRAND.navy }}>Delete this document?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        It will be removed from your profile and from linked trades. This cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

CertificateCard.propTypes = {
    certificate: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string,
        institution: PropTypes.string,
        issuingOrganization: PropTypes.string,
        specialty: PropTypes.string,
        degree: PropTypes.string,
        documentType: PropTypes.string,
        certificateType: PropTypes.string,
        isPrivate: PropTypes.bool,
        files: PropTypes.array,
        certificates: PropTypes.array
    }).isRequired,
    onToggleVisibility: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired
};

export default memo(CertificateCard);
