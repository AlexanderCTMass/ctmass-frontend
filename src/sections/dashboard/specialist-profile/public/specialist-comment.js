import PropTypes from 'prop-types';
import { formatDistanceToNowStrict } from 'date-fns';
import { Avatar, Box, Button, IconButton, Link, Stack, SvgIcon, TextField, Tooltip, Typography } from '@mui/material';
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import * as React from "react";
import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "../../../../libs/firebase";
import toast from "react-hot-toast";
import { useCallback, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import EditIcon from '@mui/icons-material/Edit';

export const SpecialistComment = (props) => {
    const { authorAvatar, id, authorName, createdAt, message, handlePostsGet, post, authorId, user, ...other } = props;
    const ago = formatDistanceToNowStrict(createdAt);
    const [edit, setEdit] = useState(false);
    const handlePostRemove = async () => {
        try {
            const postRef = doc(firestore, "specialistPosts", post.id);
            await updateDoc(postRef, { comments: post.comments.filter((p) => p.id !== id) });
            await handlePostsGet();
            toast.success('Comment remove');
        } catch (err) {
            toast.error('Something went wrong!');
            console.error(err);
        }
    }


    const formik = useFormik({
        initialValues: {
            message: message
        },
        validationSchema: Yup.object({
            message: Yup
                .string()
                .max(1000)
                .required('Message is required')
        }),
        onSubmit: async (values, helpers) => {
            try {
                const postRef = doc(firestore, "specialistPosts", post.id);

                post.comments.forEach((com) => {
                    if (com.id === id)
                        com.message = values.message;
                })

                await updateDoc(postRef, { comments: post.comments });
                helpers.setStatus({ success: true });
                helpers.setSubmitting(false);
                handlePostsGet();
                toast.success('Comment save');
                formik.resetForm();
                setEdit(false);
            } catch (err) {
                toast.error('Something went wrong!');
                console.error(err);
                helpers.setStatus({ success: false });
                helpers.setErrors({ submit: err.message });
                helpers.setSubmitting(false);
            }
        }
    });


    return (
        <Stack
            alignItems="flex-start"
            direction="row"
            spacing={2}
            {...other}>
            <Avatar
                component="a"
                href={process.env.REACT_APP_HOST_P + "/cabinet/profiles/" + authorId}
                src={authorAvatar}
            />
            <Stack
                spacing={1}
                sx={{
                    backgroundColor: (theme) => theme.palette.mode === 'dark'
                        ? 'neutral.800'
                        : 'neutral.50',
                    borderRadius: 1,
                    flexGrow: 1,
                    p: 2
                }}
            >
                <Stack
                    alignItems="center"
                    direction="row"
                    spacing={1}
                >
                    <Link
                        color="text.primary"
                        href={process.env.REACT_APP_HOST_P + "/cabinet/profiles/" + authorId}
                        variant="subtitle2"
                    >
                        {authorName}
                    </Link>
                    <Box sx={{ flexGrow: 1 }} />
                    <Typography
                        color="text.secondary"
                        variant="caption"
                    >
                        {ago}
                        {' '}
                        ago
                    </Typography>
                    {user.id === authorId ?
                        <Stack direction={"row"} space={0}>
                            <Tooltip title={"edit"}>
                                <IconButton onClick={() => {
                                    setEdit(true);
                                }}>
                                    <SvgIcon>
                                        <EditIcon />
                                    </SvgIcon>
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={"delete"}>
                                <IconButton onClick={() => {
                                    handlePostRemove();
                                }}>
                                    <SvgIcon>
                                        <HighlightOffIcon sx={{ color: "red" }}
                                        />
                                    </SvgIcon>
                                </IconButton>
                            </Tooltip>
                        </Stack>
                        : <></>}
                </Stack>
                {edit ?
                    <form
                        onSubmit={formik.handleSubmit}
                    >
                        <Stack direction={"column"} spacing={3}>
                            <TextField
                                fullWidth
                                multiline
                                placeholder="Type your reply"
                                rows={3}
                                variant="outlined"
                                error={!!(formik.touched.message && formik.errors.message)}
                                helperText={formik.touched.message && formik.errors.message}
                                name="message"
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                value={formik.values.message}
                            />
                            <Stack
                                alignItems="center"
                                direction="row"
                                justifyContent="flex-end"
                                spacing={3}
                            >
                                <Button variant="contained" type={"submit"}>
                                    Save
                                </Button>
                            </Stack>
                        </Stack>
                    </form>
                    :
                    <Typography variant="body2">
                        {message}
                    </Typography>}
            </Stack>
        </Stack>
    );
};

SpecialistComment.propTypes = {
    authorAvatar: PropTypes.string.isRequired,
    authorName: PropTypes.string.isRequired,
    createdAt: PropTypes.number.isRequired,
    message: PropTypes.string.isRequired
};
