import React from "react";
import { Typography, Box, Stack, Avatar } from "@mui/material";

const Testimonials = ({ testimonials }) => {
    return (
        <Box sx={{ marginBottom: 4, backgroundColor: "white", borderRadius: 2 }}>
            <Typography variant="h6" sx={{ marginBottom: 0, paddingLeft: 2, paddingTop: 2 }}>Testimonials</Typography>
            <Stack spacing={2}>
                {testimonials.map((testimonial, index) => (
                    <Box key={index} display="flex" gap={2}>
                        <Avatar alt={testimonial.name} src={testimonial.avatar} />
                        <Box>
                            <Typography variant="body2">{testimonial.text}</Typography>
                            <Typography variant="caption" color="text.secondary">
                                {testimonial.date}
                            </Typography>
                        </Box>
                    </Box>
                ))}
            </Stack>
        </Box>
    );
};

export default Testimonials;
