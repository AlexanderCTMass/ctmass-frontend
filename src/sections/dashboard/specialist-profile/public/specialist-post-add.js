import Attachment01Icon from '@untitled-ui/icons-react/build/esm/Attachment01';
import FaceSmileIcon from '@untitled-ui/icons-react/build/esm/FaceSmile';
import Image01Icon from '@untitled-ui/icons-react/build/esm/Image01';
import Link01Icon from '@untitled-ui/icons-react/build/esm/Link01';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import {
    Avatar, Backdrop,
    Button,
    Card,
    CardContent, CardHeader, CircularProgress,
    IconButton, ImageList, ImageListItem,
    OutlinedInput,
    Stack,
    SvgIcon, TextField, Tooltip,
    useMediaQuery
} from '@mui/material';
import {useMockedUser} from 'src/hooks/use-mocked-user';
import {getInitials} from 'src/utils/get-initials';
import {useAuth} from "src/hooks/use-auth";
import {useFormik} from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import {useCallback, useRef, useState} from "react";
import {fileToBase64} from "../../../../utils/file-to-base64";
import {getDownloadURL, ref, uploadBytes} from "firebase/storage";
import {firestore, storage} from "../../../../libs/firebase";
import * as React from "react";
import {addDoc, collection, serverTimestamp} from "firebase/firestore";
import {v4 as uuidv4} from 'uuid';
import {MobileDatePicker} from "@mui/x-date-pickers";
import {AddressAutoComplete} from "../../account/general/AddressAutoComplete";

export const SpecialistPostAdd = (props) => {
    const {handlePostsGet, ...other} = props;
    const {user} = useAuth();
    const smUp = useMediaQuery((theme) => theme.breakpoints.up('sm'));
    const [photos, setPhotos] = useState([]);
    const [videos, setVideos] = useState([]);
    const [submi, setSubmi] = useState(false);
    const [location, setLocation] = useState(null);

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


    const formik = useFormik({
        initialValues: {
            description: '',
            photos: [],
            comments: [],
            userId: user.id,
            authorId: user.id,
            startDate: new Date(),
            endDate: new Date(),
            authorName: user.businessName || user.name,
            authorAvatar: user.avatar,
        },
        validationSchema: Yup.object({
            description: Yup
                .string()
                .max(1000)
                .required('Message is required')
        }),
        onSubmit: async (values, helpers) => {
            setSubmi(true);
            try {
                console.log("sdfsdfsd");

                const savePost = async (newList) => {
                    values.photos = newList;
                    values.location = location;

                    await addDoc(collection(firestore, "specialistPosts"), {createdAt: serverTimestamp(), ...values});
                    helpers.setStatus({success: true});
                    helpers.setSubmitting(false);
                    handlePostsGet();
                    toast.success('Post created');
                    setSubmi(false);
                    formik.resetForm();
                    setPhotos([]);
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
                setSubmi(false);
            }
        }
    });


    return (
        <form
            onSubmit={formik.handleSubmit}
            {...other}>
            <Card sx={{position: "relative"}}>
                <Backdrop
                    sx={{position: "absolute", color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1}}
                    open={submi}
                >
                    <CircularProgress color="inherit"/>
                </Backdrop>
                <CardHeader title="Publish your completed works so that customers can find out your experience"/>
                <CardContent>
                    <Stack
                        alignItems="flex-start"
                        direction="row"
                        spacing={2}
                    >
                        <Avatar
                            src={user.avatar}
                            sx={{
                                display: {
                                    md: "flex",
                                    xs: "none"
                                },
                                height: {
                                    md: 40,
                                    xs: 20
                                },
                                width: {
                                    md: 40,
                                    xs: 20
                                }
                            }}
                        >
                            {getInitials(user.name)}
                        </Avatar>
                        <Stack
                            spacing={3}
                            sx={{flexGrow: 1}}
                        >
                            <AddressAutoComplete location={location}
                                                 handleSuggestionClick={(suggest) => {
                                                     setLocation(suggest);
                                                 }}/>

                            <OutlinedInput
                                fullWidth
                                multiline
                                placeholder="Describe the main points of the order, the difficulties and how they were overcome"
                                rows={3}
                                error={!!(formik.touched.description && formik.errors.description)}
                                helperText={formik.touched.description && formik.errors.description}
                                name="description"
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                value={formik.values.description}
                            />
                            <Stack
                                alignItems="center"
                                direction="row"
                                spacing={3}
                            >
                                <MobileDatePicker
                                    label="Start Date"
                                    onChange={(newDate) => {
                                        formik.setFieldValue('startDate', newDate);
                                    }}
                                    renderInput={(inputProps) => (
                                        <TextField {...inputProps} />
                                    )}
                                    // error={!!(formik.touched.startDate && formik.errors.startDate)}
                                    // helperText={formik.touched.startDate && formik.errors.startDate}
                                    name="startDate"
                                    onBlur={formik.handleBlur}
                                    value={formik.values.startDate}
                                />
                                <MobileDatePicker
                                    label="End Date"
                                    onChange={(newDate) => {
                                        formik.setFieldValue('endDate', newDate);
                                    }}
                                    renderInput={(inputProps) => (
                                        <TextField {...inputProps} />
                                    )}
                                    // error={!!(formik.touched.endDate && formik.errors.endDate)}
                                    // helperText={formik.touched.endDate && formik.errors.endDate}
                                    name="endDate"
                                    onBlur={formik.handleBlur}
                                    value={formik.values.endDate}
                                />
                            </Stack>
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
                                    <Button variant="contained" disabled={submi}
                                            type="submit">
                                        Post
                                    </Button>
                                </div>
                            </Stack>
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>
        </form>
    );
};
