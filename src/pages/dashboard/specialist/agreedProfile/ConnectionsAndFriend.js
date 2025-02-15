import React, {useEffect, useState} from 'react';
import {Box, Button, Chip, Dialog, DialogContent, DialogTitle, Grid, IconButton, Link, Typography} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {RouterLink} from "src/components/router-link";
import {SpecialistMiniPreview} from "src/sections/components/specialist/specialist-mini-preview";
import {extendedProfileApi} from "./portfolio/data/extendedProfileApi";

export default function ConnectionsAndFriend({currentUserId}) {
    const [openModal, setOpenModal] = useState(false);
    const [connections, setConnections] = useState(null)
    const [filters, setFilters] = useState([]);

    useEffect(() => {
        async function fetchConnections() {
            const connectionsData = await extendedProfileApi.getFriends(currentUserId);
            setConnections(connectionsData);
        }
        fetchConnections();
    }, [currentUserId]);

    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => setOpenModal(false);

    const filterOptions = ["connection", "friend", "recommendation"];

    const filteredConnections = connections?.filter((friend) => {
        if (filters.length === 0) return true;
        return filters.some((filter) => friend.type.includes(filter));
    });

    const handleFilterClick = (filter) => {
        setFilters((prevFilters) =>
            prevFilters.includes(filter)
                ? prevFilters.filter((f) => f !== filter)
                : [...prevFilters, filter]
        );
    };

    const friendStatus = ["pending", "confirmed"]

    const UserRole = {
        pending: Symbol("pending"),
        confirmed: Symbol("confirmed"),
    };

    return (
        <Box sx={{mt: 4}}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
                CONNECTIONS & FRIENDS
            </Typography>
            {/* Чипсы для фильтрации */}
            <Box sx={{ mb: 2 }}>
                {filterOptions.map((option) => (
                    <Chip
                        key={option}
                        label={option}
                        clickable
                        color={filters.includes(option) ? "primary" : "default"}
                        onClick={() => handleFilterClick(option)}
                        sx={{ mr: 1, mb: 1 }}
                    />
                ))}
            </Box>

            <Grid container spacing={2}>
                {filteredConnections?.slice(0, 3).map((friend, index) => (
                    <Grid item xs={12} sm={6} md={4} key={friend.id}>
                        <Link
                            component={RouterLink}
                            to={friend.link}
                            sx={{textDecoration: 'none', color: 'inherit'}}
                        >
                            <SpecialistMiniPreview
                                specialist={{
                                    ...friend
                                }}/>
                        </Link>
                    </Grid>
                ))}
            </Grid>
            {(!filteredConnections || filteredConnections.length === 0) &&
                <Typography color="secondary" sx={{mt: 2}}>no added friends</Typography>}

            {filteredConnections?.length > 3 && (
                <Box sx={{mt: 2, textAlign: 'center'}}>
                    <Button
                        variant="outlined"
                        onClick={handleOpenModal}
                        sx={{width: {xs: '100%', sm: 'auto'}}}
                    >
                        View All Connections ({filteredConnections.length})
                    </Button>
                </Box>
            )}

            <Dialog
                open={openModal}
                onClose={handleCloseModal}
                fullWidth
                maxWidth="md"
                scroll="paper"
            >
                <DialogTitle sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                }}>
                    <Typography variant="h6">All Connections</Typography>
                    <IconButton onClick={handleCloseModal}>
                        <CloseIcon/>
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers>
                    <Grid container spacing={2}>
                        {filteredConnections?.map((friend, index) => (
                            <Grid item xs={12} sm={6} md={4} key={friend.id}>
                                <Link
                                    component={RouterLink}
                                    to={friend.link}
                                    sx={{textDecoration: 'none', color: 'inherit'}}
                                >
                                    <SpecialistMiniPreview
                                        specialist={{
                                            ...friend
                                        }}/>
                                </Link>
                            </Grid>
                        ))}
                    </Grid>
                </DialogContent>
            </Dialog>
        </Box>
    );
}