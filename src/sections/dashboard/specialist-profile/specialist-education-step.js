import PropTypes from 'prop-types';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    ImageList,
    Stack,
    SvgIcon,
    TextField,
    Tooltip,
    Typography,
    useMediaQuery
} from '@mui/material';
import * as React from "react";
import {useEffect, useState} from "react";
import {getDownloadURL, ref, uploadBytes} from "firebase/storage";
import {storage} from "src/libs/firebase";
import toast from "react-hot-toast";
import CardContent from "@mui/material/CardContent";
import Card from "@mui/material/Card";
import ArchiveIcon from "@untitled-ui/icons-react/build/esm/Archive";
import {PhotosDropzone} from "src/components/photos-dropzone";
import {Preview} from "src/components/myfancy/image-preview";
import {extendedProfileApi} from "src/pages/cabinet/profiles/my/data/extendedProfileApi";
import {INFO} from "src/libs/log";
import AddIcon from '@untitled-ui/icons-react/build/esm/Plus';
import EditIcon from '@untitled-ui/icons-react/build/esm/Pencil01';
import {EducationFormDialog} from "src/sections/cabinet/profile/forms/education-form-dialog";
import Fancybox from "src/components/myfancy/myfancybox";
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';

const useUserEducations = (userId) => {
    const [educations, setEducations] = useState([]);
    const [isFetching, setIsFetching] = useState(false);

    useEffect(() => {
        setIsFetching(false);
        const fetchData = async () => {
            const response = await extendedProfileApi.getEducation(userId);
            INFO("Fetched educations", response);
            setEducations(response);
            setIsFetching(true);
        };

        if (userId) {
            fetchData();
        }
    }, [userId]);

    return {educations, isFetching};
};

export const SpecialistEducationStep = (props) => {
    const {profile, onNext, onBack, ...other} = props;
    const {educations: userEducations, isFetching: isFetchingUserEducations} = useUserEducations(profile.id);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [educations, setEducations] = useState([]);
    const [currentEducation, setCurrentEducation] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const mdUp = useMediaQuery((theme) => theme.breakpoints.up('md'));

    useEffect(() => {
        setEducations(userEducations);
    }, [userEducations]);

    const handleClickOpen = () => {
        setCurrentEducation(null);
        setDialogOpen(true);
    };

    const handleEditEducation = (education) => {
        setCurrentEducation(education);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
    };

    const handleRemoveEducation = async (education) => {
        if (window.confirm('Are you sure you want to delete this education?')) {
            try {
                await extendedProfileApi.deleteEducation(profile.id, education.id);
                const response = await extendedProfileApi.getEducation(profile.id);
                setEducations(response);
                toast.success('Education deleted successfully');
            } catch (error) {
                toast.error('Error deleting education: ' + error.message);
            }
        }
    };
    const handleChangeEducation = (newEducation) => {
        setEducations((prevEducations) => ([...prevEducations.filter((education) => education.id !== newEducation.id),
            newEducation]));
    }

    const handleOnNext = () => {
        onNext({
            profileDataProgress: 4
        });
    };

    return (
        <Stack spacing={3} {...other}>
            <div>
                <Typography variant="h6">
                    Certificates and Diplomas
                </Typography>
                <Typography variant="body2">
                    Verify your qualifications to build trust with clients.
                </Typography>
            </div>

            {!isFetchingUserEducations ? (
                <CircularProgress/>
            ) : (
                <Stack direction="column" spacing={2}>
                    {educations.map((education) => (
                        <Card
                            key={education.id}
                            sx={{':hover': {boxShadow: (theme) => `${theme.palette.primary.main} 0 0 5px`}}}
                        >
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Stack direction="row" spacing={2} alignItems="center" divider={<span>·</span>}
                                               mb={2}>
                                            <Typography variant="h6" color="text.secondary">
                                                {education.certificateType}
                                            </Typography>
                                            <Typography variant="h6" color="text.secondary">
                                                {education.year}
                                            </Typography>
                                        </Stack>

                                        <Typography variant="h6" component="div">
                                            {education.issuingOrganization}
                                        </Typography>

                                        {education.description && (
                                            <Typography variant="body2" sx={{mt: 1}}>
                                                {education.description}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Box>
                                        <Tooltip title="Edit education">
                                            <IconButton
                                                onClick={() => handleEditEducation(education)}
                                                sx={{mr: 1}}
                                            >
                                                <SvgIcon fontSize="small">
                                                    <EditIcon/>
                                                </SvgIcon>
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete education">
                                            <IconButton
                                                color="error"
                                                onClick={() => handleRemoveEducation(education)}
                                            >
                                                <SvgIcon fontSize="small">
                                                    <ArchiveIcon/>
                                                </SvgIcon>
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Stack>
                                <Box sx={{mt: 2}}>
                                    <Fancybox
                                        options={{
                                            Carousel: {
                                                infinite: false,
                                            },
                                        }}
                                    >
                                        <ImageList
                                            variant="quilted"
                                            cols={mdUp ? 5 : 2}
                                            rowHeight={101}
                                        >
                                            {education.certificates.map((item, index) => (
                                                <a data-fancybox="gallery" href={item.url}
                                                   className={"my-fancy-link"}> <Preview key={index}
                                                                                         attach={{preview: item.url}}/>
                                                </a>

                                            ))}
                                        </ImageList>
                                    </Fancybox>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Stack>
            )}

            <Button
                variant="outlined"
                startIcon={(
                    <SvgIcon>
                        <AddIcon/>
                    </SvgIcon>
                )}
                onClick={handleClickOpen}
            >
                Add Education
            </Button>

            <EducationFormDialog
                profileId={profile.id}
                open={dialogOpen}
                onClose={handleCloseDialog}
                initialData={currentEducation}
                onSubmit={handleChangeEducation}
                isSubmitting={isSubmitting}
            />

            <Stack
                alignItems="center"
                direction="row"
                spacing={2}
            >
                <Button
                    endIcon={(
                        <SvgIcon>
                            <ArrowRightIcon/>
                        </SvgIcon>
                    )}
                    onClick={handleOnNext}
                    variant="contained"
                >
                    Next
                </Button>
                <Button
                    color="inherit"
                    onClick={onBack}
                >
                    Back
                </Button>
            </Stack>
        </Stack>
    );
};

SpecialistEducationStep.propTypes = {
    onBack: PropTypes.func,
    onNext: PropTypes.func,
    profile: PropTypes.object.isRequired
};