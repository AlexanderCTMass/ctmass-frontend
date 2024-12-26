import CloseIcon from "@mui/icons-material/Close";
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import {
    Autocomplete,
    Avatar,
    Backdrop, Box,
    Button,
    Card,
    CardContent,
    CardHeader, Chip,
    CircularProgress,
    Dialog,
    FormControl,
    IconButton,
    ImageList,
    ImageListItem, InputAdornment,
    InputLabel, LinearProgress,
    MenuItem, OutlinedInput,
    Select,
    Stack,
    SvgIcon,
    TextField, Typography,
    useMediaQuery
} from '@mui/material';
import Grid from "@mui/material/Unstable_Grid2";
import {DateRangePicker} from "@mui/x-date-pickers-pro";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import Image01Icon from '@untitled-ui/icons-react/build/esm/Image01';
import dayjs from "dayjs";
import {addDoc, collection, doc, serverTimestamp, updateDoc} from "firebase/firestore";
import {deleteObject, getDownloadURL, ref, uploadBytes, uploadBytesResumable} from "firebase/storage";
import {useFormik} from "formik";
import * as React from "react";
import {useCallback, useEffect, useState} from "react";
import toast from "react-hot-toast";
import ReactMapboxAutocomplete from 'react-mapbox-autocomplete';
import 'react-quill/dist/quill.snow.css';
import {profileApi} from "src/api/profile";
import {FileDropzone} from "src/components/file-dropzone";
import {CustomMapboxAutocomplete} from "src/components/mapbox-autocomplete";
import {PhotosDropzone} from "src/components/photos-dropzone";
import {QuillEditor} from "src/components/quill-editor";
import {mapboxConfig} from "src/config";
import {useAuth} from "src/hooks/use-auth";
import {useMounted} from "src/hooks/use-mounted";
import {emailSender} from "src/libs/email-sender";
import {firestore, storage} from "src/libs/firebase";
import {wait} from "src/utils/wait";
import {v4 as uuidv4} from 'uuid';
import * as Yup from "yup";


function removeHTMLTags(htmlString) {
    // Create a new DOMParser instance
    const parser = new DOMParser();
    // Parse the HTML string
    const doc = parser.parseFromString(htmlString, 'text/html');
    // Extract text content
    const textContent = doc.body.textContent || "";
    // Trim whitespace
    return textContent.trim();
}


function getPostSharedLink(user, post) {
    return process.env.REACT_APP_HOST_P + "/specialist/" + user.profilePage + "?postId=" + post;
}


const getSectionLabel = (number, label) => {
    return <Stack
        alignItems="center"
        direction="row"
        spacing={2}
    >
        {number && <Box
            sx={{
                alignItems: 'center',
                border: (theme) => `1px solid ${theme.palette.divider}`,
                borderRadius: 20,
                display: 'flex',
                height: 40,
                justifyContent: 'center',
                width: 40
            }}
        >
            <Typography
                sx={{fontWeight: 'fontWeightBold'}}
                variant="h6"
            >
                {number}
            </Typography>
        </Box>}
        <Typography variant="h6">
            {label}
        </Typography>
    </Stack>;
}
export const SpecialistAnyPostAdd = (props) => {
    const {
        handlePostsGet,
        post,
        onClose,
        open = false,
    } = props;
    const smUp = useMediaQuery((theme) => theme.breakpoints.up('sm'));
    const {user} = useAuth();
    const [uploadProgress, setUploadProgress] = useState({});
    const [quillBlur, setQuillBlur] = useState(false);
    const isMounted = useMounted();
    const [loadingCustomer, setLoadingCustomer] = useState(false);

    const formik = useFormik({
        initialValues: {
            title: '',
            description: '',
            photos: [],
            existingPhotos: [],

            comments: []
        },
        validationSchema: Yup.object({
            title: Yup
                .string().max(120).required("Title is required"),
            description: Yup.string().required('Description is required'),
        }),
        onSubmit: async (values, {setSubmitting, resetForm}) => {
            /*if (values.photos.length === 0 && values.existingPhotos.length === 0) {
                alert('At least one photos file is required.');
                setSubmitting(false);
                return;
            }*/

            setSubmitting(true);

            try {
                // Upload new photos to Firebase Storage
                const newPhotosUrls = await Promise.all(
                    values.photos.map((item) => {
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
                values.photos = [...values.existingPhotos, ...newPhotosUrls];
                values.updatedAt = serverTimestamp();
                let postId = post.id;
                if (!postId) {
                    const docRef = await addDoc(collection(firestore, "specialistPosts"),
                        {createdAt: serverTimestamp(), ...values});
                    postId = docRef.id;
                } else {
                    post.photos.filter((exist) => !values.photos.includes(exist)).forEach((url) => {
                        const imgRef = ref(storage, url);
                        deleteObject(imgRef).then(async () => {

                        }).catch((error) => {
                            throw error;
                        });
                    });
                    await updateDoc(doc(firestore, "specialistPosts", postId), values);
                }
                resetForm();
                handlePostsGet();
                onClose();
            } catch (error) {
                console.error('Error updating post:', error);
                alert('Failed to update post.');
            } finally {
                setSubmitting(false);
            }
        },
    });

    useEffect(() => {
        const fetchPostData = async () => {
            if (post) {
                let contractor = user;
                if (post.contractorId) {
                    const newVar = await profileApi.get(post.contractorId);
                    if (newVar) {
                        contractor = newVar;
                    }
                }

                let customer;
                if (post.customerId) {
                    const newVar = await profileApi.get(post.customerId);
                    if (newVar) {
                        customer = newVar;
                    }
                }


                await formik.setValues({
                    authorId: post.authorId || contractor.id,

                    authorEmail: post.contractorEmail || contractor.email,
                    authorName: post.contractorName || contractor.businessName || contractor.name,
                    authorAvatar: post.contractorAvatar || contractor.avatar || '', //

                    title: post.title || '',
                    description: post.description || '',

                    photos: [],
                    existingPhotos: post.photos || [],

                    comments: [],

                    postType: post.postType || "post",
                });
            }
        };

        fetchPostData();
    }, [post, user]);


    useEffect(() => {
        console.log(formik.errors);
    }, [formik.errors])

    const handleRemovePhotos = (preview) => {
        formik.setFieldValue('photos', formik.values.photos.filter((item) => item.preview !== preview));
    };

    const handleRemoveExistingPhotos = async (url) => {
        try {
            await formik.setFieldValue('existingPhotos', formik.values.existingPhotos.filter((item) => item !== url));
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    };

    const handleFilesDrop = (files) => {
        const newPhotos = files.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
            type: file.type.startsWith('video') ? 'video' : 'image',
        }));
        formik.setFieldValue('photos', [...formik.values.photos, ...newPhotos]);
    };

    const handleFileRemove = (file) => {
        formik.setFieldValue('photos', formik.values.photos.filter((item) => item.preview !== file));
    }

    const handleFilesRemoveAll = () => {
        formik.setFieldValue('photos', []);
    }

    const handleClose = () => {
        formik.resetForm();
        onClose();
    }

    const modules = smUp ? {
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
        },

        formats = [
            'header',
            'bold', 'italic', 'underline', 'strike', 'blockquote',
            'list', 'bullet', 'indent',
            'link', 'image'
        ];

    return (
        <Dialog
            fullWidth
            fullScreen={!smUp}
            maxWidth="md"
            onClose={handleClose}
            open={open}
            scroll={"body"}
        >
            <form onSubmit={formik.handleSubmit}>

                <Card sx={{position: "relative"}}>
                    {/* <Backdrop
                        sx={{position: "absolute", color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1}}
                        open={formik.isSubmitting}
                    >
                        <CircularProgress color="inherit"/>
                    </Backdrop>*/}
                    <CardHeader
                        title={smUp ? "Publish any post, share an idea, or just your mood" : "New post"}
                        action={(
                            <IconButton onClick={handleClose}>
                                <SvgIcon>
                                    <CloseIcon/>
                                </SvgIcon>
                            </IconButton>
                        )}/>
                    <CardContent>
                        <Grid
                            container
                            spacing={4}
                            // sx={{flexGrow: 1}}
                        >
                            <Grid
                                xs={12}
                                lg={12}>
                                <TextField
                                    label="Title"
                                    name="title"
                                    value={formik.values.title}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.title && Boolean(formik.errors.title)}
                                    helperText={formik.touched.title && formik.errors.title}
                                    required
                                    fullWidth
                                    disabled={formik.isSubmitting}
                                />
                            </Grid>
                            <Grid
                                xs={12}
                                lg={12}
                            >
                                <QuillEditor
                                    onChange={(value) => {
                                        formik.setFieldValue('description', value);
                                        setQuillBlur(true);
                                    }}
                                    modules={modules}
                                    formats={formats}
                                    readOnly={formik.isSubmitting}
                                    sx={{height: 300}}
                                    value={formik.values.description}
                                />
                            </Grid>
                            <Grid
                                xs={12}
                                lg={12}
                            >
                                <PhotosDropzone
                                    accept={{'image/*,video/*': []}}
                                    caption={"Attach photos or videos"}
                                    onDrop={handleFilesDrop}
                                    onRemove={handleFileRemove}
                                    onRemoveAll={handleFilesRemoveAll}
                                    onUpload={() => {
                                    }}
                                />
                                <ImageList
                                    variant="quilted"
                                    cols={smUp ? 5 : 2}
                                    rowHeight={101}
                                >
                                    {formik.values.existingPhotos.map((url) => (
                                        <ImageListItem key={url}>
                                            {url.includes('video') ? (
                                                <video src={url} controls style={{width: '100%'}}/>
                                            ) : (
                                                <img src={url} alt="existing" loading="lazy"/>
                                            )}
                                            <IconButton
                                                style={{position: 'absolute', top: 0, right: 0}}
                                                onClick={() => handleRemoveExistingPhotos(url)}
                                            >
                                                <HighlightOffIcon/>
                                            </IconButton>
                                        </ImageListItem>
                                    ))}

                                    {formik.values.photos.map((item) => (
                                        <ImageListItem key={item.preview} sx={{}}>
                                            {item.type === 'image' ? (
                                                <img src={item.preview} alt="preview" loading="lazy"/>
                                            ) : (
                                                <video src={item.preview} controls style={{width: '100%'}}/>
                                            )}
                                            <IconButton
                                                style={{position: 'absolute', top: 0, right: 0}}
                                                onClick={() => handleRemovePhotos(item.preview)}
                                            >
                                                <HighlightOffIcon/>
                                            </IconButton>
                                            {uploadProgress[item.file?.name] !== undefined && (
                                                <LinearProgress variant="determinate"
                                                                value={uploadProgress[item.file.name]}/>
                                            )}
                                        </ImageListItem>
                                    ))}
                                </ImageList>
                                <Stack
                                    alignItems="center"
                                    direction="row"
                                    justifyContent="end"
                                    spacing={3}
                                >

                                    <div>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            color="primary"
                                            disabled={Boolean(formik.isSubmitting || formik.values.title === '' || removeHTMLTags(formik.values.description) === '')}
                                        >
                                            {formik.isSubmitting ? <CircularProgress size={24}/> : 'Update Post'}
                                        </Button>
                                    </div>
                                </Stack>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </form>
        </Dialog>
    );

};
