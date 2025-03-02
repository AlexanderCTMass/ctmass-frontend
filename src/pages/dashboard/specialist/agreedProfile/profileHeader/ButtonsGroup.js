import {Box, Button} from "@mui/material";
import React, {useCallback} from "react";
import {SomeoneProfileButtonsGroup} from "./someoneProfileButtonsGroup";

export const ButtonsGroup = ({profile, setProfile, isOwnProfile, editMode, handleSave, setEditMode}) => {

    const handleEditToggle = useCallback(() => {
        setEditMode(prev => !prev);
    }, []);


    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            height: '100%',
            mt: 2.5
        }}>
            {isOwnProfile ? (
                editMode ? (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSave}
                        sx={{width: 'fit-content'}}
                    >
                        Save
                    </Button>
                ) : (
                    <Button
                        variant="outlined"
                        onClick={handleEditToggle}
                        sx={{width: 'fit-content'}}
                    >
                        Edit Profile
                    </Button>
                )
            ) : (
                <SomeoneProfileButtonsGroup profile={profile} setProfile={setProfile}/>
            )}
        </Box>
    )
}