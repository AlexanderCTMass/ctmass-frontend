import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import VideocamIcon from '@mui/icons-material/Videocam';
import {MobileDatePicker} from '@mui/x-date-pickers';
import Autocomplete from '@mui/material/Autocomplete';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import {
    Avatar,
    Button,
    Card,
    CardContent,
    Chip,
    IconButton,
    ImageList,
    ImageListItem,
    OutlinedInput,
    Stack,
    SvgIcon,
    TextField,
    useMediaQuery
} from '@mui/material';
import {getInitials} from 'src/utils/get-initials';
import * as React from 'react';
import {useCallback, useRef, useState} from 'react';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import {useFormik} from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import {useAuth} from "../../../hooks/use-auth";
import {getDownloadURL, ref, uploadBytes} from "firebase/storage";
import {storage} from "../../../libs/firebase";
import {fileToBase64} from "../../../utils/file-to-base64";

const icon = <CheckBoxOutlineBlankIcon fontSize="small"/>;
const checkedIcon = <CheckBoxIcon fontSize="small"/>;

export const ServicePostAdd = (props) => {
    const {onSubmit, ...other} = props;
    const {user} = useAuth();
    const smUp = useMediaQuery((theme) => theme.breakpoints.up('sm'));
    const [photos, setPhotos] = useState([]);

    let services = [];
    if (user.specialties) {
        user.specialties.map((spec) => {
            if (spec.services) {
                spec.services.map((service) => {
                    services.push({...service, parent: spec.label});
                })

            }
        });
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
        const storageRef = ref(storage, '/photos/' + user.id + '/' + photos[i].file.name);
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
            services: [],
            location: '',
            description: '',
            likeUserIds: [],
            startDate: new Date(),
            endDate: new Date(),
            photos: [],
            userId: user.id
        },
        validationSchema: Yup.object().shape({
            location: Yup.string().required("Choose location please"),
            description: Yup.string().required("Choose location please"),
        }),
        onSubmit: async (values, helpers) => {
            try {
                let list = [];
                recu(photos, 0, list, (newList) => {
                     values.photos = newList;
                    onSubmit(values);
                    helpers.setStatus({success: true});
                    helpers.setSubmitting(false);
                    toast.success('Post updated');
                })

            } catch (err) {
                values.services.length === 0 ? toast.error('Service is required') :
                    values.photos.length === 0 ? toast.error('Photo is required') :
                        toast.error('Something went wrong!');
                console.error(err);
                helpers.setStatus({success: false});
                helpers.setErrors({submit: err.message});
                helpers.setSubmitting(false);
            }
        }
    });

    return (
        <form
            onSubmit={formik.handleSubmit}
            {...other}>
            <Card {...props}>
                <CardContent>
                    <Stack
                        alignItems="flex-start"
                        direction="row"
                        spacing={2}
                    >
                        <Avatar
                            src={user.avatar}
                            sx={{
                                height: 40,
                                width: 40
                            }}
                        >
                            {getInitials(user.name)}
                        </Avatar>
                        <Stack
                            spacing={3}
                            sx={{flexGrow: 1}}
                        >
                            <Autocomplete
                                multiple
                                disablePortal
                                id="combo-box-demo"
                                options={services.filter(service => !formik.values.services.includes(service.name))}
                                filterSelectedOptions
                                disableCloseOnSelect
                                groupBy={(service) => service.parent}
                                getOptionLabel={(option) => option.name}
                                defaultValue={formik.values.services}
                                onBlur={formik.handleBlur}
                                onChange={(e, value) => {
                                    formik.setFieldValue('services', value);
                                }}
                                renderTags={(tagValue, getTagProps) =>
                                    tagValue.map((option, index) => (
                                        <Chip
                                            label={option.name}
                                            {...getTagProps({index})}
                                        />
                                    ))
                                }
                                renderInput={(params) => <TextField {...params} label="Service"/>}
                            />
                            <TextField
                                fullWidth
                                label="Location"
                                error={!!(formik.touched.location && formik.errors.location)}
                                helperText={formik.touched.location && formik.errors.location}
                                name="location"
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                value={formik.values.location}
                            />
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
                                    error={!!(formik.touched.startDate && formik.errors.startDate)}
                                    helperText={formik.touched.startDate && formik.errors.startDate}
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
                                    error={!!(formik.touched.endDate && formik.errors.endDate)}
                                    helperText={formik.touched.endDate && formik.errors.endDate}
                                    name="endDate"
                                    onBlur={formik.handleBlur}
                                    value={formik.values.endDate}
                                />
                            </Stack>
                            <Stack
                                alignItems="center"
                                direction="row"
                                justifyContent="space-between"
                                spacing={3}
                            >
                                <ImageList cols={3} gap={8}>
                                    {photos.map((item) => (
                                        <ImageListItem variant="quilted" key={item.img}>
                                            <img
                                                src={`${item.img}`}
                                                srcSet={`${item.img}`}
                                                // alt={item.title}
                                                loading="lazy"
                                            />
                                        </ImageListItem>
                                    ))}
                                </ImageList>

                            </Stack>

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
                                                <PhotoCameraIcon/>
                                            </SvgIcon>
                                        </IconButton>
                                        <input
                                            hidden
                                            ref={fileInputRef}
                                            type="file"
                                            multiple
                                            onChange={handleAddAttachment}
                                        />
                                        <IconButton>
                                            <SvgIcon>
                                                <VideocamIcon/>
                                            </SvgIcon>
                                        </IconButton>
                                    </Stack>
                                )}
                                <div>
                                    <Button variant="contained" disabled={formik.isSubmitting}
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
