import {
    Box,
    FormControlLabel,
    FormGroup,
    Switch,
    TextField,
    Typography,
    IconButton,
    Tooltip,
    Stack, useMediaQuery
} from "@mui/material";
import React, {useEffect, useState} from "react";
import EditIcon from "@untitled-ui/icons-react/build/esm/Pencil01";

import CheckIcon from '@mui/icons-material/Check';

const useToggle = (initialState = false) => {
    const [state, setState] = useState(initialState);
    const toggle = () => setState(!state);
    return [state, toggle];
};
export const SpecialistAvailabilityComponent = ({profile, setProfile}) => {
    const mdUp = useMediaQuery((theme) => theme.breakpoints.up("md"));

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const [editMode, toggleEditMode] = useToggle(false);
    const [isHovered, setIsHovered] = useState(false);

    const calculateBusyStatus = (busyUntil) => {
        if (!busyUntil) return false;
        const busyDate = new Date(busyUntil);
        busyDate.setHours(0, 0, 0, 0);
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        return busyDate >= todayDate;
    };

    const [busyStatus, setBusyStatus] = useState(calculateBusyStatus(profile.profile.busyUntil));

    useEffect(() => {
        setBusyStatus(calculateBusyStatus(profile.profile.busyUntil));
    }, [profile.profile.busyUntil]);

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                mt: 1,
                '&:hover .edit-button': {
                    opacity: 1
                }
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {editMode ? (
                <FormGroup>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={busyStatus}
                                    onChange={(e) => {
                                        const newBusyStatus = e.target.checked;
                                        setProfile(prev => ({
                                            ...prev,
                                            profile: {
                                                ...prev.profile,
                                                busyUntil: newBusyStatus ? today : null
                                            }
                                        }));
                                        setBusyStatus(newBusyStatus);
                                    }}
                                    color={busyStatus ? "error" : "primary"}
                                />
                            }
                            label={
                                <Typography
                                    variant="body2"
                                    color={busyStatus ? "error.main" : "primary"}
                                    fontWeight={600}
                                >
                                    {busyStatus ? "Busy" : "Available"}
                                </Typography>
                            }
                            labelPlacement="bottom"
                            sx={{margin: 0}}
                        />

                        {busyStatus && (
                            <TextField
                                type="date"
                                fullWidth
                                label="Until"
                                InputLabelProps={{shrink: true}}
                                value={profile?.profile?.busyUntil || ''}
                                inputProps={{
                                    min: today
                                }}
                                onChange={(e) => setProfile(prev => ({
                                    ...prev,
                                    profile: {
                                        ...prev.profile,
                                        busyUntil: e.target.value
                                    }
                                }))}
                                sx={{ml: 2, width: 150}}
                            />
                        )}
                    </Box>
                </FormGroup>
            ) : (
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Box
                        sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: busyStatus ? 'error.main' : 'success.main',
                            ml: 0.5
                        }}
                    />
                    <Typography
                        variant="body2"
                        color={busyStatus ? "error.main" : "success.main"}
                        fontWeight={500}
                    >
                        {busyStatus ? `Busy until: ${new Date(profile?.profile?.busyUntil).toLocaleDateString()}` : "Available now"}
                    </Typography>
                </Stack>
            )}

            <Box
                className="edit-button"
                sx={{
                    ml: 2,
                    opacity: isHovered || editMode|| !mdUp  ? 1 : 0,
                    transition: 'opacity 0.2s ease-in-out'
                }}
            >
                <Tooltip title={editMode ? "Save availability" : "Edit availability"}>
                    <IconButton
                        size="small"
                        onClick={toggleEditMode}
                        color={editMode ? "primary" : "default"}
                    >
                        {editMode ? <CheckIcon/> : <EditIcon/>}
                    </IconButton>
                </Tooltip>
            </Box>
        </Box>
    )
}