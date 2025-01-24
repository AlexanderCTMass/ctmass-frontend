import {List, ListItem, ListItemButton, ListItemText} from "@mui/material";
import React from "react";

const ProfileBookmarksContainer = () => {
    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    return (
        <List sx={{ position: "sticky", top: 16 }}>
            <ListItem disablePadding>
                <ListItemButton onClick={() => scrollToSection("about")}>
                    <ListItemText primary="About Myself" />
                </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
                <ListItemButton onClick={() => scrollToSection("education")}>
                    <ListItemText primary="Education" />
                </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
                <ListItemButton onClick={() => scrollToSection("certificates")}>
                    <ListItemText primary="Certificates" />
                </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
                <ListItemButton onClick={() => scrollToSection("services")}>
                    <ListItemText primary="Services and Prices" />
                </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
                <ListItemButton onClick={() => scrollToSection("testimonials")}>
                    <ListItemText primary="Testimonials" />
                </ListItemButton>
            </ListItem>
        </List>
    );
};

export default ProfileBookmarksContainer;