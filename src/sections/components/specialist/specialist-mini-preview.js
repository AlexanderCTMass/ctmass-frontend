import {Avatar, Box, Grid, Typography} from "@mui/material";
import PropTypes from "prop-types";
import React from "react";

export const SpecialistMiniPreview = (props) => {
    const {specialist} = props;


    return <Grid container spacing={3} alignItems="flex-start">
        {/* Аватар */}
        <Grid item>
            <Avatar sx={{width: 110, height: 130, borderRadius: 2}} variant="square"
                    src={specialist.avatar}/>
        </Grid>

        {/* Информация о профиле */}
        <Grid item xs>
            <Box display="flex" flexDirection="column" alignItems="flex-start">
                {/* Имя и значок сертификации */}
                <Box display="flex" alignItems="flex-start">
                    <Typography fontWeight="bold" variant="h7">
                        {specialist.name}
                    </Typography>
                </Box>
            </Box>
            <Typography variant="h8" color="text.secondary">{specialist.specName}</Typography>

            {/* Рейтинг */}
            <Box display="flex" marginTop="10px" alignItems="center">
                <Box
                    component="img"
                    src="/star.png"
                    alt="Rating"
                    sx={{height: 20, mr: 1}}
                />
                <Typography color="text.secondary" sx={{whiteSpace: "pre-wrap", fontSize: 12}}>
                    {specialist.rating} · {specialist.reviewsCount} reviews
                </Typography>
            </Box>

            {/* Локация */}
            <Box display="flex" marginTop="5px">
                <Box
                    component="img"
                    src="/place.png"
                    alt="Location"
                    sx={{height: 20, mr: 1}}
                />
                <Typography color="text.secondary"
                            sx={{fontSize: 12}}>{specialist.location}</Typography>
            </Box>
        </Grid>
    </Grid>;
}


SpecialistMiniPreview.propTypes = {
    specialist: PropTypes.object.isRequired
};