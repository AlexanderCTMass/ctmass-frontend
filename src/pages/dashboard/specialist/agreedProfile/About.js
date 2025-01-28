import {TextField, Typography} from "@mui/material";
import React from "react";

export default function About(props) {
    const {editMode, profile, setProfile} = props;
    return (
        <div>
            <Typography mt={3} color="text.secondary">ABOUT</Typography>
            {editMode ? (
                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={profile.about}
                    onChange={(e) => setProfile({...profile, about: e.target.value})}
                />
            ) : (
                <Typography>{profile.about}</Typography>
            )}
        </div>
    );
}