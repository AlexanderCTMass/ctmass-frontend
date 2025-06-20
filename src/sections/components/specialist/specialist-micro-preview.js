import { Avatar, Box, Grid, Typography } from "@mui/material";
import PropTypes from "prop-types";
import React from "react";
import { Link } from "react-router-dom"; // Или другой роутер, который вы используете

export const SpecialistMicroPreview = (props) => {
    const { specialist, to } = props; // Добавляем пропс `to` для ссылки

    const formatAddress = (address) => {
        if (!address || Object.keys(address).length === 0) {
            return 'Address not specified';
        }

        const parts = [];
        if (address?.zipCode) parts.push(address.zipCode);
        if (address?.location?.place_name) parts.push(address.location.place_name);

        return parts.length > 0 ? parts.join(', ') : 'Address not specified';
    };

    return (
        <Grid
            container
            spacing={1}
            alignItems="flex-start"
            component={Link} // Делаем весь компонент кликабельной ссылкой
            to={to} // URL для перехода
            sx={{
                textDecoration: 'none', // Убираем подчеркивание
                color: 'inherit', // Наследуем цвет текста
                '&:hover': {
                    backgroundColor: 'action.hover', // Цвет ховера из темы
                    borderRadius: 1, // Скругление углов
                    cursor: 'pointer', // Меняем курсор
                    boxShadow: 1, // Легкая тень при ховере
                },
                transition: 'all 0.2s ease-in-out', // Плавные переходы
                pb: 1, // Добавляем отступы для лучшего ховера
                // mb: 1, // Отступ снизу
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
                    {/* Имя и значок сертификации */}
                    <Box display="flex" alignItems="flex-start">
                        <Typography fontWeight="bold" variant="subtitle2">
                            {specialist.name}
                        </Typography>
                    </Box>
                </Box>
                <Typography variant="caption" color="text.secondary">
                    {specialist.specName}
                </Typography>

                {/* Рейтинг */}
                <Box display="flex" marginTop="10px" alignItems="center">
                    <Box
                        component="img"
                        src="/star.png"
                        alt="Rating"
                        sx={{ height: 20, mr: 1 }}
                    />
                    <Typography color="text.secondary" sx={{ whiteSpace: "pre-wrap", fontSize: 12 }}>
                        {specialist.reviewCount ? `${specialist.rating?.toFixed(1)} · ${specialist.reviewCount} reviews` : "No ratings yet"}
                    </Typography>
                </Box>
            </Grid>
        </Grid>
    );
};

SpecialistMicroPreview.propTypes = {
    specialist: PropTypes.object.isRequired,
    to: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object
    ]).isRequired
};

SpecialistMicroPreview.defaultProps = {
    to: "#" // Значение по умолчанию, если ссылка не передана
};