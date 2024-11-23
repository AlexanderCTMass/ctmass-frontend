import {useShare} from "react-facebook";
import {IconButton, SvgIcon, Tooltip} from "@mui/material";
import * as React from "react";
import FacebookIcon from '@mui/icons-material/Facebook';

export const ShareExample = (props) => {
    const {postLink} = props;
    const {share, isLoading, error} = useShare();

    async function handleShare() {
        await share({
            href: postLink
        });
    }

    return (
        <Tooltip title={"Share the post so that the customer can leave a review"}>
            <IconButton onClick={handleShare} disabled={isLoading}>
                <SvgIcon>
                    <FacebookIcon/>
                </SvgIcon>
            </IconButton>
        </Tooltip>
    );
}