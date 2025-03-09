import {IconButton, ImageListItem, LinearProgress} from "@mui/material";
import * as React from "react";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";

export const PreviewEditable = (props) => {
    const {attach, onRemove, uploadProgress, ...other} = props;

    console.log(attach);
    if (!attach || !attach.preview)
        return;

    return (
        <ImageListItem key={attach.preview}>
            {attach.preview.includes('video') ? (
                <video src={attach.preview} controls style={{width: '100%', height: "90px"}}/>
            ) : (
                <img src={attach.preview} alt="existing" loading="lazy" style={{width: '100%', height: "90px"}}/>
            )}
            <IconButton
                style={{position: 'absolute', top: 0, right: 0}}
                onClick={onRemove}
            >
                <HighlightOffIcon/>
            </IconButton>
            {uploadProgress && uploadProgress[attach.file?.name] !== undefined && (
                <LinearProgress variant="determinate"
                                value={uploadProgress[attach.file.name]}/>
            )}
        </ImageListItem>
    );
}