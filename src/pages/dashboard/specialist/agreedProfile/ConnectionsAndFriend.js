import {Avatar, Box, Grid, Link, Typography} from "@mui/material";
import React from "react";
import {RouterLink} from "src/components/router-link";
import {paths} from "src/paths";

export default function ConnectionsAndFriend(props) {
    const {friends} = props;

    return (
        <div>
            <Typography color="text.secondary" mt={4}>CONNECTIONS & FRIENDS</Typography>
            <Box sx={{mt: 1}} display="flex">
                {friends.map((friend, index) => (
                    <Link
                        component={RouterLink}
                        href={friend.link}
                        sx={{display: "contents", color:"inherit"}}
                    >
                        <Grid container spacing={3} alignItems="flex-start">
                            {/* Аватар */}
                            <Grid item>
                                <Avatar sx={{width: 110, height: 130, borderRadius: 2}} variant="square"
                                        src={friend.avatar}/>
                            </Grid>

                            {/* Информация о профиле */}
                            <Grid item xs>
                                <Box display="flex" flexDirection="column" alignItems="flex-start">
                                    {/* Имя и значок сертификации */}
                                    <Box display="flex" alignItems="flex-start">
                                        <Typography fontWeight="bold" variant="h7">
                                            {friend.name}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Typography variant="h8" color="text.secondary">{friend.specName}</Typography>

                                {/* Рейтинг */}
                                <Box display="flex" marginTop="10px" alignItems="center">
                                    <Box
                                        component="img"
                                        src="/star.png"
                                        alt="Rating"
                                        sx={{height: 20, mr: 1}}
                                    />
                                    <Typography color="text.secondary" sx={{whiteSpace: 'pre-wrap', fontSize: 12}}>
                                        {friend.rating} · {friend.reviewsCount} reviews
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
                                                sx={{fontSize: 12}}>{friend.location}</Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Link>
                ))
                }</Box>
        </div>
    );
}