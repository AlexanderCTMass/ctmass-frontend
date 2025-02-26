import {Box, Button, Tooltip} from "@mui/material";
import {paths} from "../../../../../paths";
import {RouterLink} from "../../../../../components/router-link";
import React, {useCallback} from "react";
import {useNavigate} from "react-router-dom";

export const ButtonsGroup = ({isOwnProfile, editMode, handleSave, setEditMode}) => {
    const handleEditToggle = useCallback(() => {
        setEditMode(prev => !prev);
    }, []);

    const navigate = useNavigate();


    const handleChatClick = () => {
        navigate(`/dashboard/chat/${profile.profile.id}`);
    };

    return(
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
                <Box display="flex" gap={2}>
                    <Button variant="contained">
                        Offer an order
                    </Button>
                    <Tooltip
                        title="A friend request will be sent. Once accepted, this user will appear in your friend list."
                    >
                        <Button variant="contained">
                            Add Friend
                        </Button>
                    </Tooltip>
                    <Button
                        variant="contained"
                        color="inherit"
                        href={paths.dashboard.chat.replace(":userId", `${profile.profile.id}`)}
                        component={RouterLink}
                        sx={{
                            color: "white",
                            '&:hover': {
                                backgroundColor: 'grey.600'
                            }
                        }}
                        // onClick={handleChatClick}
                    >
                        Chat
                    </Button>
                </Box>
            )}
        </Box>
    )
}