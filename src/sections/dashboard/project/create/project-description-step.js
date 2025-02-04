import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import {
    Button,
    IconButton,
    ImageList,
    ImageListItem,
    LinearProgress,
    Stack,
    SvgIcon,
    Typography,
    useMediaQuery
} from '@mui/material';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import {deleteObject, getDownloadURL, ref, uploadBytesResumable} from "firebase/storage";
import PropTypes from 'prop-types';
import * as React from "react";
import {useCallback, useEffect, useState} from "react";
import {PhotosDropzone} from "src/components/photos-dropzone";
import {QuillEditor} from 'src/components/quill-editor';
import {storage} from "src/libs/firebase";
import {v4 as uuidv4} from 'uuid';

const Preview = (props) => {
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
export const ProjectDescriptionStep = (props) => {
    const {onBack, onNext, project, ...other} = props;
    const [content, setContent] = useState(project?.description || null);
    const [attach, setAttach] = useState([]);
    const [existingAttach, setExistingAttach] = useState(project?.attach || []);
    const smUp = useMediaQuery((theme) => theme.breakpoints.up('sm'));
    const [uploadProgress, setUploadProgress] = useState({});
    const [submit, setSubmit] = useState(false);

    const handleContentChange = useCallback((value) => {
        setContent(value);
    }, []);


    const handleOnNext = async () => {
        setSubmit(true);
        // Upload new photos to Firebase Storage
        const newPhotosUrls = await Promise.all(
            attach.map((item) => {
                return new Promise((resolve, reject) => {
                    const folder = item.type === 'video' ? 'videos' : 'photos';
                    const storageRef = ref(storage, `${folder}/${uuidv4()}_${item.file.name}`);
                    const uploadTask = uploadBytesResumable(storageRef, item.file);

                    uploadTask.on('state_changed',
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            setUploadProgress((prev) => ({...prev, [item.file.name]: progress}));
                        },
                        (error) => {
                            console.error('Upload failed:', error);
                            reject(error);
                        },
                        async () => {
                            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                            setUploadProgress((prev) => {
                                const updated = {...prev};
                                delete updated[item.file.name];
                                return updated;
                            });
                            resolve(downloadURL);
                        }
                    );
                });
            })
        );
        const attachments = [...existingAttach, ...newPhotosUrls];

        if (project.attach) {
            project.attach.filter((exist) => !attachments.includes(exist)).forEach((url) => {
                const imgRef = ref(storage, url);
                deleteObject(imgRef).then(async () => {
                }).catch((error) => {
                    throw error;
                });
            });
        }
        project.description = content;
        project.attach = attachments;
        onNext(project);
        setSubmit(false);
    }

    const handleFilesDrop = (files) => {
        const newPhotos = files.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
            type: file.type.startsWith('video') ? 'video' : 'image',
        }));
        console.log(newPhotos);
        setAttach((prevState) => [...prevState, ...newPhotos]);
    };

    const handleRemovePhotos = (preview) => {
        setAttach(prevState => prevState.filter((item) => item.preview !== preview));
    };

    const handleRemoveExistingPhotos = async (url) => {
        setExistingAttach(prevState => prevState.filter((item) => item !== url));
    };

    const handleFilesRemoveAll = () => {
        setAttach([]);
    }

    useEffect(() => {
        console.log("Attach: " + attach);
        console.log("Attach exists: " + existingAttach);
    }, [attach, existingAttach])


    const modules = smUp ? {
            toolbar: [
                [{'header': [2, 3, false]}],
                ['bold', 'italic', 'underline'],
                [{'list': 'ordered'}, {'list': 'bullet'}],
                ['clean']
            ],
        } : {
            toolbar: [
                ['bold', 'italic', 'underline'],
                [{'list': 'ordered'}, {'list': 'bullet'},]
            ],
        },

        formats = [
            'header',
            'bold', 'italic', 'underline', 'strike',
            'list', 'bullet'
        ];
    return (
        <Stack
            spacing={3}
            {...other}>
            <div>
                <Typography variant="h6">
                    How would you describe the project?
                </Typography>
            </div>
            <QuillEditor
                onChange={handleContentChange}
                placeholder="Write something"
                sx={{height: 200}}
                value={content}
                modules={modules}
                formats={formats}
                readOnly={submit}
            />

            <div>
                <Typography variant="h6">
                    A photo or video will help the specialist to assess the situation more accurately.
                </Typography>
            </div>
            <PhotosDropzone
                accept={{'image/*,video/*': []}}
                caption={"Attach photos or videos"}
                onDrop={handleFilesDrop}
                onRemove={handleRemovePhotos}
                onRemoveAll={handleFilesRemoveAll}
                onUpload={() => {
                }}
            />
            <ImageList
                variant="quilted"
                cols={smUp ? 5 : 2}
                rowHeight={101}
            >
                {existingAttach.map((url) =>
                    <Preview attach={{preview: url}} onRemove={() => handleRemoveExistingPhotos(url)}/>
                )}
                {attach.map((item) => (
                    <Preview attach={item} onRemove={() => handleRemovePhotos(item.preview)}
                             uploadProgress={uploadProgress}/>
                ))}
            </ImageList>
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
                    disabled={submit}
                >
                    Continue
                </Button>
                <Button
                    color="inherit"
                    onClick={onBack}
                    disabled={submit}
                >
                    Back

                </Button>
            </Stack>
        </Stack>
    );
};

ProjectDescriptionStep.propTypes = {
    onBack: PropTypes.func,
    onNext: PropTypes.func
};
