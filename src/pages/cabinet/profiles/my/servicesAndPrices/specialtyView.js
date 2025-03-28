import {
    Accordion, AccordionDetails, AccordionSummary, Box, Button, Grid, IconButton, Tooltip, Typography
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import DeleteIcon from "@mui/icons-material/Delete";
import React from "react";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import {extendedProfileApi} from "src/pages/cabinet/profiles/my/data/extendedProfileApi";

export const SpecialtyView = ({
                                  service,
                                  serviceIndex,
                                  specialty,
                                  allServices,
                                  handleOpen,
                                  deleteService,
                                  openEditServiceDialog,
                                  setProfile,
                                  profile,
                                  isMyProfile
                              }) => {

    const handleSetMainSpecialty = (event) => {
        event.stopPropagation();
        const updatedProfile = {
            ...profile.profile,
            mainSpecId: service.specialty
        };

        setProfile(prev => ({
            ...prev, profile: updatedProfile
        }));

        extendedProfileApi.updateProfileInfo(updatedProfile.id, updatedProfile)
    };

    return (
        <Accordion key={serviceIndex}>
        <AccordionSummary
            // expandIcon={<ExpandMoreIcon/>}
            >
            <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                <Typography fontWeight="bold">{specialty?.label || "Unknown Specialty"}</Typography>
                {isMyProfile ? (<Box>

                    <IconButton onClick={handleSetMainSpecialty}>
                        {profile.profile.mainSpecId === service.specialty ? (
                            <StarIcon color="primary"/>
                        ) : (
                            <Tooltip title="Make it your main specialty">
                                <StarBorderIcon/>
                            </Tooltip>
                        )}
                    </IconButton>
                    <IconButton onClick={(event) => openEditServiceDialog(serviceIndex, event)} sx={{ml: 1}}>
                        <ModeEditIcon/>
                    </IconButton>
                    <IconButton onClick={(event) => deleteService(serviceIndex, event)} sx={{ml: 1}}>
                        <DeleteIcon/>
                    </IconButton>
                </Box>) : (profile.profile.mainSpecId === service.specialty &&
                    <Button disabled={true} sx={{pt: 0, pb: 0, mt: 0, mb: 0}}>Main specialty</Button>)}
            </Box>
        </AccordionSummary>
        {/*<AccordionDetails sx={{ml: 2}}>*/}
        {/*    {service.services.map((serviceDetail, detailIndex) => (<Box key={detailIndex} sx={{*/}
        {/*        mb: 2, borderRadius: '8px', p: 2*/}
        {/*    }}>*/}
        {/*        <Grid container spacing={2} alignItems="center">*/}
        {/*            <Grid item xs={7}>*/}
        {/*                <Typography*/}
        {/*                    fontWeight="bold">{allServices.find(s => s.id === serviceDetail.service)?.label}</Typography>*/}
        {/*                <Typography>{serviceDetail.description}</Typography>*/}
        {/*            </Grid>*/}
        {/*            <Grid item xs={3} sx={{textAlign: "right"}}>*/}
        {/*                <Typography>{serviceDetail.price}</Typography>*/}
        {/*            </Grid>*/}
        {/*        </Grid>*/}
        {/*        {serviceDetail.images?.length > 0 && (*/}
        {/*            <Box sx={{ml: 2, mt: 2, display: "flex", flexWrap: "wrap", gap: 1}}>*/}
        {/*                {serviceDetail.images.map((image, imgIndex) => (<Box key={imgIndex} position="relative">*/}
        {/*                    <Box*/}
        {/*                        component="img"*/}
        {/*                        src={image}*/}
        {/*                        sx={{*/}
        {/*                            width: 100, height: 100, objectFit: "cover", borderRadius: "4px",*/}
        {/*                        }}*/}
        {/*                        onClick={() => handleOpen(imgIndex, serviceDetail.images)}*/}
        {/*                    />*/}
        {/*                </Box>))}*/}
        {/*            </Box>)}*/}
        {/*    </Box>))}*/}
        {/*</AccordionDetails>*/}
    </Accordion>)
}