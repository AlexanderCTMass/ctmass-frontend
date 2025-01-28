import { Box, List, ListItem, Rating, Typography, Button } from "@mui/material";
import React from "react";

export default function Reviews(props) {
    const { profile } = props;

    return (
        <div>
            <Typography color="text.secondary">REVIEWS</Typography>
            <List>
                {profile.reviews.map((review, index) => (
                    <ListItem key={index} sx={{ padding: 0 }}>
                        <Box sx={{ mt: "15px" }}>
                            {/* Имя автора и локация */}
                            <Box sx={{ display: 'flex' }}>
                                <Typography variant="body1">review from</Typography>
                                <Typography variant="body1" fontWeight="bold" sx={{ whiteSpace: 'pre-wrap' }}>
                                    {" "} {review.author} - {review.location}
                                </Typography>
                            </Box>

                            {/* Рейтинг */}
                            <Rating value={review.rating} precision={0.5} readOnly size="small" />

                            {/* Текст отзыва */}
                            <Typography variant="body2">
                                {review.text}
                            </Typography>

                            {/* Раздел с Today и View на одной строке */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ marginRight: 'auto' }}>
                                    Today
                                </Typography>
                                <Button variant="text" color="inherit" sx={{ fontSize: "12px" }}>
                                    View
                                </Button>
                            </Box>
                        </Box>
                    </ListItem>
                ))}
            </List>
        </div>
    );
}
