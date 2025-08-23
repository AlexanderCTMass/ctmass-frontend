import FaceSmileIcon from '@untitled-ui/icons-react/build/esm/FaceSmile';
import Link01Icon from '@untitled-ui/icons-react/build/esm/Link01';
import Attachment01Icon from '@untitled-ui/icons-react/build/esm/Attachment01';
import PlusIcon from '@untitled-ui/icons-react/build/esm/Plus';
import Image01Icon from '@untitled-ui/icons-react/build/esm/Image01';
import {
    Avatar,
    Button,
    IconButton, OutlinedInput,
    Stack,
    SvgIcon,
    TextField,
    useMediaQuery
} from '@mui/material';
import { getInitials } from 'src/utils/get-initials';
import { useFormik } from "formik";
import * as Yup from "yup";
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { firestore } from "src/libs/firebase";
import toast from "react-hot-toast";
import * as React from "react";
import { v4 as uuidv4 } from 'uuid';
import { emailSender } from "../../../../libs/email-sender";
import { useMounted } from "../../../../hooks/use-mounted";
import { useCallback, useEffect, useState } from "react";
import { profileApi } from "../../../../api/profile";

const useAuthor = (authorId) => {
    const isMounted = useMounted();
    const [autor, setAutor] = useState(null);

    const handleProfileGet = useCallback(async () => {
        try {
            const response = await profileApi.get(authorId);
            if (isMounted()) {
                setAutor(response);
            }
        } catch (err) {
            console.error(err);
        }
    }, [isMounted]);

    useEffect(() => {
        handleProfileGet();
    },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []);

    return autor;
};
export const SpecialistCommentAdd = (props) => {
    const { user, post, handlePostsGet } = props;
    const author = useAuthor(post.authorId);
    const smUp = useMediaQuery((theme) => theme.breakpoints.up('sm'));

    const formik = useFormik({
        initialValues: {
            message: '',
            authorId: user.id,
            authorName: user.businessName || user.name,
            authorAvatar: user.avatar
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
                await updateDoc(postRef, {
                    comments: [...post.comments, {
                        id: uuidv4(),
                        createdAt: new Date(), ...values
                    }]
                });

                if (user.id !== author.id) {
                    await emailSender.notifyUserForPostComment(user, author, values.message);
                }


                helpers.setStatus({ success: true });
                helpers.setSubmitting(false);
                handlePostsGet();
                toast.success('Comment created');
                formik.resetForm();
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
        <form
            onSubmit={formik.handleSubmit}
        >
            <div {...props}>
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
                        sx={{ flexGrow: 1 }}
                    >
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
                            {/*<Stack
              alignItems="center"
              direction="row"
              spacing={1}
            >
              {!smUp && (
                <IconButton>
                  <SvgIcon>
                    <PlusIcon />
                  </SvgIcon>
                </IconButton>
              )}
              {smUp && (
                <>
                  <IconButton>
                    <SvgIcon>
                      <Image01Icon />
                    </SvgIcon>
                  </IconButton>
                </>
              )}
            </Stack>*/}
                            <div>
                                <Button variant="contained" type={"submit"}>
                                    Send
                                </Button>
                            </div>
                        </Stack>
                    </Stack>
                </Stack>
            </div>
        </form>
    );
};
