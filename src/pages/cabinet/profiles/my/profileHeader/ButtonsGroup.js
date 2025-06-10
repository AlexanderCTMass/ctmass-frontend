import {Box} from "@mui/material";
import React from "react";
import {SomeoneProfileButtonsGroup} from "./someoneProfileButtonsGroup";
import {ProfileSettingFeatureToggles} from "src/featureToggles/ProfileSettingFeatureToggles";

export const ButtonsGroup = ({profile, setProfile, isOwnProfile}) => {
    if (!ProfileSettingFeatureToggles.actionsButtons)
        return null;
    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            height: '100%',
            mt: 2.5
        }}>
            {!isOwnProfile && <SomeoneProfileButtonsGroup profile={profile} setProfile={setProfile}/>}
        </Box>
    )
}