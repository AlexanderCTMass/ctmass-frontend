import { ImageListItem } from "@mui/material";
import * as React from "react";

export const Preview = (props) => {
    const { attach, ...other } = props;

    if (!attach || !attach.preview)
        return;

    return (
        <ImageListItem key={attach.preview}>
            {attach.preview.includes('video') ? (
                <video src={attach.preview} controls style={{ width: '100%', height: "90px" }} />
            ) : (
                <img src={attach.preview} alt="existing" loading="lazy" style={{ width: '100%', height: "90px" }} />
            )}
        </ImageListItem>
    );
}