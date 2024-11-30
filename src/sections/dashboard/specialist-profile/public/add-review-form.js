import {Button, Rating, Stack, Typography, useMediaQuery} from "@mui/material";
import * as React from "react";
import {QuillEditor} from "../../../../components/quill-editor";
import {useEffect, useState} from "react";
import {useFormik} from "formik";
import * as Yup from "yup";
import {addDoc, collection, doc, serverTimestamp, updateDoc} from "firebase/firestore";
import {firestore} from "../../../../libs/firebase";
import toast from "react-hot-toast";
import {useRouter} from "../../../../hooks/use-router";
import {useLocation, useNavigate} from "react-router-dom";

const labels1: { [index: string]: string } = {
    0: '',
    1: 'Got more problems than benefits',
    2: 'I`ve got couple major problems',
    3: 'Acceptable',
    4: 'Good, but I`ve got a couple problems',
    5: 'Perfect',
};

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

export const AddReviewForm = (props) => {
    const {
        post, user
    } = props;
    const smUp = useMediaQuery((theme) => theme.breakpoints.up('sm'));
    const navigate = useNavigate();
    const location = useLocation();
    const [content, setContent] = useState(post.customerFeedback);
    const [rating, setRating] = useState(post.rating);
    const [ratingHover, setRatingHover] = useState(-1);

    useEffect(() => {
        setContent(post.customerFeedback);
        setRating(post.rating);
    }, [post])

    const handleContentChange = (value) => {
        setContent(value);
    };

    const modules = smUp ? {
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

    const formik = useFormik({
        initialValues: {
            customerFeedback: post.customerFeedback,
            customerId: user.id,
            customerName: user.businessName || user.name,
            customerAvatar: user.avatar,
            rating: 0
        },
        onSubmit: async (values, helpers) => {
            try {
                if (!rating) {
                    throw new Error("Rating is required");
                }
                if (!content || !removeHTMLTags(content)) {
                    throw new Error("Feedback message is required");
                }
                values.rating = rating;
                values.customerFeedback = content;
                values.customerFeedbackDate = new Date();
                await updateDoc(doc(firestore, "specialistPosts", post.id), values);
                console.log(values);
                toast.success('Feedback success send');
                navigate(location.pathname, {replace: true});
                window.location.reload();
            } catch (err) {
                toast.error(err.message);
            }
        }
    });

    return (
        <form
            onSubmit={formik.handleSubmit}>
            <Stack
                spacing={3}
                sx={{flexGrow: 1}}
            >
                <Typography variant={"h6"} sx={{mb: 1}}>
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
                <QuillEditor
                    onChange={handleContentChange}
                    modules={modules}
                    formats={formats}
                    placeholder="Describe the main points of the order, the difficulties and how they were overcome"
                    sx={{height: 300}}
                    value={content}
                />
                <Stack
                    alignItems="center"
                    direction="row"
                    justifyContent="flex-end"
                    spacing={3}
                >
                    <Button variant="contained" type={"submit"}>
                        Send
                    </Button>
                </Stack>
            </Stack>
        </form>
    );
};