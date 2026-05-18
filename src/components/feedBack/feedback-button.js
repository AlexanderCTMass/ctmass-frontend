import PropTypes from 'prop-types';
import { Box, ButtonBase, SvgIcon, Tooltip } from '@mui/material';

import BugReportIcon from '@mui/icons-material/BugReport';
import FeedbackDialog from "src/components/feedback-dialog";
import { useEffect, useState } from "react";
import { useAuth } from "src/hooks/use-auth";

export const OPEN_FEEDBACK_EVENT = 'ctmass:open-feedback-dialog';

export const openFeedbackDialog = () => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(OPEN_FEEDBACK_EVENT));
    }
};

export const FeedbackButton = (props) => {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const handler = () => setOpen(true);
        window.addEventListener(OPEN_FEEDBACK_EVENT, handler);
        return () => window.removeEventListener(OPEN_FEEDBACK_EVENT, handler);
    }, []);

    if (!user) {
        return null;
    }

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };


    return (
        <>
            <Tooltip title="Feedback, bug report or suggestion">
                <Box
                    sx={{
                        backgroundColor: 'background.paper',
                        borderRadius: '50%',
                        bottom: 0,
                        boxShadow: 16,
                        margin: (theme) => theme.spacing(4),
                        position: 'fixed',
                        left: 0,
                        zIndex: (theme) => theme.zIndex.speedDial
                    }}
                    {...props}>
                    <ButtonBase
                        onClick={handleOpen}
                        sx={{
                            backgroundColor: '#fd4e3d',
                            borderRadius: '50%',
                            color: 'primary.contrastText',
                            p: '10px'
                        }}
                    >
                        <SvgIcon>
                            <BugReportIcon />
                        </SvgIcon>
                    </ButtonBase>

                </Box>
            </Tooltip>
            <FeedbackDialog open={open} onClose={handleClose} onOpen={handleOpen} />
        </>
    );
}

FeedbackButton.propTypes = {
    onClick: PropTypes.func
};
