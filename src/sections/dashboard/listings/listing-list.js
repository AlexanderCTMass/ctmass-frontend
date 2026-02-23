import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    Box,
    Card,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TablePagination,
    IconButton,
    Chip,
    Avatar,
    Stack,
    Typography,
    Tooltip,
    Badge,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    alpha,
    useTheme
} from '@mui/material';
import {
    MoreVert as MoreVertIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    Share as ShareIcon,
    Archive as ArchiveIcon,
    CheckCircle as ActiveIcon,
    Drafts as DraftIcon,
    AttachMoney as MoneyIcon,
    Favorite as FavoriteIcon,
    Visibility as ViewIcon,
    Inventory as InventoryIcon,
    ContentCopy as CopyIcon
} from '@mui/icons-material';
import {format} from 'date-fns';
import {LISTING_STATUS} from 'src/service/listing-service';
import {HtmlContent} from "src/components/html-content";
import ExpandableText from "src/components/expandable-text";

const statusConfig = {
    [LISTING_STATUS.ACTIVE]: {color: 'success', icon: ActiveIcon, label: 'Active'},
    [LISTING_STATUS.DRAFT]: {color: 'default', icon: DraftIcon, label: 'Draft'},
    [LISTING_STATUS.SOLD]: {color: 'info', icon: ArchiveIcon, label: 'Sold'},
    [LISTING_STATUS.ARCHIVED]: {color: 'warning', icon: ArchiveIcon, label: 'Archived'},
    [LISTING_STATUS.EXPIRED]: {color: 'error', icon: ArchiveIcon, label: 'Expired'}
};

const ListingRow = ({listing, onEdit, onDelete, onView, onArchive, onDuplicate}) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);

    const StatusIcon = statusConfig[listing.status]?.icon || DraftIcon;
    const statusColor = statusConfig[listing.status]?.color || 'default';

    const createdDate = listing.createdAt
        ? format(new Date(listing.createdAt), 'MMM d, yyyy')
        : '';

    const handleMenuOpen = (event) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleAction = (action) => {
        handleMenuClose();
        switch (action) {
            case 'edit':
                onEdit(listing.id);
                break;
            case 'delete':
                onDelete(listing.id);
                break;
            case 'view':
                onView(listing.id);
                break;
            case 'archive':
                onArchive(listing.id);
                break;
            case 'duplicate':
                onDuplicate(listing.id);
                break;
        }
    };

    const firstImage = listing.images?.[0];

    return (
        <TableRow
            hover
            sx={{
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.04)
                }
            }}
            onClick={() => onView(listing.id)}
        >
            <TableCell padding="checkbox">
                <Avatar
                    src={firstImage}
                    variant="rounded"
                    sx={{
                        width: 48,
                        height: 48,
                        bgcolor: 'grey.100'
                    }}
                >
                    {!firstImage && <InventoryIcon/>}
                </Avatar>
            </TableCell>

            <TableCell>
                <Stack spacing={0.5}>
                    <Typography variant="subtitle2" noWrap sx={{maxWidth: 300}}>
                        {listing.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap sx={{maxWidth: 300}}>
                        <ExpandableText html={listing.description} expandEnable={false}/>
                    </Typography>
                </Stack>
            </TableCell>

            <TableCell>
                <Chip
                    size="small"
                    icon={<StatusIcon sx={{fontSize: 14}}/>}
                    label={statusConfig[listing.status]?.label || 'Draft'}
                    color={statusColor}
                    variant="outlined"
                />
            </TableCell>

            <TableCell>
                <Typography variant="body2">
                    {listing.category}
                </Typography>
            </TableCell>

            <TableCell align="right">
                <Typography variant="subtitle2" color="primary.main">
                    ${listing.price?.toLocaleString()}
                </Typography>
                {listing.priceType === 'negotiable' && (
                    <Typography variant="caption" color="text.secondary">
                        negotiable
                    </Typography>
                )}
            </TableCell>

            <TableCell align="center">
                <Tooltip title={`${listing.views || 0} views`} arrow>
                    <Badge badgeContent={listing.views || 0} color="primary" max={999} showZero>
                        <ViewIcon fontSize="small" color="action"/>
                    </Badge>
                </Tooltip>
            </TableCell>

            <TableCell align="center">
                <Tooltip title={`${listing.likes || 0} likes`} arrow>
                    <Badge badgeContent={listing.likes || 0} color="error" max={999} showZero>
                        <FavoriteIcon fontSize="small" color="action"/>
                    </Badge>
                </Tooltip>
            </TableCell>

            <TableCell>
                <Typography variant="body2">
                    {createdDate}
                </Typography>
            </TableCell>

            <TableCell align="right">
                <IconButton
                    size="small"
                    onClick={handleMenuOpen}
                >
                    <MoreVertIcon/>
                </IconButton>

                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    onClick={(e) => e.stopPropagation()}
                >
                    <MenuItem onClick={() => handleAction('view')}>
                        <ListItemIcon>
                            <VisibilityIcon fontSize="small"/>
                        </ListItemIcon>
                        <ListItemText>View</ListItemText>
                    </MenuItem>

                    <MenuItem onClick={() => handleAction('edit')}>
                        <ListItemIcon>
                            <EditIcon fontSize="small"/>
                        </ListItemIcon>
                        <ListItemText>Edit</ListItemText>
                    </MenuItem>

                    {listing.status === LISTING_STATUS.ACTIVE && (
                        <MenuItem onClick={() => handleAction('archive')}>
                            <ListItemIcon>
                                <ArchiveIcon fontSize="small"/>
                            </ListItemIcon>
                            <ListItemText>Mark as Sold</ListItemText>
                        </MenuItem>
                    )}

                    <MenuItem onClick={() => handleAction('duplicate')}>
                        <ListItemIcon>
                            <CopyIcon fontSize="small"/>
                        </ListItemIcon>
                        <ListItemText>Duplicate</ListItemText>
                    </MenuItem>

                    <MenuItem onClick={() => handleAction('delete')} sx={{color: 'error.main'}}>
                        <ListItemIcon>
                            <DeleteIcon fontSize="small" color="error"/>
                        </ListItemIcon>
                        <ListItemText>Delete</ListItemText>
                    </MenuItem>
                </Menu>
            </TableCell>
        </TableRow>
    );
};

export const ListingList = ({
                                listings,
                                total,
                                page,
                                rowsPerPage,
                                onPageChange,
                                onRowsPerPageChange,
                                onEdit,
                                onDelete,
                                onView,
                                onArchive,
                                onDuplicate,
                                loading,
                                emptyMessage = "No listings found"
                            }) => {
    return (
        <Card>
            <Box sx={{overflowX: 'auto'}}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox"></TableCell>
                            <TableCell>Title</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell align="right">Price</TableCell>
                            <TableCell align="center">Views</TableCell>
                            <TableCell align="center">Likes</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {listings.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center" sx={{py: 8}}>
                                    <Stack spacing={2} alignItems="center">
                                        <Typography variant="h6" color="text.secondary">
                                            {emptyMessage}
                                        </Typography>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ) : (
                            listings.map((listing) => (
                                <ListingRow
                                    key={listing.id}
                                    listing={listing}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    onView={onView}
                                    onArchive={onArchive}
                                    onDuplicate={onDuplicate}
                                />
                            ))
                        )}
                    </TableBody>
                </Table>
            </Box>

            <TablePagination
                component="div"
                count={total}
                page={page}
                onPageChange={onPageChange}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={onRowsPerPageChange}
                rowsPerPageOptions={[5, 10, 25, 50]}
            />
        </Card>
    );
};