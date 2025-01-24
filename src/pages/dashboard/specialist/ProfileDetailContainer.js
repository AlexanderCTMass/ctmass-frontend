import React, {useState} from "react";
import {
    Box,
    Typography,
    Button,
    IconButton,
    TextField,
    Dialog,
    DialogContent,
} from "@mui/material";
import AboutUser from "./AboutUser";
import ServicesAndPrices from "./ServicesAndPrices";
import Testimonials from "./Testimonials";
import UserCertificates from "./UserCertificates";

const ProfileDetailContainer = ({
                                    about,
                                    education,
                                    certificates,
                                    services,
                                    testimonials,
                                }) => {

    return (
        <Box>
            {/* About */}
            <AboutUser title="About" about={about}/>
            <AboutUser title="Education" about={education}/>

            <UserCertificates certificates={certificates}/>
            <ServicesAndPrices services={services}/>
            <Testimonials testimonials={testimonials}/>
        </Box>
    );
};

export default ProfileDetailContainer;
