import PropTypes from 'prop-types';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import {Avatar, Box, Button, IconButton, Stack, SvgIcon, TextField, Tooltip, Typography} from '@mui/material';
import {useCallback, useRef, useState} from "react";
import User01Icon from "@untitled-ui/icons-react/build/esm/User01";
import {getDownloadURL, ref, uploadBytes} from "firebase/storage";
import {storage} from "../../../libs/firebase";
import toast from "react-hot-toast";
import Slider from "@mui/material/Slider";
import * as React from "react";
import SpecialityCard from "../account/general/specialties-card";
import {SpecialtySelectForm} from "../../../components/specialty-select-form";
import CardContent from "@mui/material/CardContent";
import Card from "@mui/material/Card";
import ArchiveIcon from "@untitled-ui/icons-react/build/esm/Archive";
import {profileApi} from "../../../api/profile";
import {QuillEditor} from "../../../components/quill-editor";

export const SpecialistDescriptionStep = (props) => {
    const {profile, onNext, onBack, ...other} = props;
    const [content, setContent] = useState(profile.description);

    const handleContentChange = useCallback((value) => {
        setContent(value);
    }, []);
    const handleOnNext = () => {
        if (profile.description === content)
            onNext();
        else {
            onNext({
                description: content,
                profileDataProgress: 4
            });
        }
    }


    return (
        <Stack
            spacing={3}
            {...other}>
            <div>
                <Typography variant="h6">
                    Why should customers hire you?
                </Typography>
                <Typography variant="body2">
                    Explain what makes your business stand out and why you'll do a great job.
                </Typography>
            </div>
            <QuillEditor
                onChange={handleContentChange}
                placeholder="You can mention: years in business, what you're passionate aboute, special skills or equipment"
                sx={{ height: 200 }}
                value={content}
            />
            <Stack
                alignItems="center"
                direction="row"
                spacing={2}
            >
                <Button
                    endIcon={(
                        <SvgIcon>
                            <ArrowRightIcon />
                        </SvgIcon>
                    )}
                    onClick={handleOnNext}
                    variant="contained"
                >
                    Complete
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

SpecialistDescriptionStep.propTypes = {
    onBack: PropTypes.func,
    onNext: PropTypes.func
};
