import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import {useFormik} from 'formik';
import {Button, Link, Stack, Switch, TextField, Typography, Unstable_Grid2 as Grid} from '@mui/material';
import {RouterLink} from 'src/components/router-link';
import {CHPU_REGEXP, EMAIL_REGEXP, generateUrlFromStr, PHONE_NUMBER_REGEXP} from "src/utils/regexp";
import {firestore} from "src/libs/firebase";
import {collection, getDocs, query, updateDoc, where} from "firebase/firestore";
import {roles} from "src/roles";


async function updateSpecialistPostName(newName, authorId) {
    const specialistsCollection = collection(firestore, "specialistPosts"); // Ссылка на коллекцию
    const q = query(specialistsCollection, where("contractorId", "==", authorId)); // Запрос с фильтром
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return;
    }

    querySnapshot.forEach(async (docSnapshot) => {
        const docRef = docSnapshot.ref; // Ссылка на документ
        await updateDoc(docRef, {
            contractorName: newName
        });
    });
}

export const BasicEditForm = (props) => {
    const {
        name,
        phone,
        businessName,
        profilePage,
        email,
        id,
        publicProfile,
        serviceProvided,
        onSubmit,
        ...other
    } = props;

    const formik = useFormik({
        initialValues: {
            businessName: businessName || '',
            name: name || '',
            phone: phone || '',
            email: email || '',
            id: id,
            profilePage: profilePage || generateUrlFromStr(businessName),
            publicProfile: publicProfile || false,
            serviceProvided: serviceProvided || false
        },
        validationSchema: Yup.object({
            name: Yup.string().max(255).min(1),
            businessName: Yup.string().max(255).min(1),
            profilePage: Yup.string().max(30).min(5).matches(CHPU_REGEXP, "Incorrect profile page name"),
            phone: Yup.string().matches(PHONE_NUMBER_REGEXP, "Incorrect phone number"),
            email: Yup
                .string()
                .email('Must be a valid email')
                .max(255)
                .matches(EMAIL_REGEXP, "Incorrect email")
                .required('Email is required'),
        }),
        onSubmit: async (values, helpers) => {
            try {
                // NOTE: Make API request
                onSubmit({...values, role: values.serviceProvided ? roles.WORKER : roles.CUSTOMER});
                await updateSpecialistPostName(values.name, id);
                helpers.setStatus({success: true});
                helpers.setSubmitting(false);
                toast.success('Basic info updated');
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
            <Grid container>
                <Grid
                    xs={12}
                    md={12}
                >
                    <TextField
                        error={!!(formik.touched.name && formik.errors.name)}
                        fullWidth
                        helperText={formik.touched.name && formik.errors.name}
                        label="Full name"
                        name="name"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.name}
                    />
                </Grid>

                <Grid
                    xs={12}
                    md={12}
                >
                    <TextField
                        error={!!(formik.touched.businessName && formik.errors.businessName)}
                        fullWidth
                        helperText={formik.touched.businessName && formik.errors.businessName}
                        label="Business Name"
                        name="businessName"
                        onBlur={formik.handleBlur}
                        onChange={(e) => {
                            formik.handleChange(e);
                            formik.values.profilePage = generateUrlFromStr(e.target.value);
                        }}
                        value={formik.values.businessName}
                    />
                </Grid>

                <Grid
                    xs={12}
                    md={12}
                >
                    <Stack>
                        <Typography
                            color="text.secondary"
                            variant="overline"
                        >
                            Public profile link:
                        </Typography>
                        <Typography
                            color="text.secondary"
                            variant="overline"
                        >
                            {process.env.REACT_APP_HOST_P}
                            /specialist/
                            <Link
                                component={RouterLink}
                                href={process.env.REACT_APP_HOST_P + "/specialist/" + formik.values.profilePage}
                                underline="hover"
                                variant="overline"
                            >
                                {formik.values.profilePage}
                            </Link>
                        </Typography>

                    </Stack>

                </Grid>

                <Grid
                    xs={12}
                    md={6}
                >
                    <TextField
                        error={!!(formik.touched.email && formik.errors.email)}
                        fullWidth
                        helperText={formik.touched.email && formik.errors.email}
                        label="Email"
                        name="email"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.email}
                    />
                </Grid>

                <Grid
                    xs={12}
                    md={6}
                >
                    <TextField
                        error={!!(formik.touched.phone && formik.errors.phone)}
                        fullWidth
                        helperText={formik.touched.phone && formik.errors.phone}
                        label="Phone number"
                        name="phone"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.phone}
                    />
                </Grid>
                <Grid
                    xs={12}
                    md={6}
                >
                    <Typography
                        gutterBottom
                        variant="subtitle2"
                    >
                        Public Profile
                    </Typography>
                    <Typography
                        color="text.secondary"
                        variant="body2"
                    >
                        Means that anyone viewing your profile will
                        be able to see your contacts details
                    </Typography>
                    <Switch
                        checked={formik.values.publicProfile}
                        color="primary"
                        edge="start"
                        name="publicProfile"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.publicProfile}
                    />
                </Grid>
                <Grid
                    xs={12}
                    md={6}
                >
                    <Typography
                        gutterBottom
                        variant="subtitle2"
                    >
                        Services provided
                    </Typography>
                    <Typography
                        color="text.secondary"
                        variant="body2"
                    >
                        I am registering on the platform as a specialist providing services (configuration on the
                        'Specialist' tab if yes)
                    </Typography>
                    <Switch
                        checked={formik.values.serviceProvided}
                        color="primary"
                        edge="start"
                        name="serviceProvided"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.serviceProvided}
                    />
                </Grid>
            </Grid>
            <Stack
                direction={{
                    xs: 'column',
                    sm: 'row'
                }}
                flexWrap="wrap"
                justifyContent={"flex-end"}
                spacing={3}
                sx={{pt: 3}}
            >
                <Button
                    disabled={formik.isSubmitting}
                    type="submit"
                    variant="contained"
                >
                    Update
                </Button>
            </Stack>
        </form>
    );
};

BasicEditForm.propTypes = {
    name: PropTypes.object.isRequired,
    phone: PropTypes.object.isRequired,
    email: PropTypes.object.isRequired
};
