import {Avatar, Box, Button, Grid, TextField, Typography} from "@mui/material";
import React from "react";
import CertifiedBadge from "./CertifiedBadge";

export default function ProfileHeader(props) {
    const {isOwnProfile, profile, editMode, handleEditToggle, handleSave, setProfile} = props;

    return (
        <Grid container spacing={3} alignItems="flex-start">
            {/* Аватар */}
            <Grid item>
                <Avatar sx={{width: 150, height: 160, borderRadius: 2}} variant="square" src={profile.avatar}/>
            </Grid>

            {/* Информация о профиле */}
            <Grid item xs>
                {editMode ? (
                    <TextField
                        fullWidth
                        label="Name"
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                    />
                ) : (
                    <Box display="flex" flexDirection="column" alignItems="flex-start">
                        {/* Имя и значок сертификации */}
                        <Box display="flex" alignItems="flex-start">
                            <Typography fontWeight="bold" variant="h4">
                                {profile.name}
                            </Typography>
                            {profile.isCertified && <Box paddingLeft="50px"><CertifiedBadge/></Box>}
                        </Box>
                    </Box>
                )}

                {/* Рейтинг */}
                <Box display="flex" marginTop="10px" alignItems="center">
                    <Box
                        component="img"
                        src="/star.png"
                        alt="Rating"
                        sx={{height: 20, mr: 1}}
                    />
                    <Typography color="text.secondary" sx={{whiteSpace: 'pre-wrap'}}>
                        {profile.rating} · {profile.reviewsCount} reviews
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
                    <Typography color="text.secondary">{profile.location}</Typography>
                </Box>

                {/* Контейнер для кнопок с прижатием к низу */}
                <Box display="flex" flexDirection="column" sx={{height: '100%', justifyContent: 'flex-end'}}>
                    {isOwnProfile ? (
                        <Grid item style={{marginTop: "17px"}}>
                            {editMode ? (
                                <Button variant="contained" color="primary" onClick={handleSave}>
                                    Save
                                </Button>
                            ) : (
                                <Button variant="outlined" onClick={handleEditToggle}>
                                    Edit Profile
                                </Button>
                            )}
                        </Grid>) :
                        (
                            <div style={{
                                marginTop: "17px"
                            }}>
                                <Button variant="contained">
                                    Offer an order
                                </Button>

                                <Button variant="contained" color="inherit" sx={{ml: "20px", color: "white"}}>
                                    Chat
                                </Button>
                            </div>
                        )
                    }
                </Box>
            </Grid>
        </Grid>
    );
}