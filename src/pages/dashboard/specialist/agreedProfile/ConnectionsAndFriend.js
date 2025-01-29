import {Avatar, Box, Grid, Link, Typography} from "@mui/material";
import React from "react";
import {RouterLink} from "src/components/router-link";
import {paths} from "src/paths";
import {SpecialistMiniPreview} from "src/sections/components/specialist/specialist-mini-preview";


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
                        sx={{display: "contents", color: "inherit"}}
                    >
                        <SpecialistMiniPreview specialist={friend}/>
                    </Link>
                ))
                }
            </Box>
        </div>
    );
}