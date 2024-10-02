import {
    Avatar,
    Box,
    Button,
    Checkbox,
    Drawer,
    FormControlLabel, IconButton,
    Stack,
    SvgIcon,
    TextField, Tooltip,
    Typography, useMediaQuery
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import * as React from "react";
import {useCallback, useRef, useState} from "react";
import {useFormik} from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import User01Icon from "@untitled-ui/icons-react/build/esm/User01";
import {fileToBase64} from "../../../utils/file-to-base64";
import ImageIcon from '@mui/icons-material/Image';
import {useDispatch} from "../../../store";
import {thunks} from "../../../thunks/dictionary";
import {dictionaryApi} from "../../../api/dictionary";
import EyeOffIcon from "@untitled-ui/icons-react/build/esm/EyeOff";
import ArchiveIcon from "@untitled-ui/icons-react/build/esm/Archive";
import XIcon from "@untitled-ui/icons-react/build/esm/X";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";

const CategoryForm = (props) => {
    const dispatch = useDispatch();
    const mdUp = useMediaQuery((theme) => theme.breakpoints.up('md'));

    const {open, setOpen, category, allcategories, ...other} = props;
    const isNew = category.label == null;
    const [submit, setSubmit] = useState(false);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            label: category.label || "",
            accepted: category.accepted || false,
            img: category.img || ""
        },
        validationSchema: Yup.object({
            label: Yup
                .string()
                .max(40)
                .required('Category name is required')
        }),
        onSubmit: async (values, helpers) => {
            setSubmit(true);
            try {
                if (values.label !== category.label || values.accepted !== category.accepted || (values.img !== category.img) || (values.parentCategory && values.parentCategory !== 0)) {
                    let url = category.img || null;

                    if (values.img === null && category.img !== null) {
                        await dictionaryApi.removeImage(url);
                        url = null;
                    }

                    if (values.img && values.img.file) {
                        url = await dictionaryApi.uploadImage(values.img.file)
                    }
                    if (isNew)
                        dispatch(thunks.addCategory({...values, img: url}));
                    else {
                        if (values.parentCategory && values.parentCategory !== 0) {
                            dispatch(thunks.removeCategory(category));
                            toast.success('Category ' + category.label + 'remove!');
                            dispatch(thunks.addSpecialty({
                                label: values.label,
                                parent: values.parentCategory,
                                accepted: values.accepted,
                                img: url
                            }));
                            toast.success('Specialty ' + category.label + 'in new category add!');
                        } else {
                            dispatch(thunks.updateCategory({...values, img: url}, category.id));
                        }
                    }
                }
                setSubmit(false);
                onClose();
            } catch (err) {
                toast.error('Something went wrong!');
                console.error(err);
                helpers.setStatus({success: false});
                helpers.setErrors({submit: err.message});
                helpers.setSubmitting(false);
                setSubmit(false);
            }
        }
    });

    const fileInputRef = useRef(null);
    const handleAttach = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleImageChange = async (e) => {
        try {
            if (e.target.files) {
                await formik.setFieldValue("img", {
                    file: e.target.files[0],
                    img: await fileToBase64(e.target.files[0])
                });
            }
        } catch (err) {
            console.error(err);
            toast.error('Something went wrong!');

        }
    }

    const handleDeleteImage = () => {
        formik.setFieldValue("img", null);
    };

    const handleRemove = () => {
        dispatch(thunks.removeCategory(category));
        onClose();
    };

    const onClose = () => {
        formik.resetForm();
        setOpen(false);
    }


    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    maxWidth: 500
                }
            }}>
            <form
                onSubmit={formik.handleSubmit}
                {...other}>
                <Box sx={{p: 3}}>
                    <Stack
                        alignItems={{
                            sm: 'center'
                        }}
                        direction={{
                            xs: 'column-reverse',
                            sm: 'row'
                        }}
                        justifyContent={{
                            sm: 'space-between'
                        }}
                        spacing={1}
                    >
                        <Box>
                            <Typography variant="h5" component="div">
                                {isNew ? "Add new category" : "Edit category"}
                            </Typography>
                        </Box>
                        <Stack
                            justifyContent="flex-end"
                            alignItems="center"
                            direction="row"
                            spacing={1}
                        >
                            {!isNew && (
                                <Tooltip title="Delete">
                                    <IconButton color={"error"} onClick={handleRemove}>
                                        <SvgIcon>
                                            <ArchiveIcon/>
                                        </SvgIcon>
                                    </IconButton>
                                </Tooltip>)}
                            {!mdUp && (
                                <IconButton onClick={onClose}>
                                    <SvgIcon>
                                        <XIcon/>
                                    </SvgIcon>
                                </IconButton>
                            )}
                        </Stack>
                    </Stack>


                    <Stack direction="column" spacing={2}>
                        <Grid>
                            <Typography
                                color="text.secondary"
                                variant="caption"
                            >
                                Category name
                            </Typography>

                            <TextField
                                fullWidth
                                error={!!(formik.touched.label && formik.errors.label)}
                                helperText={formik.touched.label && formik.errors.label}
                                name="label"
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                value={formik.values.label}
                            />
                        </Grid>
                        <Avatar
                            variant="square"
                            src={formik.values.img ? (formik.values.img.file ? formik.values.img.img : formik.values.img) : undefined}
                            sx={{
                                height: 200,
                                width: 200
                            }}
                        >
                            <SvgIcon>
                                <ImageIcon/>
                            </SvgIcon>
                        </Avatar>

                        <Button color="success"
                                variant="outlined"
                                fullWidth
                                sx={{mt: "30px"}}
                                onClick={handleAttach}
                        >
                            {formik.values.img ? "Change image" : "Attach image"}
                        </Button>
                        <input
                            hidden
                            ref={fileInputRef}
                            type="file"
                            onChange={handleImageChange}
                        />
                        {formik.values.img && (
                            <Button color="error"
                                    variant="outlined"
                                    fullWidth
                                    sx={{mt: "30px"}}
                                    onClick={handleDeleteImage}
                            >
                                Delete image
                            </Button>
                        )}

                        <FormControlLabel control={<Checkbox name="accepted"
                                                             onBlur={formik.handleBlur}
                                                             onChange={formik.handleChange}
                                                             checked={formik.values.accepted}/>}
                                          label="Accepted by the moderator"/>


                        {!isNew && (
                            <FormControl fullWidth>
                                <Select
                                    id="parentCategory"
                                    name="parentCategory"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    value={formik.values.parentCategory}
                                >
                                    <MenuItem value={0}>-</MenuItem>
                                    {allcategories.filter((cat) => cat.id !== category.id).map((cat) => {
                                        return (<MenuItem value={cat.id}>{cat.label}</MenuItem>)
                                    })}
                                </Select>
                            </FormControl>
                        )}


                        <Button color="info"
                                variant="contained"
                                type="submit"
                                fullWidth
                                sx={{mt: "30px"}}
                                disabled={submit}
                        >
                            {isNew ? "Add category" : "Save"}
                        </Button>


                    </Stack>
                </Box>
            </form>
        </Drawer>
    )
}

export default CategoryForm;