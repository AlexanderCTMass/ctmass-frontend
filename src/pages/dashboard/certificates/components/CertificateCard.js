import { memo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'src/hooks/use-auth';
import {
    Box,
    Card,
    CardContent,
    Chip,
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
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import { paths } from 'src/paths';

const CertificateCard = ({ certificate, onToggleVisibility, onDelete }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [menuAnchor, setMenuAnchor] = useState(null);

    const isPublic = certificate.isPrivate !== true;
    const attachmentsCount = (certificate.files || certificate.certificates || []).length;

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

    const displayTitle = certificate.institution || certificate.issuingOrganization || certificate.title || 'Untitled';
    const displaySubtitle = certificate.specialty || certificate.degree || '';
    const documentType = certificate.documentType || certificate.certificateType || '';

    return (
        <Card
            variant="outlined"
            sx={{
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                '&:hover': { borderColor: 'primary.main' }
            }}
        >
            <CardContent sx={{ p: 2.5, flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            bgcolor: 'primary.alpha8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <InsertDriveFileOutlinedIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                    </Box>

                    <Tooltip title={isPublic ? 'Make private' : 'Make public'}>
                        <IconButton size="small" onClick={handleToggle} sx={{ color: isPublic ? 'primary.main' : 'text.disabled' }}>
                            {isPublic ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
                        </IconButton>
                    </Tooltip>
                </Box>

                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5, lineHeight: 1.3 }}>
                    {displayTitle}
                </Typography>

                {displaySubtitle && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {displaySubtitle}
                    </Typography>
                )}

                {documentType && (
                    <Chip
                        label={documentType}
                        size="small"
                        sx={{ borderRadius: 1, mb: 1.5, fontSize: 12 }}
                    />
                )}
            </CardContent>

            <Box
                sx={{
                    px: 2.5,
                    pb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AttachFileIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                        {attachmentsCount === 1 ? '1 Attachment' : `${attachmentsCount} Attachments`}
                    </Typography>
                </Box>

                <IconButton size="small" onClick={handleMenuOpen}>
                    <MoreVertIcon fontSize="small" />
                </IconButton>
            </Box>

            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{ sx: { minWidth: 160, borderRadius: 2 } }}
            >
                <MenuItem onClick={handleEdit}>
                    <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Edit document</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleMenuClose}>
                    <ListItemIcon><ShareIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Share document</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleViewPublic}>
                    <ListItemIcon><OpenInNewIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>View public</ListItemText>
                </MenuItem>
            </Menu>
        </Card>
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
