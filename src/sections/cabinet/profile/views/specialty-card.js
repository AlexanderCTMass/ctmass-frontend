import React, { useState } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    IconButton,
    MenuItem,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
    Popover
} from '@mui/material';
import DeleteIcon from "@untitled-ui/icons-react/build/esm/Delete";
import AddIcon from "@untitled-ui/icons-react/build/esm/Plus";
import ArchiveIcon from "@untitled-ui/icons-react/build/esm/Archive";
import { SvgIcon } from "@mui/material";
import { InputAdornment } from "@mui/material";

const PRICE_TYPES = [
  { value: 'fixed', label: 'Fixed', shortLabel: 'fs' },
  { value: 'hourly', label: 'Per hour', shortLabel: '/h' },
  { value: 'sqm', label: 'Per sq.m.', shortLabel: '/m²' },
];

export const SpecialtyServiceCard = ({
    spec,
    services,
    initialServices = [],
    onUpdateServices,
    onRemoveSpecialty
}) => {
    const [localServices, setLocalServices] = useState(initialServices);
    const [anchorEl, setAnchorEl] = useState(null);
    const [currentServiceId, setCurrentServiceId] = useState(null);
    const [isHovered, setIsHovered] = useState(false);
    const [showPriceTypeHint, setShowPriceTypeHint] = useState(
        localStorage.getItem('priceTypeHintShown') !== 'false'
    );

    const handleAddService = () => {
        const newService = {
            id: Date.now().toString(),
            service: '',
            price: '',
            priceType: 'fixed',
            specialtyId: spec.id,
            isCustom: false
        };
        const updatedServices = [...localServices, newService];
        setLocalServices(updatedServices);
        onUpdateServices(spec.id, updatedServices);
    };

    const handleRemoveService = (serviceId) => {
        const updatedServices = localServices.filter(s => s.id !== serviceId);
        setLocalServices(updatedServices);
        onUpdateServices(spec.id, updatedServices);
    };

    const handleServiceChange = (serviceId, field, value) => {
        const updatedServices = localServices.map(service =>
            service.id === serviceId ? { ...service, [field]: value } : service
        );
        setLocalServices(updatedServices);
        onUpdateServices(spec.id, updatedServices);
    };

    const handleServiceTypeChange = (serviceId, value) => {
        if (value === 'custom') {
            const updatedServices = localServices.map(service =>
                service.id === serviceId ? {
                    ...service,
                    service: '',
                    isCustom: true
                } : service
            );
            setLocalServices(updatedServices);
            onUpdateServices(spec.id, updatedServices);
        } else {
            const updatedServices = localServices.map(service =>
                service.id === serviceId ? {
                    ...service,
                    service: value,
                    isCustom: false
                } : service
            );
            setLocalServices(updatedServices);
            onUpdateServices(spec.id, updatedServices);
        }
    };

    const handlePriceTypeClick = (event, serviceId) => {
        setCurrentServiceId(serviceId);
        setAnchorEl(event.currentTarget);
        setShowPriceTypeHint(false);
        localStorage.setItem('priceTypeHintShown', 'false');

    };

    const handlePriceTypeClose = () => {
        setAnchorEl(null);
    };

    const handlePriceTypeSelect = (type) => {
        handleServiceChange(currentServiceId, 'priceType', type);
        handlePriceTypeClose();
    };

    const getPriceTypeLabel = (type) => {
        return PRICE_TYPES.find(t => t.value === type)?.shortLabel || '';
    };

    return (
        <Card
            sx={{ ':hover': { boxShadow: (theme) => `${theme.palette.primary.main} 0 0 5px` } }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                            {spec.category?.label}
                        </Typography>
                        <Typography variant="h5" component="div">
                            {spec.label}
                        </Typography>
                    </Box>
                    <Box>
                        <Tooltip title="Delete specialty">
                            <IconButton color="error" onClick={() => onRemoveSpecialty(spec)}>
                                <SvgIcon>
                                    <ArchiveIcon />
                                </SvgIcon>
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Stack>

                <Box sx={{ mt: 2 }}>
                    <Table size="small" sx={{
                        '& .MuiTableCell-root': {
                            padding: '8px',
                            borderBottom: 'none'
                        },
                        '& .MuiTableRow-root': {
                            '&:last-child td': {
                                borderBottom: 'none'
                            }
                        }
                    }}>
                        <TableHead>
                            <TableRow>
                                <TableCell width="340px">Service</TableCell>
                                <TableCell width="140px" align="center">Price</TableCell>
                                <TableCell width="20px" align="right"></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {localServices.map((service) => (
                                <TableRow key={service.id} hover>
                                    <TableCell>
                                        {service.isCustom ? (
                                            <TextField
                                                fullWidth
                                                size="small"
                                                variant="outlined"
                                                margin="none"
                                                value={service.service}
                                                onChange={(e) => handleServiceChange(service.id, 'service', e.target.value)}
                                                onBlur={() => {
                                                    if (!service.service) {
                                                        handleRemoveService(service.id);
                                                    }
                                                }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        height: '32px'
                                                    }
                                                }}
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleRemoveService(service.id)}
                                                            >
                                                                <Tooltip title="Delete service">
                                                                    <SvgIcon fontSize="small">
                                                                        <DeleteIcon />
                                                                    </SvgIcon>
                                                                </Tooltip>
                                                            </IconButton>
                                                        </InputAdornment>
                                                    )
                                                }}
                                            />
                                        ) : (
                                            <TextField
                                                select
                                                fullWidth
                                                size="small"
                                                variant="outlined"
                                                margin="none"
                                                value={service.service}
                                                onChange={(e) => handleServiceTypeChange(service.id, e.target.value)}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        height: '32px'
                                                    }
                                                }}
                                            >
                                                {services.allIds
                                                    .filter(id => {
                                                        const isSameSpecialty = services.byId[id].parent === spec.id;
                                                        const isAlreadyAdded = localServices.some(s => s.service === id && s.id !== service.id);
                                                        return isSameSpecialty && !isAlreadyAdded;
                                                    })
                                                    .map((id) => (
                                                        <MenuItem key={id} value={id} dense>
                                                            {services.byId[id].label}
                                                        </MenuItem>
                                                    ))}
                                                <MenuItem value="custom" dense>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <AddIcon fontSize="small" sx={{ mr: 1 }} />
                                                        Add custom service
                                                    </Box>
                                                </MenuItem>
                                                {services.allIds
                                                        .filter(id => services.byId[id].parent === spec.id)
                                                        .length > 0 &&
                                                    localServices.length >= services.allIds
                                                        .filter(id => services.byId[id].parent === spec.id)
                                                        .length && (
                                                        <MenuItem disabled>
                                                            All available services for this specialty
                                                            have been added
                                                        </MenuItem>
                                                    )}
                                            </TextField>
                                        )}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <TextField
                                                type="number"
                                                size="small"
                                                variant="outlined"
                                                margin="none"
                                                value={service.price}
                                                onChange={(e) => handleServiceChange(service.id, 'price', Number(e.target.value))}
                                                InputProps={{
                                                    inputProps: {
                                                        min: 0,
                                                        style: {
                                                            '-moz-appearance': 'textfield',
                                                            '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                                                                '-webkit-appearance': 'none',
                                                                margin: 0,
                                                            },
                                                        },
                                                    },
                                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            {isHovered ? (
                                                                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                                                                    {showPriceTypeHint && (
                                                                        <Box
                                                                            sx={{
                                                                                position: 'absolute',
                                                                                top: -40,
                                                                                right: -6,
                                                                                bgcolor: 'primary.main',
                                                                                color: 'primary.contrastText',
                                                                                p: 1,
                                                                                borderRadius: 1,
                                                                                fontSize: '0.75rem',
                                                                                zIndex: 1,
                                                                                '&:after': {
                                                                                    content: '""',
                                                                                    position: 'absolute',
                                                                                    bottom: -8,
                                                                                    right: 12,
                                                                                    width: 0,
                                                                                    height: 0,
                                                                                    borderLeft: '8px solid transparent',
                                                                                    borderRight: '8px solid transparent',
                                                                                    borderTop: '8px solid',
                                                                                    borderTopColor: 'primary.main'
                                                                                },
                                                                                animation: 'fadeIn 1s ease-in-out',
                                                                                '@keyframes fadeIn': {
                                                                                    '0%': { opacity: 0, transform: 'translateY(10px)' },
                                                                                    '100%': { opacity: 1, transform: 'translateY(0)' }
                                                                                }
                                                                            }}
                                                                        >
                                                                            Select the price type
                                                                        </Box>
                                                                    )}
                                                                    <Button
                                                                        size="small"
                                                                        onClick={(e) => handlePriceTypeClick(e, service.id)}
                                                                        sx={{
                                                                            minWidth: 'auto',
                                                                            padding: '4px 6px',
                                                                            fontSize: '0.75rem',
                                                                            textTransform: 'none'
                                                                        }}
                                                                    >
                                                                        {getPriceTypeLabel(service.priceType)}
                                                                    </Button>
                                                                </Box>
                                                            ) : (
                                                                <Typography variant="caption" sx={{ px: 1 }}>
                                                                    {getPriceTypeLabel(service.priceType)}
                                                                </Typography>
                                                            )}
                                                        </InputAdornment>
                                                    ),
                                                    sx: {
                                                        width: '100%',
                                                        height: '32px',
                                                        '& input[type=number]': {
                                                            '-moz-appearance': 'textfield',
                                                        },
                                                        '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
                                                            '-webkit-appearance': 'none',
                                                            margin: 0,
                                                        },
                                                    }
                                                }}
                                                sx={{
                                                    maxWidth: '130px',
                                                    '& .MuiOutlinedInput-input': {
                                                        '-moz-appearance': 'textfield',
                                                        '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                                                            '-webkit-appearance': 'none',
                                                            margin: 0,
                                                        },
                                                    }
                                                }}
                                            />
                                        </Box>
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => handleRemoveService(service.id)}
                                            sx={{ padding: '4px' }}
                                        >
                                            <SvgIcon fontSize="small">
                                                <DeleteIcon />
                                            </SvgIcon>
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <Popover
                        open={Boolean(anchorEl)}
                        anchorEl={anchorEl}
                        onClose={handlePriceTypeClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                    >
                        <Box sx={{ p: 1 }}>
                            {PRICE_TYPES.map((type) => (
                                <MenuItem
                                    key={type.value}
                                    selected={localServices.find(s => s.id === currentServiceId)?.priceType === type.value}
                                    onClick={() => handlePriceTypeSelect(type.value)}
                                    dense
                                >
                                    {type.label}
                                </MenuItem>
                            ))}
                        </Box>
                    </Popover>

                    <Button
                        startIcon={<AddIcon />}
                        onClick={handleAddService}
                        sx={{ mt: 1 }}
                        size="small"
                    >
                        Add Service
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};