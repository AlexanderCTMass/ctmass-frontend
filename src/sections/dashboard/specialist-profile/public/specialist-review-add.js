import Image01Icon from '@untitled-ui/icons-react/build/esm/Image01';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import {
    Avatar,
    Backdrop,
    Button,
    Card,
    CardContent,
    CardHeader,
    CircularProgress,
    IconButton,
    ImageList,
    ImageListItem,
    OutlinedInput,
    Rating,
    Stack,
    SvgIcon,
    Tooltip,
    Typography,
    useMediaQuery
} from '@mui/material';
import {getInitials} from 'src/utils/get-initials';
import {useAuth} from "src/hooks/use-auth";
import {useFormik} from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import * as React from "react";
import {useCallback, useRef, useState} from "react";
import {fileToBase64} from "../../../../utils/file-to-base64";
import {getDownloadURL, ref, uploadBytes} from "firebase/storage";
import {firestore, storage} from "../../../../libs/firebase";
import {addDoc, collection, serverTimestamp} from "firebase/firestore";
import {v4 as uuidv4} from 'uuid';

const labels1: { [index: string]: string } = {
    0: '',
    1: 'Got more problems than benefits',
    2: 'I`ve got couple major problems',
    3: 'Acceptable',
    4: 'Good, but I`ve got a couple problems',
    5: 'Perfect',
};

const labels2: { [index: string]: string } = {
    0: 'Failure',
    1: 'Got more problems than benefits',
    2: 'I`ve got couple major problems',
    3: 'Acceptable',
    4: 'Good, but I`ve got a couple problems',
    5: 'Perfect',
};
export const SpecialistReviewAdd = (props) => {
    const {handlePostsGet, profile, ...other} = props;
    const {user} = useAuth();
    const smUp = useMediaQuery((theme) => theme.breakpoints.up('sm'));
    const [photos, setPhotos] = useState([]);
    const [rating, setRating] = useState(0);
    const [ratingHover, setRatingHover] = useState(-1);
    const [submi, setSubmi] = useState(false);

    const fileInputRef = useRef(null);
    const handleAttach = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleAddAttachment = async (e) => {
        try {
            if (e.target.files) {
                let files = [];
                for (let i = 0; i < e.target.files.length; i++) {
                    files.push({file: e.target.files[i], img: await fileToBase64(e.target.files[i])});
                }
                setPhotos(files);
            }
        } catch (err) {
            console.error(err);
            toast.error('Something went wrong!');

        }
    }

    const recu = (photos, i, list, f) => {
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


    const formik = useFormik({
        initialValues: {
            description: '',
            photos: [],
            comments: [],
            userId: profile.id,
            authorId: user.id,
            authorName: user.businessName || user.name,
            authorAvatar: user.avatar,
            rating: 0,
            type: 'review'
        },
        validationSchema: Yup.object({
            description: Yup
                .string()
                .max(1000)
                .required('Message is required')
        }),
        onSubmit: async (values, helpers) => {
            setSubmi(true);
            values.rating = rating;
            try {
                const savePost = async (newList) => {
                    values.photos = newList;

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
                <CardHeader title="Leave a review about cooperation with a specialist"/>
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
                                height: 40,
                                width: 40
                            }}
                        >
                            {getInitials(user.businessName || user.name)}
                        </Avatar>
                        <Stack
                            spacing={3}
                            sx={{flexGrow: 1}}
                        >
                            <div>
                                <Typography component={"legend"} sx={{m: 0, p: 0}}>
                                    Evaluate the quality of the work done:
                                </Typography>
                                <Stack direction={"row"} spacing={2} alignItems={"center"}>
                                    <Rating
                                        size="large"
                                        value={rating}
                                        onChange={(e, v) => {
                                            setRating(v)
                                        }}
                                        onChangeActive={(e, v) => {
                                            setRatingHover(v)
                                        }}
                                    />
                                    {ratingHover > 0 ?
                                        (<Typography color={"textSecondary"} component={"legend"}>
                                            {labels1[ratingHover]}
                                        </Typography>) : (<Typography component={"legend"}>
                                            {labels1[rating]}
                                        </Typography>)}
                                </Stack>
                            </div>

                            <OutlinedInput
                                fullWidth
                                multiline
                                placeholder="Your feedback"
                                rows={3}
                                error={!!(formik.touched.description && formik.errors.description)}
                                helperText={formik.touched.description && formik.errors.description}
                                name="description"
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                value={formik.values.description}
                            />

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
                            <Stack
                                alignItems="center"
                                direction="row"
                                justifyContent="space-between"
                                spacing={3}
                            >
                                {smUp && (
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
                                )}
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
