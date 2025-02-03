import React, { useState } from 'react';
import {
    Avatar,
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    Link,
    Typography
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { RouterLink } from "src/components/router-link";
import { paths } from "src/paths";
import { SpecialistMiniPreview } from "src/sections/components/specialist/specialist-mini-preview";

export default function ConnectionsAndFriend({ friends }) {
    const [openModal, setOpenModal] = useState(false);
    const visibleFriends = friends?.slice(0, 3);

    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => setOpenModal(false);

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
                CONNECTIONS & FRIENDS
            </Typography>

            <Grid container spacing={2}>
                {visibleFriends?.map((friend, index) => (
                    <Grid item xs={12} sm={6} md={4} key={friend.id}>
                        <Link
                            component={RouterLink}
                            href={friend.link || paths.specialists.index}
                            sx={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            <SpecialistMiniPreview
                                specialist={{...friend, avatar: "https://robohash.org/user" + index + ".png?set=set2"}}/>
                        </Link>
                    </Grid>
                ))}
            </Grid>
            {(!friends || friends.length===0) && <Typography color="secondary" sx={{mt:2}}>no added friends</Typography>}

            {friends?.length > 3 && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Button
                        variant="outlined"
                        onClick={handleOpenModal}
                        sx={{ width: { xs: '100%', sm: 'auto' } }}
                    >
                        View All Connections ({friends.length})
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
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers>
                    <Grid container spacing={2}>
                        {friends?.map((friend, index) => (
                            <Grid item xs={12} sm={6} md={4} key={friend.id}>
                                <Link
                                    component={RouterLink}
                                    href={friend.link || paths.specialists.index}
                                    sx={{ textDecoration: 'none', color: 'inherit' }}
                                >
                                    <SpecialistMiniPreview
                                        specialist={{...friend, avatar: "https://robohash.org/user" + index + ".png?set=set2"}}/>
                                </Link>
                            </Grid>
                        ))}
                    </Grid>
                </DialogContent>
            </Dialog>
        </Box>
    );
}