import {Box, FormControlLabel, FormGroup, Switch, TextField, Typography} from "@mui/material";
import React, {useEffect, useState} from "react";

export const SpecialistAvailabilityComponent = ({profile, setProfile, editMode}) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0]

    const calculateBusyStatus = (busyUntil) => {
        if (!busyUntil) return false;

        const busyDate = new Date(busyUntil);
        busyDate.setHours(0, 0, 0, 0); // Обнуляем время

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Обнуляем время

        return busyDate >= today;
    };

    const [busyStatus, setBusyStatus] = useState(calculateBusyStatus(profile.profile.busyUntil));

    return (<Box sx={{display: 'flex', alignItems: 'center', mt: 1, gap: 2}}>
        {editMode ? (<FormGroup>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                <FormControlLabel
                    control={<Switch
                        checked={busyStatus || false}
                        onChange={(e) => {
                            setProfile(prev => ({
                                ...prev, profile: {
                                    ...prev.profile,
                                    busyUntil: busyStatus ? null : today
                                }
                            }));
                            setBusyStatus(!busyStatus)
                        }}
                        color={busyStatus ? "error" : "primary"}
                    />}
                    label={<Typography
                        variant="body2"
                        color={busyStatus ? "error.main" : "primary"}
                        fontWeight={600}
                    >
                        {busyStatus ? "Busy" : "Available"}
                    </Typography>}
                    labelPlacement="bottom"
                    sx={{margin: 0}}
                />

                {busyStatus && (<TextField
                    type="date"
                    label="Until"
                    InputLabelProps={{shrink: true}}
                    value={profile?.profile?.busyUntil || ''}
                    inputProps={{
                        min: today // Ограничиваем выбор даты только будущими датами
                    }}
                    onChange={(e) => setProfile(prev => ({
                        ...prev, profile: {
                            ...prev.profile, busyUntil: e.target.value
                        }
                    }))}
                    sx={{width: 220, ml: 2}}
                />)}
            </Box>
        </FormGroup>) : (<Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
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
        </Box>)}
    </Box>)
}