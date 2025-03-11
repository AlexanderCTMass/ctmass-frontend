import PropTypes from 'prop-types';
import {formatDistanceStrict} from 'date-fns';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Divider,
    IconButton,
    Rating,
    Stack,
    Typography
} from '@mui/material';
import {getInitials} from 'src/utils/get-initials';
import React from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import {getValidDate} from "src/utils/date-locale";
import {paths} from "src/paths";
import {projectFlow} from "src/flows/project/project-flow";
import toast from "react-hot-toast";
import {styled} from "@mui/material/styles";

const StyledStack = styled(Stack)(({ theme, selected }) => ({
    position: 'relative',
    scale: selected ? '1.15' : '',
    opacity: selected ? '100%' : '90%',
    paddingLeft: selected ? '20px' : '',
    transition: 'scale 0.1s ease-in-out, opacity 0.1s ease-in-out',
    cursor: 'pointer',
    '&:hover': {
        scale: selected ? '' : '1.03',
    },

    '&::after': {
        content: '""',
        display: selected ? 'block' : 'none',
        position: 'absolute',
        right: '0px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '5px',
        height: '40px',
        backgroundColor: theme.palette.primary.main,
        transition: 'background-color 0.1s ease-in-out',
    },
}));

export const ProjectResponse = (props) => {
    const {response, user, project, selected = false, onClick} = props;

    const ago = formatDistanceStrict(getValidDate(response.createdAt), new Date(), {addSuffix: true});

    const handleAcceptResponse = async () => {
        try {
            await projectFlow.acceptResponse(project, user, response);
            toast.success("Success");
        } catch (e) {
            console.log(e);
            toast.error("Error");
        }
    }

    const handleRejectResponse = async () => {
        try {
            await projectFlow.rejectResponse(project, user, response);
            toast.success("Success");
        } catch (e) {
            console.log(e);
            toast.error("Error");
        }
    }

    return (
        <StyledStack selected={selected} onClick={onClick}>
            <Stack
                spacing={2}
                alignItems={selected ? "center" : 'flex-start'}
                direction={'row'}
            >
                <Avatar src={response.contractorAvatar}>
                    {getInitials(response.contractorName)}
                </Avatar>
                <Stack spacing={1}>
                    <Stack
                        alignItems="center"
                        direction="row"
                        divider={<span>·</span>}
                        // divider={<span>•</span>}
                        flexWrap="wrap"
                        spacing={2}
                    >
                        {/*<Typography
                                    noWrap
                                    variant="subtitle2"
                                >
                                    Plumber
                                </Typography>*/}
                        <Typography variant="subtitle1">
                            {response.contractorName}
                        </Typography>
                        {!selected && <Stack
                            alignItems="center"
                            direction="row"
                            spacing={1}
                        >
                            <Rating
                                value={response.contractorRating}
                                precision={0.1}
                                readOnly
                                max={1}
                            />
                            <Typography
                                noWrap
                                variant="subtitle2"
                            >
                                {response.contractorRating}
                            </Typography>
                        </Stack>}
                    </Stack>
                    {!selected &&
                        <Typography
                            color="text.secondary"
                            noWrap
                            variant="body2"
                            sx={{
                                width: '220px',
                                display: 'inline-block',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {response.message}
                        </Typography>}
                </Stack>
            </Stack>
        </StyledStack>
    );
};

ProjectResponse.propTypes = {
    response: PropTypes.object.isRequired
};
