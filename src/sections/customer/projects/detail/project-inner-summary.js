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
                    value={format(project.createdAt.toDate(), 'MM/dd/yyyy | HH:mm')}
                />
            </PropertyList>
        </>
    );

    return (
        <>
            <Card {...other}>
                    <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                        {cardContent}
                    </CardContent>
                </Card>
        </>
    );
};

ProjectInnerSummary.propTypes = {
    project: PropTypes.object.isRequired
};