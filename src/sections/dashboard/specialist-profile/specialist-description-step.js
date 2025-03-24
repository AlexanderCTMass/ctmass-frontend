import PropTypes from 'prop-types';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import {
    Avatar,
    Box,
    Button,
    IconButton,
    Stack,
    SvgIcon,
    TextField,
    Tooltip,
    Typography,
    useMediaQuery
} from '@mui/material';
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
    const [content, setContent] = useState(profile.about);
    const mdUp = useMediaQuery((theme) => theme.breakpoints.up('md'));

    const handleContentChange = useCallback((e) => {

        const value = e.target.value;
        setContent(value);
    }, []);
    const handleOnNext = () => {
        if (profile.about === content)
            onNext();
        else {
            onNext({
                about: content,
                profileDataProgress: 4
            });
        }
    }

    const modules = mdUp ? {
        toolbar: [
            [{'header': [1, 2, false]}],
            ['bold', 'italic', 'underline', 'blockquote'],
            [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
            // ['link', 'image'],
            ['clean']
        ],
    } : {
        toolbar: [
            ['bold', 'italic', 'underline'],
            [{'list': 'ordered'}, {'list': 'bullet'},]
        ],
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
            {/*<QuillEditor
                onChange={handleContentChange}
                modules={modules}
                placeholder="You can mention: years in business, what you're passionate aboute, special skills or equipment"
                sx={mdUp ? {height: 200} : {height: 400}}
                value={content}
            />*/}
            <TextField
                label="About"
                multiline
                rows={4}
                placeholder="You can mention: years in business, what you're passionate aboute, special skills or equipment"
                onChange={handleContentChange}
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
