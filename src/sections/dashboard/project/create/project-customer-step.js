import {Box, Button, Link, Stack, SvgIcon, TextField, Typography} from '@mui/material';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import {useFormik} from "formik";
import PropTypes from 'prop-types';
import {useState} from 'react';
import {RouterLink} from "src/components/router-link";
import {paths} from "src/paths";
import * as Yup from "yup";
import {PHONE_NUMBER_REGEXP} from "../../../../utils/regexp";

export const ProjectCustomerStep = (props) => {
    const {onBack, onNext, project, ...other} = props;
    const [content, setContent] = useState(project.description);

    const formik = useFormik({
        initialValues: {
            phone: project.phone || ''
        },
        validationSchema: Yup.object({
            phone: Yup.string().matches(PHONE_NUMBER_REGEXP, "Incorrect phone number"),
        }),
        onSubmit: async (values, helpers) => {
          /*  try {
                project.phone = values.phone;
                project.status = "new";
                console.log(project)
                let id = await projectApi.addProject(project);
                onNext(project);
                helpers.setStatus({success: true});
            } catch (err) {
                console.error(err);
                helpers.setStatus({success: false});
                helpers.setErrors({submit: err.message});
            }*/
        }
    });

    return (
        <Stack
            spacing={3}
            {...other}>
            <div>
                <Typography variant="h6">
                    Leave contacts for communication
                </Typography>
                <Typography variant="subtitle2">
                    We do not send ads. The specialists don't see the number. You decide who to show it to.
                </Typography>


            </div>
            <Button
                fullWidth
                // onClick={handleGoogleClick}
                size="large"
                sx={{
                    backgroundColor: 'common.white',
                    color: 'common.black',
                    '&:hover': {
                        backgroundColor: 'common.white',
                        color: 'common.black'
                    }
                }}
                variant="contained"
            >
                <Box
                    alt="Google"
                    component="img"
                    src="/assets/logos/logo-google.svg"
                    sx={{mr: 1}}
                />
                Google
            </Button>
            <Stack spacing={3}>
                <TextField
                    error={!!(formik.touched.phone && formik.errors.phone)}
                    fullWidth
                    helperText={formik.touched.phone && formik.errors.phone}
                    label="Email"
                    name="phone"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.phone}
                />
            </Stack>

            <Typography
                color="text.secondary"
                variant="body2"
            >
                Already have an account?
                &nbsp;
                <Link
                    component={RouterLink}
                    href={paths.auth.firebase.login}
                    underline="hover"
                    variant="subtitle2"
                >
                    Log in
                </Link>
            </Typography>

            <Stack
                alignItems="center"
                direction="row"
                spacing={2}
            >
                <Button
                    endIcon={(
                        <SvgIcon>
                            <ArrowRightIcon/>
                        </SvgIcon>
                    )}
                    onClick={formik.handleSubmit}
                    variant="contained"
                >
                    Create project
                </Button>
                <Button
                    color="inherit"
                    onClick={onBack}
                >
                    Back
                </Button>
            </Stack>
        </Stack>
    );
};

ProjectCustomerStep.propTypes = {
    onBack: PropTypes.func,
    onNext: PropTypes.func
};
