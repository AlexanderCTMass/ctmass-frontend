import React, {useState, useRef, useEffect} from "react";
import {Typography, Box, Button, TextField} from "@mui/material";

const AboutUser = ({title, about}) => {
    const [isAboutExpanded, setIsAboutExpanded] = useState(false);
    const [isEditingAbout, setIsEditingAbout] = useState(false);
    const [aboutText, setAboutText] = useState(about);
    const [isOverflowing, setIsOverflowing] = useState(false);

    const textRef = useRef(null); // Ссылка на текст

    const toggleAbout = () => {
        setIsAboutExpanded(!isAboutExpanded);
    };

    const handleEditAbout = () => {
        setIsEditingAbout(true);
    };

    const handleSaveAbout = () => {
        setIsEditingAbout(false);
    };

    // Проверяем, обрезается ли текст
    useEffect(() => {
        if (textRef.current) {
            const isClamped = textRef.current.scrollHeight > textRef.current.clientHeight;
            setIsOverflowing(isClamped);
        }
    }, [aboutText, isAboutExpanded]);

    return (
        <Box sx={{marginBottom: 4, backgroundColor: "white", borderRadius: 2}}>
            <Box sx={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                <Typography variant="h6" sx={{marginBottom: 0, paddingLeft: 2, marginTop: 2}}>
                    {title}
                </Typography>
                <Box sx={{display: "flex", gap: 1}}>
                    <Button onClick={handleEditAbout} sx={{padding: 0, marginTop: 2}}>
                        Edit
                    </Button>
                </Box>
            </Box>
            {isEditingAbout ? (
                <>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        value={aboutText}
                        onChange={(e) => setAboutText(e.target.value)}
                        sx={{marginBottom: 2}}
                    />
                    <Button variant="contained" onClick={handleSaveAbout}>
                        Save
                    </Button>
                </>
            ) : (
                <>
                    <Typography
                        ref={textRef}
                        variant="body1"
                        sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: isAboutExpanded ? "none" : 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            paddingLeft: 2,
                            paddingRight: 2,
                            paddingBottom: 2,
                            textAlign: 'justify'
                        }}
                    >
                        {aboutText}
                    </Typography>
                    {isOverflowing ? (
                        <Button onClick={toggleAbout} size="small" sx={{paddingLeft: 2, paddingTop: 2}}>
                            {isAboutExpanded ? "Show less" : "Show more"}
                        </Button>
                    ) : <div></div>}
                </>
            )}
        </Box>
    );
};

export default AboutUser;
