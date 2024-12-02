import Image01Icon from '@untitled-ui/icons-react/build/esm/Image01';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import {
    Backdrop,
    Button,
    Card,
    CardContent,
    CardHeader,
    CircularProgress,
    Dialog,
    IconButton,
    ImageList,
    ImageListItem,
    Stack,
    SvgIcon,
    TextField,
    Tooltip,
    useMediaQuery
} from '@mui/material';
import {useAuth} from "src/hooks/use-auth";
import {useFormik} from "formik";
import toast from "react-hot-toast";
import * as React from "react";
import {useCallback, useRef, useState} from "react";
import {fileToBase64} from "../../../../utils/file-to-base64";
import {getDownloadURL, ref, uploadBytes} from "firebase/storage";
import {firestore, storage} from "../../../../libs/firebase";
import {addDoc, collection, serverTimestamp} from "firebase/firestore";
import {v4 as uuidv4} from 'uuid';
import {AddressAutoComplete} from "../../account/general/AddressAutoComplete";
import {QuillEditor} from "../../../../components/quill-editor";
import CloseIcon from "@mui/icons-material/Close";
import * as Yup from "yup";
import {profileApi} from "../../../../api/profile";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DateRangePicker} from "@mui/x-date-pickers-pro";
import dayjs from "dayjs";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {MultiSelect} from "../../../../components/multi-select";
import {emailSender} from "../../../../libs/email-sender";
import {useSettings} from "../../../../hooks/use-settings";

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


export const SpecialistPostAdd = (props) => {
    const {
        handlePostsGet,
        postType = "post",
        onClose,
        open = false, specialties = [],
        ...other
    } = props;
    const settings = useSettings();

    const {user} = useAuth();
    const smUp = useMediaQuery((theme) => theme.breakpoints.up('sm'));
    const [photos, setPhotos] = useState([]);
    const [videos, setVideos] = useState([]);
    const [location, setLocation] = useState(null);
    const [addCustomerOpen, setAddCustomerOpen] = useState(false);

    const [content, setContent] = useState('');
    const [selectSpecialties, setSelectSpecialties] = useState([]);

    const handleContentChange = (value) => {
        setContent(value);
    };

    const handleAddCustomerOpen = () => {
        setAddCustomerOpen(true);
    };
    const handleAddCustomerClose = () => {
        setAddCustomerOpen(false);
    };

    const fileInputRef = useRef(null);
    const handleAttach = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleAddAttachment = async (e) => {
        try {
            if (e.target.files) {
                let files = [];
                for (let i = 0; i < e.target.files.length; i++) {
                    debugger
                    if (!photos.map((p) => p.file.name).includes(e.target.files[i].name))
                        files.push({file: e.target.files[i], img: await fileToBase64(e.target.files[i])});
                }
                setPhotos(prevState => [...prevState, ...files]);
            }
        } catch (err) {
            console.error(err);
            toast.error('Something went wrong!');

        }
    }

    const recu = (photos, i, list, f) => {
        const type = photos[i].file.type;
        if (type.startsWith("video")) {
            const storageRef = ref(storage, '/videos/' + user.id + '/' + uuidv4() + "_" + photos[i].file.name);
            uploadBytes(storageRef, photos[i].file).then((snapshot) => {
                getDownloadURL(storageRef).then((url) => {
                    list.push(url);
                    toast.success('Video ' + (i + 1) + ' uploaded');
                    if ((i + 1) < photos.length) {
                        recu(photos, i + 1, list, f);
                    } else {
                        f(list);
                    }
                })
            });
        } else {
            const storageRef = ref(storage, '/photos/' + user.id + '/' + uuidv4() + "_" + photos[i].file.name);
            uploadBytes(storageRef, photos[i].file).then((snapshot) => {
                getDownloadURL(storageRef).then((url) => {
                    list.push(url);
                    toast.success('Photo ' + (i + 1) + ' uploaded');
                    if ((i + 1) < photos.length) {
                        recu(photos, i + 1, list, f);
                    } else {
                        f(list);
                    }
                })
            });
        }
    }

    const handleClose = () => {
        formik.resetForm();
        setLocation(null);
        setPhotos([]);
        setContent('');
        onClose();
    }

    const isPostType = postType === "post";


    const formik = useFormik({
        initialValues: {
            title: '',
            description: '',
            photos: [],
            comments: [],
            userId: user.id,
            authorId: user.id,
            userProfilePage: user.profilePage,
            customerEmail: '',
            startDate: new Date(),
            endDate: new Date(),
            authorName: user.businessName || user.name,
            authorAvatar: user.avatar,
        },
        validationSchema: Yup.object({
            customerEmail: Yup
                .string()
                .email("Incorrect")
        }),
        onSubmit: async (values, helpers) => {
            try {
                const savePost = async (newList) => {
                    if (values.customerEmail) {
                        let customer = await profileApi.getUserByEmail(values.customerEmail);
                        if (customer) {
                            values.customerId = customer.id;
                            values.customerName = customer.businessName;
                            values.customerProfilePage = customer.profilePage;
                            values.customerAvatar = customer.avatar;
                        }
                    }
                    values.rating = 0;
                    values.photos = newList;
                    values.location = location;
                    values.description = content;
                    if (selectSpecialties) {
                        values.specialtiesId = selectSpecialties;
                        values.specialtiesLabel = specialties.filter((spec) => selectSpecialties.includes(spec.id)).map((spec) => spec.label);
                    }
                    values.postType = isPostType ? "post" : "project";
                    console.log(values);
                    const docRef = await addDoc(collection(firestore, "specialistPosts"), {createdAt: serverTimestamp(), ...values});

                    if (values.customerEmail) {
                        emailSender.notifyCustomerForFeedback(user, values.customerEmail, getPostSharedLink(user, docRef.id)).then(() => {
                            toast.success("Mail send successfully!");
                        }).catch((error) => {
                            toast.error("Error mail send!");
                            console.error(error);
                        });
                    }
                    helpers.setStatus({success: true});
                    helpers.setSubmitting(false);
                    handlePostsGet();
                    toast.success((isPostType ? "Post " : "Project ") + ' created');
                    handleClose();
                };

                let list = [];
                if (photos.length > 0) {
                    recu(photos, 0, list, savePost)
                } else {
                    savePost([]);
                }

            } catch (err) {
                toast.error('Something went wrong!');
                console.error(err);
                helpers.setStatus({success: false});
                helpers.setErrors({submit: err.message});
                helpers.setSubmitting(false);
            }
        }
    });
    let modules = smUp ? {
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
            <form
                onSubmit={formik.handleSubmit}
                {...other}>
                <Card sx={{position: "relative"}}>
                    <Backdrop
                        sx={{position: "absolute", color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1}}
                        open={formik.isSubmitting}
                    >
                        <CircularProgress color="inherit"/>
                    </Backdrop>
                    <CardHeader
                        title={isPostType ? (smUp ? "Publish any post, share an idea, or just your mood" : "New post") : (smUp ? "Publish your completed works so that customers can find out your experience" : "New completed work")}
                        action={(
                            <IconButton onClick={handleClose}>
                                <SvgIcon>
                                    <CloseIcon/>
                                </SvgIcon>
                            </IconButton>
                        )}/>
                    <CardContent>
                        <Stack
                            spacing={3}
                            // sx={{flexGrow: 1}}
                        >
                            {!isPostType && (
                                <>
                                    <TextField
                                        label="Customer email"
                                        type={"email"}
                                        name={"customerEmail"}
                                        error={!!(formik.touched.customerEmail && formik.errors.customerEmail)}
                                        helperText={formik.touched.customerEmail && formik.errors.customerEmail}
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        value={formik.values.customerEmail}
                                    />
                                    <MultiSelect
                                        label="Specialties"
                                        options={specialties.filter((spec) => spec).map((spec) => ({
                                            label: spec.label,
                                            value: spec.id
                                        }))}
                                        value={selectSpecialties}
                                        onChange={(newValue) => {
                                            setSelectSpecialties(newValue)
                                        }}
                                    />
                                </>
                            )}
                            <QuillEditor
                                onChange={handleContentChange}
                                modules={modules}
                                formats={formats}
                                placeholder="Describe the main points of the order, the difficulties and how they were overcome"
                                sx={{height: 300}}
                                value={content}
                            />
                            {!isPostType && (
                                <>
                                    <AddressAutoComplete location={location}
                                                         handleSuggestionClick={(suggest) => {
                                                             setLocation(suggest);
                                                         }}/>
                                    {/* {location && (
                                        <div id="minimap-container" style={{height: "300px"}}>
                                            <AddressMinimap
                                                feature={location}
                                                show={location}
                                                satelliteToggle
                                                // canAdjustMarker
                                                accessToken={mapboxConfig.apiKey}
                                                style={{height: "300px"}}
                                                // theme={mapStyle}
                                            />
                                        </div>)}*/}
                                    <Stack
                                        alignItems="center"
                                        direction="row"
                                        spacing={3}
                                    >
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DateRangePicker
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
                                                localeText={{start: 'Project start', end: 'Finish'}}/>
                                        </LocalizationProvider>
                                    </Stack>
                                </>)}
                            {photos &&
                                (<ImageList cols={5} gap={8}>
                                    {photos.map((item) => (
                                        <ImageListItem variant="quilted" key={item.img}>
                                            <img
                                                src={`${item.img}`}
                                                srcSet={`${item.img}`}
                                                // alt={item.title}
                                                loading="lazy"
                                            />
                                            <Tooltip title={"delete"}>
                                                <HighlightOffIcon
                                                    sx={{position: "absolute", top: 0, right: 0, cursor: "pointer"}}
                                                    onClick={() => {
                                                        setPhotos((prev) => {
                                                            return prev.filter((photo) => photo.img !== item.img);
                                                        })
                                                    }}
                                                />
                                            </Tooltip>
                                        </ImageListItem>
                                    ))}
                                </ImageList>)
                            }
                            {videos &&
                                (<ImageList cols={5} gap={8}>
                                    {videos.map((item) => (
                                        <ImageListItem variant="quilted" key={item.img}>
                                            <img
                                                src={`${item.img}`}
                                                srcSet={`${item.img}`}
                                                // alt={item.title}
                                                loading="lazy"
                                            />
                                            <Tooltip title={"delete"}>
                                                <HighlightOffIcon
                                                    sx={{position: "absolute", top: 0, right: 0, cursor: "pointer"}}
                                                    onClick={() => {
                                                        setVideos((prev) => {
                                                            return prev.filter((photo) => photo.img !== item.img);
                                                        })
                                                    }}
                                                />
                                            </Tooltip>
                                        </ImageListItem>
                                    ))}
                                </ImageList>)
                            }
                            <Stack
                                alignItems="center"
                                direction="row"
                                justifyContent="space-between"
                                spacing={3}
                            >

                                <Stack
                                    alignItems="center"
                                    direction="row"
                                    spacing={1}
                                >
                                    <IconButton onClick={handleAttach}>
                                        <SvgIcon>
                                            <Image01Icon/>
                                        </SvgIcon>
                                    </IconButton>
                                    <input
                                        hidden
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        onChange={handleAddAttachment}
                                    />
                                </Stack>

                                <div>
                                    <Button variant="contained"
                                            disabled={formik.isSubmitting || removeHTMLTags(content) === ''}
                                            type="submit">
                                        Post
                                    </Button>
                                </div>
                            </Stack>
                        </Stack>
                    </CardContent>
                </Card>
            </form>
        </Dialog>
    );
};
