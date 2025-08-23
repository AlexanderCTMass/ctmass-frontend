import React, { useState } from "react";
import {
    Card,
    CardContent,
    Typography,
    Avatar,
    Button,
    Grid,
    Box,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    TextField,
    List,
    ListItem,
    ListItemText,
    Rating,
    Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import StarIcon from "@mui/icons-material/Star";
import { paths } from "src/paths";
import { roles } from "src/roles";
import { useAuth } from "src/hooks/use-auth";
import { useRouter } from "src/hooks/use-router";

// Mock Data
const mockProfile = {
    name: "Sander Electrix",
    location: "Amherst, Mass",
    rating: 5.0,
    reviewsCount: 541,
    isCertified: true,
    about:
        "Hi, I'm a licensed electrician with over [X] years of experience in residential, commercial, and industrial electrical systems. I take pride in delivering top-quality workmanship, ensuring all projects meet safety codes and client expectations.",
    services: [
        {
            name: "Electrician",
            details: "Details about electrician services",
            price: "$100/hour",
            images: ["service1.jpg", "service2.jpg"],
        },
        {
            name: "Plumber",
            details: "Details about plumbing services",
            price: "$120/hour",
            images: ["service3.jpg"],
        },
        {
            name: "HVAC",
            details: "Details about HVAC services",
            price: "$150/hour",
            images: [],
        },
    ],
    education: [
        {
            title: "Electrical Technology, Lincoln Technical Institute",
            year: 2009,
            description:
                "Completed comprehensive training in electrical systems, safety regulations, and industry best practices. Gained hands-on experience in residential, commercial, and industrial electrical applications.",
            certificates: ["Certificate 1", "Certificate 2"],
        },
        {
            title: "Electrical Apprenticeship Program",
            year: 2013,
            description: "Hands-on training in electrical installations and safety protocols.",
            certificates: [],
        },
        {
            title: "OSHA Safety Certification",
            year: 2018,
            description: "Certified for workplace safety and hazard management.",
            certificates: ["Certificate 3"],
        },
    ],
    reviews: [
        {
            author: "Mark Dakasos",
            location: "MA, Amherst",
            text: "The specialist responded promptly and arrived the same evening, completing everything professionally and with high quality.",
            rating: 5,
        },
        {
            author: "Moris Loo",
            location: "MA, Amherst",
            text: "He completed everything efficiently and with great quality. I'm very satisfied.",
            rating: 4.5,
        },
    ],
    portfolio: ["image1.jpg", "image2.jpg", "image3.jpg"],
};

export default function ProfilePage({ isOwnProfile = true }) {
    const [profile, setProfile] = useState(mockProfile);
    const [editMode, setEditMode] = useState(false);
    const { user } = useAuth();
    if (user.role === roles.CUSTOMER) {
        window.location.href = paths.cabinet.projects.index;
    }
    if (user.role === roles.WORKER) {
        window.location.href = paths.cabinet.projects.find.index;
    }


    const handleEditToggle = () => {
        setEditMode(!editMode);
    };

    const handleSave = () => {
        setEditMode(false);
    };

    return (
        <Box sx={{ maxWidth: "1200px", margin: "auto", padding: 3, display: "flex", gap: 2 }}>
            {/* Left Column */}
            <Box flex={2}>
                <Card>
                    <CardContent>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item>
                                <Avatar sx={{ width: 100, height: 100 }}>S</Avatar>
                            </Grid>
                            <Grid item xs>
                                {editMode ? (
                                    <TextField
                                        fullWidth
                                        label="Name"
                                        value={profile.name}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    />
                                ) : (
                                    <Typography variant="h4" display="flex" alignItems="center">
                                        {profile.name}
                                        {profile.isCertified && (
                                            <Box
                                                component="span"
                                                sx={{
                                                    ml: 2,
                                                    padding: "2px 8px",
                                                    backgroundColor: "green",
                                                    color: "white",
                                                    borderRadius: 1
                                                }}
                                            >
                                                Certified Specialist
                                            </Box>
                                        )}
                                    </Typography>
                                )}
                                <Typography>{profile.location}</Typography>
                                <Box display="flex" alignItems="center">
                                    <StarIcon color="primary" />
                                    <Typography variant="body1" ml={1}>
                                        {profile.rating} ({profile.reviewsCount} reviews)
                                    </Typography>
                                </Box>
                            </Grid>
                            {isOwnProfile && (
                                <Grid item>
                                    {editMode ? (
                                        <Button variant="contained" color="primary" onClick={handleSave}>
                                            Save
                                        </Button>
                                    ) : (
                                        <Button variant="outlined" onClick={handleEditToggle}>
                                            Edit Profile
                                        </Button>
                                    )}
                                </Grid>
                            )}
                        </Grid>

                        <Typography variant="h6" mt={3}>About</Typography>
                        {editMode ? (
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                value={profile.about}
                                onChange={(e) => setProfile({ ...profile, about: e.target.value })}
                            />
                        ) : (
                            <Typography>{profile.about}</Typography>
                        )}

                        <Typography variant="h6" mt={3}>Services & Prices</Typography>
                        {profile.services.map((service, index) => (
                            <Accordion key={index}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography>{service.name}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography>Price: {service.price}</Typography>
                                    <Typography>{service.details}</Typography>
                                    <Box display="flex" gap={1} mt={1}>
                                        {service.images.map((image, imgIndex) => (
                                            <Box
                                                key={imgIndex}
                                                sx={{ width: 100, height: 100, backgroundColor: "gray" }}
                                            >
                                                {/* Placeholder for image */}
                                            </Box>
                                        ))}
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
                        ))}

                        <Typography variant="h6" mt={3}>Education</Typography>
                        {profile.education.map((edu, index) => (
                            <Accordion key={index}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography>
                                        {edu.title} ({edu.year})
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography>{edu.description}</Typography>
                                    {edu.certificates.length > 0 && (
                                        <Box mt={2}>
                                            <Typography variant="body2">Certificates:</Typography>
                                            <List>
                                                {edu.certificates.map((cert, certIndex) => (
                                                    <ListItem key={certIndex}>
                                                        <ListItemText primary={cert} />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </Box>
                                    )}
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </CardContent>
                </Card>
            </Box>

            {/* Right Column */}
            <Box flex={1}>
                <Card>
                    <CardContent>
                        <Typography variant="h6">Reviews</Typography>
                        <List>
                            {profile.reviews.map((review, index) => (
                                <ListItem key={index} divider>
                                    <Box>
                                        <Typography variant="body1" fontWeight="bold">
                                            {review.author} - {review.location}
                                        </Typography>
                                        <Rating value={review.rating} precision={0.5} readOnly size="small" />
                                        <Typography variant="body2">{review.text}</Typography>
                                    </Box>
                                </ListItem>
                            ))}
                        </List>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="h6">Portfolio</Typography>
                        <Box display="flex" gap={2} flexWrap="wrap" mt={2}>
                            {profile.portfolio.map((image, index) => (
                                <Box
                                    key={index}
                                    sx={{ width: 100, height: 100, backgroundColor: "gray" }}
                                >
                                    {/* Placeholder for image */}
                                </Box>
                            ))}
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
}
