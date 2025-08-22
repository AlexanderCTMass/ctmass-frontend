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
import { DateRangePicker } from "@mui/x-date-pickers-pro";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import Image01Icon from '@untitled-ui/icons-react/build/esm/Image01';
import dayjs from "dayjs";
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes, uploadBytesResumable } from "firebase/storage";
import { useFormik } from "formik";
import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import ReactMapboxAutocomplete from 'react-mapbox-autocomplete';
import 'react-quill/dist/quill.snow.css';
import { profileApi } from "src/api/profile";
import { FileDropzone } from "src/components/file-dropzone";
import { CustomMapboxAutocomplete } from "src/components/mapbox-autocomplete";
import { PhotosDropzone } from "src/components/photos-dropzone";
import { QuillEditor } from "src/components/quill-editor";
import { mapboxConfig } from "src/config";
import { ProjectStatus } from "src/enums/project-state";
import { useAuth } from "src/hooks/use-auth";
import { useMounted } from "src/hooks/use-mounted";
import { emailSender } from "src/libs/email-sender";
import { firestore, storage } from "src/libs/firebase";
import { wait } from "src/utils/wait";
import { v4 as uuidv4 } from 'uuid';
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
    return process.env.REACT_APP_HOST_P + "/cabinet/profiles/" + user.profilePage + "?postId=" + post;
}


const getSectionLabel = (number, label) => {
    return <Stack
        alignItems="center"
        direction="row"
        spacing={2}
    >
        <Box
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
                sx={{ fontWeight: 'fontWeightBold' }}
                variant="h6"
            >
                {number}
            </Typography>
        </Box>
        <Typography variant="h6">
            {label}
        </Typography>
    </Stack>;
}
const getTitle = (smUp, post) => {
    if (!post || !post.id) {
        return smUp ? "Publish your completed works so that customers can find out your experience" : "New completed work";
    }
    return "Edit post information";
}
export const SpecialistProjectAdd = (props) => {
    const {
        handlePostsGet,
        post,
        onClose,
        open = false,
        specialties = []
    } = props;
    const smUp = useMediaQuery((theme) => theme.breakpoints.up('sm'));
    const { user } = useAuth();
    const [uploadProgress, setUploadProgress] = useState({});
    const [quillBlur, setQuillBlur] = useState(false);
    const isMounted = useMounted();
    const [loadingCustomer, setLoadingCustomer] = useState(false);

    const formik = useFormik({
        initialValues: {
            customerId: '',
            customerEmail: '',
            customerName: '',

            contractorId: '',
            contractorEmail: '',
            contractorName: '',

            title: '',
            startDate: new Date(),
            endDate: new Date(),
            description: '',

            specialties: [],
            finalDescription: "",
            photos: [],
            existingPhotos: [],

            address: '',
            comments: [],
            projectStatus: ProjectStatus.COMPLETED
        },
        validationSchema: Yup.object({
            title: Yup
                .string().max(120).required("Title is required"),
            customerEmail: Yup
                .string()
                .email("Incorrect mail format"),
            description: Yup.string().required('Description is required'),
        }),
        onSubmit: async (values, { setSubmitting, resetForm }) => {
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
                                    setUploadProgress((prev) => ({ ...prev, [item.file.name]: progress }));
                                },
                                (error) => {
                                    console.error('Upload failed:', error);
                                    reject(error);
                                },
                                async () => {
                                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                                    setUploadProgress((prev) => {
                                        const updated = { ...prev };
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
                        { createdAt: serverTimestamp(), ...values });
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
                if (values.customerEmail) {
                    await emailSender.notifyCustomerForFeedback(user, values.customerEmail, values.customerName, getPostSharedLink(user, postId));
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
                let contractor = post.authorId === post.contractorId ? user : null;
                if (post.contractorId) {
                    const newVar = await profileApi.get(post.contractorId);
                    if (newVar) {
                        contractor = newVar;
                    }
                }

                let customer = post.authorId === post.customerId ? user : null;
                if (post.customerId) {
                    const newVar = await profileApi.get(post.customerId);
                    if (newVar) {
                        customer = newVar;
                    }
                }


                await formik.setValues({
                    authorId: post.authorId || contractor.id,

                    customerId: post.customerId || customer && customer.id || '',
                    customerEmail: post.customerEmail || customer && customer.email || '',
                    customerName: post.customerName || customer && customer.name || '',
                    customerAvatar: post.customerAvatar || customer && customer.avatar || '', //

                    contractorId: post.contractorId || contractor && contractor.id,
                    contractorEmail: post.contractorEmail || contractor && contractor.email || '',
                    contractorName: post.contractorName || contractor && (contractor.businessName || contractor.name) || '',
                    contractorAvatar: post.contractorAvatar || contractor && contractor.avatar || '', //

                    title: post.title || '',
                    startDate: post.startDate && post.startDate.toDate() || new Date(),
                    endDate: post.endDate && post.endDate.toDate() || new Date(),
                    description: post.description || '',

                    specialties: post.specialties || [],
                    finalDescription: post.finalDescription || '',
                    photos: [],
                    existingPhotos: post.photos || [],

                    address: post.address || '',
                    comments: [],

                    postType: post.postType || "project",
                    projectStatus: post.projectStatus || ProjectStatus.COMPLETED
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
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            // ['link', 'image'],
            ['clean']
        ],
    } : {
        toolbar: [
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' },]
        ],
    },

        formats = [
            'header',
            'bold', 'italic', 'underline', 'strike', 'blockquote',
            'list', 'bullet', 'indent',
            'link', 'image'
        ],

        isPostType = post && post.postType !== "project";


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

                <Card sx={{ position: "relative" }}>
                    {/* <Backdrop
                        sx={{position: "absolute", color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1}}
                        open={formik.isSubmitting}
                    >
                        <CircularProgress color="inherit"/>
                    </Backdrop>*/}
                    <CardHeader
                        title={getTitle(smUp, post)}
                        action={(
                            <IconButton onClick={handleClose}>
                                <SvgIcon>
                                    <CloseIcon />
                                </SvgIcon>
                            </IconButton>
                        )} />
                    <CardContent>
                        <Grid
                            container
                            spacing={4}
                        // sx={{flexGrow: 1}}
                        >
                            {post && post.projectStatus !== ProjectStatus.PUBLISHED && post.projectStatus !== ProjectStatus.DRAFT &&
                                <Grid
                                    xs={12}
                                    lg={6}
                                >
                                    <Stack
                                        direction="column"
                                        spacing={2}
                                    >
                                        {getSectionLabel(1, "Customer Information")}
                                        <TextField
                                            label="Customer email"
                                            type={"email"}
                                            fullWidth
                                            name={"customerEmail"}
                                            error={formik.touched.customerEmail && Boolean(formik.errors.customerEmail)}
                                            helperText={formik.touched.customerEmail && formik.errors.customerEmail}
                                            onBlur={async (e) => {
                                                formik.handleBlur(e);
                                                const email = e.target.value.trim();

                                                let customerData;
                                                if (email) {
                                                    setLoadingCustomer(true);
                                                    try {
                                                        const querySnapshot = await profileApi.getProfileByEmail(email);
                                                        if (!querySnapshot.empty) {
                                                            customerData = querySnapshot.docs[0].data();
                                                        }
                                                    } catch (error) {
                                                        console.error("Error fetching cabinet:", error);
                                                    } finally {
                                                        await formik.setFieldValue("customerId", customerData && customerData.id || '');
                                                        await formik.setFieldValue("customerName", customerData && customerData.name || '');
                                                        await formik.setFieldValue("customerAvatar", customerData && customerData.avatar || '');
                                                        setLoadingCustomer(false);
                                                    }
                                                }
                                            }}
                                            onChange={formik.handleChange}
                                            value={formik.values.customerEmail}
                                            disabled={Boolean(formik.isSubmitting || formik.values.customerId === formik.values.authorId)}
                                            InputProps={{
                                                endAdornment: loadingCustomer ? (
                                                    <InputAdornment position="end">
                                                        <CircularProgress size={24} />
                                                    </InputAdornment>
                                                ) : null,
                                            }}
                                        />
                                        <TextField
                                            label="Customer name"
                                            fullWidth
                                            name={"customerName"}
                                            error={formik.touched.customerName && Boolean(formik.errors.customerName)}
                                            helperText={formik.touched.customerName && formik.errors.customerName}
                                            onBlur={formik.handleBlur}
                                            onChange={formik.handleChange}
                                            value={formik.values.customerName}
                                            disabled={Boolean(formik.isSubmitting || loadingCustomer || formik.values.customerId)}
                                            InputProps={{
                                                endAdornment: formik.values.customerId ? (
                                                    <InputAdornment position="end">
                                                        <Avatar
                                                            key={formik.values.customerName}
                                                            src={formik.values.customerAvatar}
                                                            sx={{
                                                                height: 32,
                                                                width: 32
                                                            }}
                                                        />
                                                    </InputAdornment>
                                                ) : null,
                                            }}
                                            InputLabelProps={{
                                                shrink: Boolean(formik.values.customerName),
                                            }}
                                        />
                                    </Stack>
                                </Grid>}

                            {post && post.projectStatus !== ProjectStatus.PUBLISHED && post.projectStatus !== ProjectStatus.DRAFT &&
                                <Grid
                                    xs={12}
                                    lg={6}
                                >
                                    <Stack
                                        direction="column"
                                        spacing={2}
                                    >
                                        {getSectionLabel(2, "Contractor Information")}
                                        <TextField
                                            label="Contractor email"
                                            type={"email"}
                                            fullWidth
                                            name={"contractorEmail"}
                                            error={formik.touched.contractorEmail && Boolean(formik.errors.contractorEmail)}
                                            helperText={formik.touched.contractorEmail && formik.errors.contractorEmail}
                                            onBlur={formik.handleBlur}
                                            onChange={formik.handleChange}
                                            value={formik.values.contractorEmail}
                                            disabled={Boolean(formik.isSubmitting || formik.values.contractorId === formik.values.authorId)}
                                            InputLabelProps={{
                                                shrink: Boolean(formik.values.contractorEmail),
                                            }}
                                        />
                                        <TextField
                                            label="Contractor name"
                                            fullWidth
                                            name={"contractorName"}
                                            error={formik.touched.contractorName && Boolean(formik.errors.contractorName)}
                                            helperText={formik.touched.contractorName && formik.errors.contractorName}
                                            onBlur={formik.handleBlur}
                                            onChange={formik.handleChange}
                                            value={formik.values.contractorName}
                                            disabled={Boolean(formik.isSubmitting || formik.values.contractorId === formik.values.authorId)}
                                            InputProps={{
                                                endAdornment: user ? (
                                                    <InputAdornment position="end">
                                                        <Avatar
                                                            key={formik.values.contractorName}
                                                            src={formik.values.contractorAvatar}
                                                            sx={{
                                                                height: 32,
                                                                width: 32
                                                            }}
                                                        />
                                                    </InputAdornment>
                                                ) : null,
                                            }}
                                            InputLabelProps={{
                                                shrink: Boolean(formik.values.contractorName),
                                            }}
                                        />

                                    </Stack>
                                </Grid>
                            }
                            {post && post.projectStatus !== ProjectStatus.PUBLISHED && post.projectStatus !== ProjectStatus.DRAFT &&
                                <Grid
                                    xs={12}
                                    lg={12}
                                >
                                    <Stack
                                        direction="column"
                                    >
                                        {getSectionLabel(3, "Project Details")}
                                    </Stack>
                                </Grid>
                            }
                            <Grid
                                xs={12}
                                lg={6}>
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
                                lg={6}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DateRangePicker
                                        disabled={formik.isSubmitting}
                                        onChange={(value, context) => {
                                            if (value[0]) {
                                                formik.setFieldValue('startDate', value[0].toDate());
                                            } else {
                                                formik.setFieldValue('startDate', null);
                                            }
                                            if (value[1]) {
                                                formik.setFieldValue('endDate', value[1].toDate());
                                            } else {
                                                formik.setFieldValue('endDate', null);
                                            }
                                        }}
                                        value={[dayjs(formik.values.startDate), dayjs(formik.values.endDate)]}
                                        localeText={{ start: 'Project start', end: 'Finish' }} />
                                </LocalizationProvider>
                            </Grid>
                            <Grid
                                xs={12}
                                lg={12}
                            >
                                <Typography
                                    sx={{ mb: 1, pl: 2 }}
                                    variant="subtitle2"
                                >
                                    Work Description (What needs to be done):
                                </Typography>
                                <QuillEditor
                                    onChange={(value) => {
                                        formik.setFieldValue('description', value);
                                        setQuillBlur(true);
                                    }}
                                    modules={modules}
                                    formats={formats}
                                    readOnly={formik.isSubmitting}
                                    placeholder="Describe the repair work in detail. For example, what needs fixing or renovating, and any specifics about the problem."
                                    sx={{ height: 200 }}
                                    value={formik.values.description}
                                />
                            </Grid>
                            {post && post.projectStatus === ProjectStatus.COMPLETED &&
                                <Grid
                                    xs={12}
                                    lg={12}
                                >
                                    <Stack
                                        direction="column"
                                        spacing={2}
                                    >
                                        {getSectionLabel(4, "Project Result Details")}
                                        <Autocomplete
                                            getOptionLabel={(option) => option && option.label}
                                            options={specialties}
                                            value={formik.values.specialties} // текущее значение из formik
                                            onChange={(event, value) => {
                                                formik.setFieldValue("specialties", value);
                                            }}
                                            onBlur={formik.handleBlur}
                                            disabled={formik.isSubmitting}
                                            name="specialties"
                                            multiple
                                            renderTags={(value, getTagProps) =>
                                                value.map((option, index) => {
                                                    const { key, ...tagProps } = getTagProps({ index });
                                                    return (
                                                        <Chip variant="outlined" label={option.label}
                                                            sx={{ height: "25px" }}
                                                            key={index}   {...tagProps} />
                                                    );
                                                })
                                            }
                                            renderInput={(params) => (
                                                <TextField {...params}
                                                    fullWidth
                                                    label="Specialties Applied in the Project"
                                                    name="specialties"
                                                />
                                            )}
                                        />
                                        <Typography
                                            sx={{ mb: 1, pl: 2 }}
                                            variant="subtitle2"
                                        >
                                            Final Work Description:
                                        </Typography>
                                        <QuillEditor
                                            onChange={(value) => {
                                                formik.setFieldValue('finalDescription', value);
                                                setQuillBlur(true);
                                            }}
                                            modules={modules}
                                            formats={formats}
                                            readOnly={formik.isSubmitting}
                                            placeholder="Summarize the completed work, including any fixes, improvements, or results achieved."
                                            sx={{ height: 200 }}
                                            value={formik.values.finalDescription}
                                        />
                                        {removeHTMLTags(formik.values.finalDescription) === '' && quillBlur && (
                                            <div
                                                style={{
                                                    color: 'red',
                                                    fontSize: '0.8rem'
                                                }}>{formik.errors.finalDescription}</div>
                                        )}

                                        {!isPostType && (
                                            <>
                                                {/*<CustomMapboxAutocomplete
                                        publicKey={mapboxConfig.apiKey}
                                        onSuggestionSelect={(result, lat, lng, text) => {
                                            formik.setFieldValue('address', result);
                                        }}
                                        disabled={formik.isSubmitting}
                                        country="us"
                                        placeholder="Enter an address"
                                    />*/}

                                            </>)}

                                        {getSectionLabel(5, "Photos/Videos")}
                                        <PhotosDropzone
                                            accept={{ 'image/*,video/*': [] }}
                                            caption={smUp ? "Attach photos or videos of the completed work for documentation purposes." : "Attach photos or videos"}
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
                                                        <video src={url} controls style={{ width: '100%' }} />
                                                    ) : (
                                                        <img src={url} alt="existing" loading="lazy" />
                                                    )}
                                                    <IconButton
                                                        style={{ position: 'absolute', top: 0, right: 0 }}
                                                        onClick={() => handleRemoveExistingPhotos(url)}
                                                    >
                                                        <HighlightOffIcon />
                                                    </IconButton>
                                                </ImageListItem>
                                            ))}

                                            {formik.values.photos.map((item) => (
                                                <ImageListItem key={item.preview} sx={{}}>
                                                    {item.type === 'image' ? (
                                                        <img src={item.preview} alt="preview" loading="lazy" />
                                                    ) : (
                                                        <video src={item.preview} controls style={{ width: '100%' }} />
                                                    )}
                                                    <IconButton
                                                        style={{ position: 'absolute', top: 0, right: 0 }}
                                                        onClick={() => handleRemovePhotos(item.preview)}
                                                    >
                                                        <HighlightOffIcon />
                                                    </IconButton>
                                                    {uploadProgress[item.file?.name] !== undefined && (
                                                        <LinearProgress variant="determinate"
                                                            value={uploadProgress[item.file.name]} />
                                                    )}
                                                </ImageListItem>
                                            ))}
                                        </ImageList>
                                    </Stack>
                                </Grid>}
                            <Grid
                                xs={12}
                                lg={12}
                            >
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
                                            {formik.isSubmitting ? <CircularProgress size={24} /> : 'Update Post'}
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
