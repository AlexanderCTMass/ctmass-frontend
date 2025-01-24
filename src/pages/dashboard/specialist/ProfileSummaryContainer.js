import React from "react";
import { Box, Typography, Button } from "@mui/material";

const ProfileSummaryContainer = ({
                                     name,
                                     location,
                                     rating,
                                     reviewsCount,
                                     isCertified,
                                 }) => {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                borderBottom: "1px solid #ddd",
                paddingBottom: 2,
            }}
        >
            <Box
                component="img"
                src="https://avatars.mds.yandex.net/i?id=a11d4404abcae23238216d031770b70a94f952cd-12529777-images-thumbs&n=13"
                alt={name}
                sx={{
                    width: 120,
                    height: 150,
                    objectFit: "cover",
                    borderRadius: "8px",
                }}
            />
            <Box>
                <Typography variant="h5">{name}</Typography>
                <Typography variant="body2" color="textSecondary">
                    {location}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    ⭐ {rating} ({reviewsCount} reviews)
                </Typography>
                {isCertified && (
                    <Button
                        variant="contained"
                        size="small"
                        sx={{
                            marginTop: 1,
                            backgroundColor: "#28a745",
                            "&:hover": { backgroundColor: "#218838" },
                        }}
                    >
                        Certified Specialist
                    </Button>
                )}
            </Box>
        </Box>
    );
};

export default ProfileSummaryContainer;
