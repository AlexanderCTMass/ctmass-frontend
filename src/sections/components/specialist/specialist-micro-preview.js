import { Avatar, Box, Grid, Typography, Chip } from "@mui/material";
import PropTypes from "prop-types";
import React from "react";
import { Link } from "react-router-dom";
import FmdGoodIcon from '@mui/icons-material/FmdGood';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

export const SpecialistMicroPreview = (props) => {
    const { specialist, to } = props;

    const formatAddress = (address) => {
        if (!address || Object.keys(address).length === 0) {
            return 'Location not specified';
        }

        // Форматируем локацию в формате "City, State"
        if (address?.location?.place_name) {
            const placeParts = address.location.place_name.split(', ');
            if (placeParts.length >= 2) {
                return `${placeParts[0]}, ${placeParts[1].split(' ')[0]}`; // Берём город и штат
            }
            return address.location.place_name;
        }

        return 'Location not specified';
    };

    return (
        <Grid
            container
            spacing={1}
            alignItems="flex-start"
            component={Link}
            to={to}
            sx={{
                textDecoration: 'none',
                color: 'inherit',
                '&:hover': {
                    backgroundColor: 'action.hover',
                    borderRadius: 1,
                    cursor: 'pointer',
                    boxShadow: 1,
                },
                transition: 'all 0.2s ease-in-out',
                pb: 1,
                pt: 0.5,
            }}
        >
            {/* Аватар */}
            <Grid item>
                <Avatar
                    sx={{
                        width: 50,
                        height: 60,
                        borderRadius: 1,
                        transition: 'transform 0.2s ease-in-out',
                        '&:hover': {
                            transform: 'scale(1.05)'
                        }
                    }}
                    variant="square"
                    src={specialist.avatar}
                />
            </Grid>

            {/* Информация о профиле */}
            <Grid item xs>
                <Box display="flex" flexDirection="column" alignItems="flex-start">
                    {/* Имя и статус доступности */}
                    <Box display="flex" alignItems="center" width="100%">
                        <Typography fontWeight="bold" variant="subtitle2" sx={{ mr: 1 }}>
                            {specialist.name}
                        </Typography>
                        <Chip
                            label={specialist.busyUntil ? 'Available' : 'Not available'}
                            size="small"
                            color={specialist.busyUntil ? 'success' : 'error'}
                            sx={{
                                height: 18,
                                fontSize: '0.65rem',
                                '& .MuiChip-label': { px: 0.5 }
                            }}
                        />
                    </Box>

                    {/* Основная специализация */}
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.2 }}>
                        {specialist.specialties?.length > 0
                            ? specialist.specialties
                                .filter(spec => spec)
                                .slice(0, 3)
                                .map(spec => spec.label)
                                .join(', ')
                            + (specialist.specialties.length > 3 ? '...' : '')
                            : 'Specialist'}
                    </Typography>
                </Box>

                {/* Детали: рейтинг, ставка, локация */}
                <Box display="flex" flexDirection="column" sx={{ mt: 0.5 }}>
                    {/* Рейтинг и количество отзывов */}
                    <Box display="flex" alignItems="center">
                        <Box
                            component="img"
                            src="/star.png"
                            alt="Rating"
                            sx={{ height: 16, mr: 0.5 }}
                        />
                        <Typography color="text.secondary" sx={{ fontSize: 12, mr: 1 }}>
                            {specialist.reviewCount ? `${specialist.rating?.toFixed(1)} (${specialist.reviewCount})` : "No ratings"}
                        </Typography>

                        {/* Почасовая ставка */}
                        {specialist.hourlyRate && (
                            <Box display="flex" alignItems="center" sx={{ ml: 'auto' }}>
                                <AttachMoneyIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                <Typography color="text.secondary" sx={{ fontSize: 12 }}>
                                    {specialist.hourlyRate}/hr
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    {/* Локация и время ответа */}
                    <Box display="flex" alignItems="center" sx={{ mt: 0.5 }}>
                        <FmdGoodIcon sx={{ fontSize: 14, color: 'text.secondary', mr: 0.5 }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12 }}>
                            {formatAddress(specialist.address)}
                        </Typography>

                        {specialist.responseTime && (
                            <Box display="flex" alignItems="center" sx={{ ml: 1 }}>
                                <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary', mr: 0.5 }} />
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12 }}>
                                    {specialist.responseTime}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Grid>
        </Grid>
    );
};

SpecialistMicroPreview.propTypes = {
    specialist: PropTypes.shape({
        name: PropTypes.string.isRequired,
        avatar: PropTypes.string,
        specName: PropTypes.string,
        specialty: PropTypes.string,
        rating: PropTypes.number,
        reviewCount: PropTypes.number,
        available: PropTypes.bool,
        hourlyRate: PropTypes.number,
        responseTime: PropTypes.string,
        address: PropTypes.shape({
            zipCode: PropTypes.string,
            location: PropTypes.shape({
                place_name: PropTypes.string
            })
        })
    }).isRequired,
    to: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object
    ]).isRequired
};

SpecialistMicroPreview.defaultProps = {
    to: "#"
};