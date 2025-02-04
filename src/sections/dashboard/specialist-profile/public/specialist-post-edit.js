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
import toast from "react-hot-toast";
import * as React from "react";
import {useCallback, useEffect, useRef, useState} from "react";
import {fileToBase64} from "../../../../utils/file-to-base64";
import {getDownloadURL, ref, uploadBytes} from "firebase/storage";
import {firestore, storage} from "../../../../libs/firebase";
import {v4 as uuidv4} from 'uuid';
import {MobileDatePicker} from "@mui/x-date-pickers";
import {AddressAutoComplete} from "src/components/address/AddressAutoComplete";
import {QuillEditor} from "../../../../components/quill-editor";
import CloseIcon from "@mui/icons-material/Close";
import {EMAIL_REGEXP, PHONE_NUMBER_REGEXP} from "../../../../utils/regexp";
import {profileApi} from "../../../../api/profile";
import {addDoc, collection, doc, serverTimestamp, updateDoc} from "firebase/firestore";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {DateRangePicker} from "@mui/x-date-pickers-pro";
import dayjs from "dayjs";
import {MultiSelect} from "../../../../components/multi-select";
import {emailSender} from "../../../../libs/email-sender";

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


export const SpecialistPostEdit = (props) => {
    const {
        handlePostsGet,
        post,
        onClose,
        open = false, specialties = []
    } = props;
    const {user} = useAuth();
    const smUp = useMediaQuery((theme) => theme.breakpoints.up('sm'));
    const [photos, setPhotos] = useState(post.photos);
    const [deletedPhotos, setDeletedPhotos] = useState([]);
    const [location, setLocation] = useState(null);
    const [content, setContent] = useState(post.description);
    const [customerEmail, setCustomerEmail] = useState(post.customerEmail);
    const [customerEmailError, setCustomerEmailError] = useState(false);
    const [startDate, setStartDate] = useState(post.startDate && post.startDate.toDate());
    const [endDate, setEndDate] = useState(post.endDate && post.endDate.toDate());
    const [submit, setSubmit] = useState(false);
    const submitRef = useRef(submit);
    const [selectSpecialties, setSelectSpecialties] = useState(post.specialtiesId);
    const [title, setTitle] = useState(post.title);
    const [titleError, setTitleError] = useState(false);

    useEffect(() => {
        submitRef.current = submit; // Обновляем ref при изменении состояния
    }, [submit]);

    useEffect(() => {
        setDeletedPhotos([]);
        setPhotos(post.photos && post.photos.map((p) => ({img: p, upload: true})));
        setTitle(post.title);
        setContent(post.description);
        setCustomerEmail(post.customerEmail);
        setStartDate(post.startDate && post.startDate.toDate());
        setEndDate(post.endDate && post.endDate.toDate());
        setLocation(post.location);
        setSelectSpecialties(post.specialtiesId);

    }, [post])


    const handleContentChange = (value) => {
        setContent(value);
    };

    const handleSubmit = () => {
        setSubmit(true);
        try {
            const savePost = async (newList) => {
                let values = {
                    title: title || '',
                    description: content || '',
                    customerEmail: customerEmail || '',
                    userProfilePage: user.profilePage,
                    startDate: startDate,
                    endDate: endDate,
                    location: location,
                    photos: [...photos.filter((p) => p.upload).map((p) => p.img), ...newList],
                    specialtiesId: selectSpecialties || [],
                    specialtiesLabel: selectSpecialties ? specialties.filter((spec) => selectSpecialties.includes(spec.id)).map((spec) => spec.label) : []
                };

                if (values.customerEmail && values.customerEmail !== post.customerEmail) {
                    let customer = await profileApi.getUserByEmail(values.customerEmail);
                    if (customer) {
                        values.customerId = customer.id;
                        values.customerName = customer.businessName;
                        values.customerProfilePage = customer.profilePage;
                        values.customerAvatar = customer.avatar;
                    }
                    if (values.customerEmail) {
                        await emailSender.notifyCustomerForFeedback(user, values.customerEmail, getPostSharedLink(user, post.id));
                    }
                }
                await updateDoc(doc(firestore, "specialistPosts", post.id), values);
                handlePostsGet();
                toast.success((isPostType ? "Post " : "Project ") + ' updated');
                handleClose();
            };

            let list = [];
            const newPhotos = photos.filter((p) => !p.upload);
            if (newPhotos.length > 0) {
                recu(newPhotos, 0, list, savePost)
            } else {
                savePost([]);
            }

        } catch (err) {
            toast.error('Something went wrong!');
            console.error(err);
        } finally {
            setSubmit(false);
        }
    };

    const handleCustomerEmailChange = (event) => {
        const value = event.target.value;
        setCustomerEmail(value);
        setCustomerEmailError(!EMAIL_REGEXP.test(value));
    }

    const handleTitleChange = (event) => {
        const value = event.target.value;
        setTitle(value);
        setTitleError(value.length > 120);
    }

    const fileInputRef = useRef(null);
    const handleAttach = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleAddAttachment = async (e) => {
        try {
            if (e.target.files) {
                let files = [];
                for (let i = 0; i < e.target.files.length; i++) {
                    if (!photos.filter((p) => !p.upload).map((p) => p.file.name).includes(e.target.files[i].name))
                        files.push({
                            file: e.target.files[i],
                            img: await fileToBase64(e.target.files[i]),
                            upload: false
                        });
                }
                setPhotos(prevState => [...prevState, ...files]);
            }
        } catch (err) {
            console.error(err);
            toast.error('Something went wrong!');

        }
    }

    const recu = (photos, i, list, futureSave) => {
        const type = photos[i].file.type;
        if (type.startsWith("video")) {
            const storageRef = ref(storage, '/videos/' + user.id + '/' + uuidv4() + "_" + photos[i].file.name);
            uploadBytes(storageRef, photos[i].file).then((snapshot) => {
                getDownloadURL(storageRef).then((url) => {
                    list.push(url);
                    toast.success('Video ' + (i + 1) + ' uploaded');
                    if ((i + 1) < photos.length) {
                        recu(photos, i + 1, list, futureSave);
                    } else {
                        futureSave(list);
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
                        recu(photos, i + 1, list, futureSave);
                    } else {
                        futureSave(list);
                    }
                })
            });
        }
    }

    const handleClose = () => {
        setLocation(null);
        setPhotos([]);
        setContent('');
        onClose();
    }

    const isPostType = post.postType === "post";

    const MODULES = smUp ? {
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
            <Card sx={{position: "relative"}}>
                <Backdrop
                    sx={{position: "absolute", color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1}}
                    open={submitRef.current}
                >
                    <CircularProgress color="inherit"/>
                </Backdrop>
                <CardHeader
                    title={isPostType ? "Edit post" : "Edit completed work"}
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
                        <TextField
                            label="Title"
                            name={"title"}
                            error={titleError}
                            helperText={titleError && "Title is required"}
                            // onBlur={formik.handleBlur}
                            onChange={handleTitleChange}
                            value={title}
                        />
                        {!isPostType && (
                            <>
                                <TextField
                                    label="Customer email"
                                    type={"email"}
                                    name={"customerEmail"}
                                    error={customerEmailError}
                                    helperText={customerEmailError && "Incorrect email"}
                                    // onBlur={formik.handleBlur}
                                    onChange={handleCustomerEmailChange}
                                    value={customerEmail}
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
                            modules={MODULES}
                            error={true}
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
                                                    setStartDate(value[0].toDate());
                                                } else {
                                                    setStartDate(null);
                                                }
                                                if (value[1]) {
                                                    setEndDate(value[1].toDate());
                                                } else {
                                                    setEndDate(null);
                                                }
                                            }}
                                            value={[dayjs(startDate), dayjs(endDate)]}
                                            localeText={{start: 'Project start', end: 'Finish'}}/>
                                    </LocalizationProvider>
                                </Stack>
                                {/*<Stack
                                    alignItems="center"
                                    direction="row"
                                    spacing={3}
                                >
                                    <MobileDatePicker
                                        label="Start Date"
                                        onChange={(newDate) => {
                                            setStartDate(newDate);
                                        }}
                                        renderInput={(inputProps) => (
                                            <TextField {...inputProps} />
                                        )}
                                        // error={!!(formik.touched.startDate && formik.errors.startDate)}
                                        // helperText={formik.touched.startDate && formik.errors.startDate}
                                        name="startDate"
                                        // onBlur={formik.handleBlur}
                                        value={startDate}
                                    />
                                    <MobileDatePicker
                                        label="End Date"
                                        onChange={(newDate) => {
                                            setEndDate(newDate);
                                        }}
                                        renderInput={(inputProps) => (
                                            <TextField {...inputProps} />
                                        )}
                                        // error={!!(formik.touched.endDate && formik.errors.endDate)}
                                        // helperText={formik.touched.endDate && formik.errors.endDate}
                                        name="endDate"
                                        // onBlur={formik.handleBlur}
                                        value={endDate}
                                    />
                                </Stack>*/}
                            </>)}
                        {photos &&
                            (<ImageList cols={5} gap={8}>
                                {photos.map((item) => (
                                    <ImageListItem variant="quilted" key={item}>
                                        <img
                                            src={`${item.img}`}
                                            srcSet={`${item.img}`}
                                            // alt={item.title}
                                            loading="lazy"
                                        />
                                        <Tooltip title={"delete"}>
                                            <HighlightOffIcon
                                                sx={{
                                                    position: "absolute",
                                                    top: 0,
                                                    right: 0,
                                                    cursor: "pointer"
                                                }}
                                                onClick={() => {
                                                    console.log(deletedPhotos);
                                                    setDeletedPhotos((prev) => {
                                                        return [...prev, item];
                                                    });
                                                    setPhotos((prev) => {
                                                        return prev.filter((photo) => photo.img !== item.img);
                                                    });
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
                                        onClick={handleSubmit}
                                        disabled={submit || removeHTMLTags(content) === ''}>
                                    Post
                                </Button>
                            </div>
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>
        </Dialog>
    );
};
