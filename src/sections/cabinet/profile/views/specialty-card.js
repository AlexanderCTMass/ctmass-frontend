import React, { useState } from 'react';
import {
    Box,
    Button,
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
    Popover,
    Accordion,
    AccordionSummary,
    Link,
    AccordionDetails
} from '@mui/material';
import DeleteIcon from "@untitled-ui/icons-react/build/esm/Delete";
import AddIcon from "@untitled-ui/icons-react/build/esm/Plus";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { SvgIcon } from "@mui/material";
import { InputAdornment } from "@mui/material";
import pluralize from "pluralize";
import { Delete, Edit } from "@mui/icons-material";
import CheckIcon from "@mui/icons-material/Check";
import { RouterLink } from "src/components/router-link";
import { projectsLocalApi } from "src/api/projects/project-local-storage";
import { ProjectStatus } from "src/enums/project-state";
import { paths } from "src/paths";
import { useNavigate } from "react-router-dom";

const PRICE_TYPES = [
    { value: 'fixed', label: 'Fixed', shortLabel: 'fs' },
    { value: 'hourly', label: 'Per hour', shortLabel: '/h' },
    { value: 'sqm', label: 'Per sq.ft.', shortLabel: '/ft²' },
];

export const SpecialtyServiceCard = ({
    profileId,
    spec,
    services,
    initialServices = [],
    onUpdateServices,
    onRemoveSpecialty,
    editable = true,
    initEdit = false,

    onSave
}) => {
    const [localServices, setLocalServices] = useState(initialServices);
    const [anchorEl, setAnchorEl] = useState(null);
    const [editMode, setEditMode] = useState(initEdit);
    const [expanded, setExpanded] = useState(initEdit); // Добавлено состояние для раскрытия
    const [currentServiceId, setCurrentServiceId] = useState(null);
    const [isHovered, setIsHovered] = useState(false);
    const [showPriceTypeHint, setShowPriceTypeHint] = useState(
        localStorage.getItem('priceTypeHintShown') !== 'false'
    );
    const navigate = useNavigate();

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
        if (newService.service === '' && newService.price === '') return;
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
        return PRICE_TYPES.find(t => t.value === type)?.shortLabel || 'fs';
    };

    const createSearchParamsForProposeProject = (e) => {
        e.preventDefault();
        projectsLocalApi.storeProject({
            state: ProjectStatus.DRAFT,
            specialtyId: spec.id,
            proposerUserId: profileId,
        })
        navigate(paths.request.create);
    }

    return (
        <Accordion
            expanded={expanded}
            onChange={(event, isExpanded) => setExpanded(isExpanded)}
            sx={{
                '&.MuiAccordion-root:before': {
                    display: 'none'
                },
                transition: 'all 0.2s ease',
                '&.Mui-expanded': {
                    margin: '16px 0'
                }
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                    '& .MuiAccordionSummary-content': {
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }
                }}
            >
                <Stack direction={"row"} spacing={2} alignItems="center" justifyContent="space-between">
                    <Stack direction={"column"} spacing={2}>
                        <Box>
                            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                                {spec.category?.label}
                            </Typography>

                            <Typography variant="h6" component="div">
                                {spec.label}
                            </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                            {!localServices || localServices.length === 0 ? "there are no attached services" : localServices.length + " " + pluralize('service', localServices.length)}
                        </Typography>
                    </Stack>
                    {profileId &&
                        <Link
                            component={RouterLink}
                            underline="hover"
                            variant="overline"
                            sx={{ display: isHovered ? 'inline' : 'none', pl: 4 }}
                            onClick={createSearchParamsForProposeProject}
                        >
                            To order
                        </Link>}
                </Stack>
                {editable && (
                    <Box>
                        {editMode ? (
                            <Tooltip title="Save changes">
                                <IconButton
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEditMode(false);
                                        if (onSave) onSave();
                                    }}
                                >
                                    <CheckIcon color="success" fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        ) : (
                            <Tooltip title="Edit specialty" arrow
                                placement="top">
                                <IconButton
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEditMode(true);
                                        setExpanded(true);
                                    }}
                                >
                                    <Edit fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                        {editMode && (
                            <Tooltip title="Delete specialty">
                                <IconButton onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm('Are you sure you want to delete this specialty?')) {
                                        onRemoveSpecialty(spec);
                                    }
                                }}>
                                    <Delete fontSize="small" color="error" />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>
                )}
            </AccordionSummary>

            <AccordionDetails sx={{ pt: 0 }}>
                <Box sx={{ mt: 1 }}>
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
                                <TableCell width="150px" align="right">Price</TableCell>
                                {editMode && <TableCell width="20px" align="right"></TableCell>}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {localServices.map((service, index) => (
                                <TableRow key={service.id} hover
                                    sx={{ '& .MuiTableCell-root': { verticalAlign: 'middle' } }}>
                                    <TableCell>
                                        {editMode ? (
                                            service.isCustom ? (
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
                                                        endAdornment: editMode ? (
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
                                                        ) : null
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
                                                </TextField>)
                                        ) : (
                                            <Typography variant="body2">
                                                {service.isCustom ? service.service : services.byId[service.service]?.label}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell align="right">
                                        {editMode ? (
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
                                                        startAdornment: <InputAdornment
                                                            position="start">$</InputAdornment>,
                                                        endAdornment: (
                                                            <InputAdornment position="end">
                                                                {isHovered ? (
                                                                    <Box sx={{
                                                                        position: 'relative',
                                                                        display: 'inline-block'
                                                                    }}>
                                                                        <Tooltip
                                                                            title="Select the price type"
                                                                            open={showPriceTypeHint && index === 0}
                                                                            disableHoverListener
                                                                            disableFocusListener
                                                                            disableTouchListener
                                                                            arrow
                                                                            placement="top-end"
                                                                            color="primary"
                                                                            slotProps={{
                                                                                popper: {
                                                                                    modifiers: [
                                                                                        {
                                                                                            name: 'offset',
                                                                                            options: {
                                                                                                offset: [0, -10],
                                                                                            },
                                                                                        },
                                                                                    ],
                                                                                },
                                                                            }}
                                                                            componentsProps={{
                                                                                tooltip: {
                                                                                    sx: {
                                                                                        bgcolor: 'primary.main',
                                                                                        color: 'primary.contrastText',
                                                                                        '& .MuiTooltip-arrow': {
                                                                                            color: 'primary.main',
                                                                                        },
                                                                                    },
                                                                                },
                                                                            }}
                                                                        >
                                                                            <Button
                                                                                size="small"
                                                                                onClick={(e) => handlePriceTypeClick(e, service.id)}
                                                                                sx={{
                                                                                    minWidth: 'auto',
                                                                                    padding: '4px 8px',
                                                                                    fontSize: '0.75rem',
                                                                                    textTransform: 'none'
                                                                                }}
                                                                            >
                                                                                {getPriceTypeLabel(service.priceType)}
                                                                            </Button>
                                                                        </Tooltip>
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
                                            </Box>) : (
                                            <Typography variant="body2">
                                                ${service.price} {getPriceTypeLabel(service.priceType)}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    {editMode && (
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
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {editMode && (
                        <>
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
                        </>
                    )}
                </Box>
            </AccordionDetails>
        </Accordion>
    );
};