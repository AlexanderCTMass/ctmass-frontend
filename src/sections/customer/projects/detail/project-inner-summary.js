import PropTypes from 'prop-types';
import {Avatar, Card, CardContent, Divider, Stack, Typography, useMediaQuery, Box} from '@mui/material';
import {PropertyList} from 'src/components/property-list';
import {PropertyListItem} from 'src/components/property-list-item';
import {getInitials} from 'src/utils/get-initials';
import {formatDateRange} from "src/utils/date-locale";
import {format} from "date-fns";
import * as React from "react";

export const ProjectInnerSummary = (props) => {
    const {project, ...other} = props;
    const smUp = useMediaQuery((theme) => theme.breakpoints.up('sm')); // Проверка на ширину экрана

    // Контент карточки
    const cardContent = (
        <>
            <Typography
                color="text.secondary"
                component="p"
                sx={{mb: 2}}
                variant="overline"
            >
                More Details
            </Typography>
            <PropertyList>
                <PropertyListItem
                    align="vertical"
                    label="Id"
                    sx={{
                        px: 0,
                        py: 1
                    }}
                    value={"#" + project.id}
                />
                <PropertyListItem
                    align="vertical"
                    label="Created At"
                    sx={{
                        px: 0,
                        py: 1
                    }}
                    value={format(project.createdAt.toDate(), 'dd/MM/yyyy | HH:mm')}
                />
            </PropertyList>
        </>
    );

    return (
        <>
            {smUp ? ( // Если экран больше или равен sm, рендерим карточку
                <Card {...other}>
                    <CardContent>
                        {cardContent}
                    </CardContent>
                </Card>
            ) : ( // Если экран меньше sm, рендерим контент без карточки
                <><Divider sx={{my: 2}}/>
                    <Box sx={{p: 0}}> {/* Добавляем отступы для лучшего визуального восприятия */}
                        {cardContent}
                    </Box></>
            )}
        </>
    );
};

ProjectInnerSummary.propTypes = {
    project: PropTypes.object.isRequired
};