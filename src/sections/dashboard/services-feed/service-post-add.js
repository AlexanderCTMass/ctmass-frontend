import Attachment01Icon from '@untitled-ui/icons-react/build/esm/Attachment01';
import FaceSmileIcon from '@untitled-ui/icons-react/build/esm/FaceSmile';
import Image01Icon from '@untitled-ui/icons-react/build/esm/Image01';
import Link01Icon from '@untitled-ui/icons-react/build/esm/Link01';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import VideocamIcon from '@mui/icons-material/Videocam';
import {MobileDatePicker} from '@mui/x-date-pickers';
import PlusIcon from '@untitled-ui/icons-react/build/esm/Plus';
import Autocomplete from '@mui/material/Autocomplete';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import Checkbox from '@mui/material/Checkbox';

import InputLabel from '@mui/material/InputLabel';
import {
    Avatar,
    Button,
    Card,
    Chip,
    CardContent,
    IconButton,
    OutlinedInput,
    TextField,
    Stack,
    SvgIcon,
    useMediaQuery
} from '@mui/material';
import {useMockedUser} from 'src/hooks/use-mocked-user';
import {getInitials} from 'src/utils/get-initials';
import {useState} from 'react';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';

import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import {useKindOfServices} from "src/hooks/use-kind-of-services";
import {useFormik} from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import {useAuth} from "../../../hooks/use-auth";

const icon = <CheckBoxOutlineBlankIcon fontSize="small"/>;
const checkedIcon = <CheckBoxIcon fontSize="small"/>;

export const ServicePostAdd = (props) => {
    const {onSubmit, ...other} = props;
    const {user} = useAuth();
    const smUp = useMediaQuery((theme) => theme.breakpoints.up('sm'));
    const services = useKindOfServices();


    const formik = useFormik({
        initialValues: {
            kindOfConstruction: '',
            location: '',
            description: '',
            startDate: new Date(),
            endDate: new Date(),
            userId: user.id
        },
        validationSchema: Yup.object({}),
        onSubmit: async (values, helpers) => {
            try {
                onSubmit(values);
                helpers.setStatus({success: true});
                helpers.setSubmitting(false);
                toast.success('Services info updated');
            } catch (err) {
                console.error(err);
                toast.error('Something went wrong!');
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
                                disablePortal
                                id="combo-box-demo"
                                options={services}
                                value={formik.values.kindOfConstruction}
                                onBlur={formik.handleBlur}
                                onChange={(e, value) => {
                                    formik.setFieldValue('kindOfConstruction', value);
                                }}
                                renderInput={(params) => <TextField {...params} label="Kind of construction"/>}
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
                                {smUp && (
                                    <Stack
                                        alignItems="center"
                                        direction="row"
                                        spacing={1}
                                    >
                                        <IconButton>
                                            <SvgIcon>
                                                <PhotoCameraIcon/>
                                            </SvgIcon>
                                        </IconButton>
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
