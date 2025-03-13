import PropTypes from 'prop-types';
import {
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    FormControlLabel,
    ImageList,
    InputAdornment,
    Link,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Radio,
    RadioGroup,
    Stack,
    SvgIcon,
    TextField,
    Typography,
    useMediaQuery
} from '@mui/material';
import ClockIcon from "@untitled-ui/icons-react/build/esm/Clock";
import MarkerPin01 from "@untitled-ui/icons-react/build/esm/MarkerPin01";
import BankNote01 from "@untitled-ui/icons-react/build/esm/BankNote01";
import * as React from "react";
import {useCallback, useEffect, useState} from "react";
import Fancybox from "src/components/myfancy/myfancybox";
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
import {getValidDate, isValidDate, wrapDayjs} from "src/utils/date-locale";
import ProjectStatusDisplay from "src/components/project-status-display";
import {formatDistanceToNow} from "date-fns";
import {ProjectCardRemoveButton} from "src/components/projects/project-card-remove-button";
import {ProjectCardUnpublishButton} from "src/components/projects/project-card-unpublish-button";
import {ProjectCardPublishButton} from "src/components/projects/project-card-publish-button";
import {Preview} from "src/components/myfancy/image-preview";
import {ProjectDatesView} from "src/components/project-dates-view";
import {paths} from 'src/paths';
import {ProjectCardNotInterestedButton} from "src/components/projects/project-card-not-interested-button";
import {ProjectCardResponseButton} from "src/components/projects/project-card-response-button";
import {ProjectStatus} from "src/enums/project-state";
import {ProjectCardEditButton} from "src/components/projects/project-card-edit-button";
import {FormikProvider, useField, useFormik} from "formik";
import * as Yup from "yup";
import {useMounted} from "src/hooks/use-mounted";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DateRangePicker} from "@mui/x-date-pickers-pro";
import {QuillEditor} from "src/components/quill-editor";
import {AddressAutoComplete} from "src/components/address/AddressAutoComplete";
import {PhotosDropzone} from "src/components/photos-dropzone";
import {PreviewEditable} from "src/components/myfancy/image-preview-editable";
import {deleteObject, getDownloadURL, ref, uploadBytesResumable} from "firebase/storage";
import {storage} from "src/libs/firebase";
import {v4 as uuidv4} from 'uuid';
import {projectsApi} from "src/api/projects";
import {projectsLocalApi} from "src/api/projects/project-local-storage";
import {projectFlow} from "src/flows/project/project-flow";
import {RouterLink} from "src/components/router-link";
import {INFO} from "src/libs/log";

const projectStartTypes = [
    {
        label: 'ASAP',
        value: 'asap'
    },
    {
        label: 'Specialist\'s choice',
        value: 'specialist'
    },
    {
        label: 'Choose date',
        value: 'period'
    }
];

const ProjectStartTypeRadioGroup = ({label, ...props}) => {
    const [field, meta] = useField(props); // Используем useField для управления состоянием
    const {value, onChange, onBlur} = field;
    const {error, touched} = meta;

    return (
        <div>
            <RadioGroup
                name={props.name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                sx={{flexDirection: 'row'}}
            >
                {projectStartTypes.map((projectStartTypesItem) => (
                    <FormControlLabel
                        control={<Radio/>}
                        key={projectStartTypesItem.value}
                        label={
                            <Typography variant="body1">{projectStartTypesItem.label}</Typography>
                        }
                        value={projectStartTypesItem.value}
                    />
                ))}
            </RadioGroup>
            {touched && error && (
                <Typography color="error" variant="body2">
                    {error}
                </Typography>
            )}
        </div>
    );
};

const DateRangePickerField = ({...props}) => {
    const [field, meta, helpers] = useField(props); // Используем useField для управления состоянием
    const {value} = field;
    const {setValue} = helpers;
    const {error, touched} = meta;

    const handleChange = (newValue) => {
        setValue(newValue); // Обновляем значение в Formik
    };

    return (
        <div>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateRangePicker
                    value={value}
                    onChange={handleChange}
                    sx={{width: "400px"}}
                    localeText={{start: 'Project to start', end: 'Project to end'}}
                    renderInput={(startProps, endProps) => (
                        <>
                            <TextField {...startProps} />
                            <TextField {...endProps} />
                        </>
                    )}
                />
            </LocalizationProvider>
            {touched && error && (
                <Typography color="error" variant="body2">
                    {error}
                </Typography>
            )}
        </div>
    );
};

const LocationField = ({...props}) => {
    const [field, meta, helpers] = useField(props); // Используем useField для управления состоянием
    const {value} = field;
    const {setValue} = helpers;
    const {error, touched} = meta;

    const handleChange = (newValue) => {
        setValue(newValue); // Обновляем значение в Formik
    };
    return (
        <div>
            {touched && error && (
                <Typography color="error" variant="body2">
                    {error}
                </Typography>
            )}
            <AddressAutoComplete location={value} withMap={true} handleSuggestionClick={handleChange}/>
        </div>
    )
}

const AttachesField = ({smUp, ...props}) => {
    const [field, meta, helpers] = useField(props); // Используем useField для управления состоянием
    const [uploadProgress, setUploadProgress] = useState({});
    const {value} = field;
    const {setValue} = helpers;
    const {error, touched} = meta;

    const handleChange = (newValue) => {
        setValue(newValue); // Обновляем значение в Formik
    };

    const handleRemovePhotos = (preview) => {
        setValue({
            existingAttach: value.existingAttach,
            attach: value.attach.filter((item) => item.preview !== preview)
        });
    };


    const handleRemoveExistingPhotos = async (url) => {
        setValue({attach: value.attach, existingAttach: value.existingAttach.filter((item) => item !== url)});
    };

    const handleFilesDrop = (files) => {
        const newPhotos = files.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
            type: file.type.startsWith('video') ? 'video' : 'image',
        }));
        setValue({attach: [...value.attach, ...newPhotos], existingAttach: value.existingAttach});
    };
    const handleFilesRemoveAll = () => {
        setValue({attach: [], existingAttach: []});
    }

    return (
        <div>
            <PhotosDropzone
                accept={{'image/*,video/*': []}}
                caption={"Attach photos or videos"}
                onDrop={handleFilesDrop}
                onRemove={handleRemovePhotos}
                onRemoveAll={handleFilesRemoveAll}
                onUpload={() => {
                }}
            />
            <ImageList
                variant="quilted"
                cols={smUp ? 5 : 2}
                rowHeight={101}
            >
                {value?.existingAttach.map((url) =>
                    <PreviewEditable attach={{preview: url}} onRemove={() => handleRemoveExistingPhotos(url)}/>
                )}
                {value?.attach.map((item) => (
                    <PreviewEditable attach={item} onRemove={() => handleRemovePhotos(item.preview)}
                                     uploadProgress={uploadProgress}/>
                ))}
            </ImageList>
        </div>
    )
}

const QuillEditorField = ({smUp, ...props}) => {
    const [field, meta, helpers] = useField(props); // Используем useField для управления состоянием
    const {value} = field;
    const {setValue} = helpers;
    const {error, touched} = meta;

    const handleChange = (newValue) => {
        setValue(newValue); // Обновляем значение в Formik
    };

    const modules = smUp ? {
            toolbar: [
                [{'header': [2, 3, false]}],
                ['bold', 'italic', 'underline'],
                [{'list': 'ordered'}, {'list': 'bullet'}],
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
            'bold', 'italic', 'underline', 'strike',
            'list', 'bullet'
        ];

    return (
        <div>
            <QuillEditor
                placeholder="Write something"
                sx={{height: 200}}
                value={value}
                modules={modules}
                formats={formats}
                onChange={handleChange}
                readOnly={props.readOnly}
            />
            {touched && error && (
                <Typography color="error" variant="body2">
                    {error}
                </Typography>
            )}
        </div>
    );
};

/*

-72.51954 42.37584

 */

export const ProjectCard = (props) => {
    const {project, specialty, service, role, user, onProjectListChanged, updateProjectList, ...other} = props;
    const [edit, setEdit] = useState(false);
    const createDate = getValidDate(project.createdAt);
    const isMounted = useMounted();
    const smUp = useMediaQuery((theme) => theme.breakpoints.up('sm'));

    INFO(project.location);
    const projectDetailLink =
        project.state === ProjectStatus.DRAFT ?
            undefined :
            paths.cabinet.projects.detail.replace(":projectId", project.id);


    const handleEdit = useCallback(() => {
        setEdit(true);
    }, [project]);

    const handleCloseEdit = useCallback(() => {
        setEdit(false);
        formik.resetForm();
    }, [project]);

    const formik = useFormik({
        initialValues: {
            title: project.title,
            location: project.location,
            description: project.description,
            projectMaximumBudget: project.projectMaximumBudget,
            projectStartType: project.projectStartType,
            projectDates: [wrapDayjs(project.start), wrapDayjs(project.end)],
            attaches: {attach: [], existingAttach: project.attach || []}
        },
        validationSchema: Yup.object({
            title: Yup
                .string()
                .max(255)
                .required('Title is required'),
            location: Yup.object().required('Location is required'),
            projectMaximumBudget: Yup.number().required("Max budget is required")
        }),
        onSubmit: async (values, helpers) => {
            try {
                if (isMounted()) {
                    project.title = values.title;
                    project.location = values.location;
                    project.description = values.description;
                    project.projectMaximumBudget = values.projectMaximumBudget;
                    project.projectStartType = values.projectStartType;
                    project.start = values.projectDates && getValidDate(values.projectDates[0]);
                    project.end = values.projectDates && getValidDate(values.projectDates[1]);

                    if (values.attaches) {
                        const newPhotosUrls = await Promise.all(
                            values.attaches.attach.map((item) => {
                                return new Promise((resolve, reject) => {
                                    const folder = item.type === 'video' ? 'videos' : 'photos';
                                    const storageRef = ref(storage, `${folder}/${uuidv4()}_${item.file.name}`);
                                    const uploadTask = uploadBytesResumable(storageRef, item.file);

                                    uploadTask.on('state_changed',
                                        (snapshot) => {
                                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                                            // setUploadProgress((prev) => ({...prev, [item.file.name]: progress}));
                                        },
                                        (error) => {
                                            console.error('Upload failed:', error);
                                            reject(error);
                                        },
                                        async () => {
                                            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                                            // setUploadProgress((prev) => {
                                            //     const updated = {...prev};
                                            //     delete updated[item.file.name];
                                            //     return updated;
                                            // });
                                            resolve(downloadURL);
                                        }
                                    );
                                });
                            })
                        );
                        const attachments = [...values.attaches.existingAttach, ...newPhotosUrls];

                        if (project.attach) {
                            project.attach.filter((exist) => !attachments.includes(exist)).forEach((url) => {
                                const imgRef = ref(storage, url);
                                deleteObject(imgRef).then(async () => {
                                }).catch((error) => {
                                    throw error;
                                });
                            });
                        }
                        project.attach = attachments;
                    }

                    if (project.id) {
                        await projectFlow.edit(project, user);
                    } else {
                        await projectsLocalApi.storeProject(project);
                    }
                    setEdit(false);
                    helpers.setSubmitting(false);
                    updateProjectList();
                }
            } catch (err) {
                console.error(err);

                if (isMounted()) {
                    helpers.setStatus({success: false});
                    helpers.setErrors({submit: err.message});
                    helpers.setSubmitting(false);
                }
            }
        }
    });

    useEffect(() => {
        console.log(formik.values)
    }, [formik.values]);

    return (
        <Card {...other}>
            <FormikProvider value={formik}>
                <CardContent>
                    <Stack direction="row"
                           justifyContent="space-between"
                           alignItems={"start"}
                           spacing={4}>
                        <Stack spacing={2}>
                            <Stack direction={"row"} spacing={1} alignItems={"center"} divider={<span>·</span>}>
                                <Typography>{specialty?.label}</Typography>
                                {service?.label !== project.title &&
                                    <Typography>{service?.label}</Typography>}
                                <ProjectStatusDisplay status={project.state}/>
                                <Typography
                                    variant={"caption"}>{createDate ? formatDistanceToNow(createDate, {addSuffix: true}) : ""}</Typography>
                            </Stack>
                            {edit ?
                                <TextField
                                    fullWidth
                                    error={!!(formik.touched.title && formik.errors.title)}
                                    helperText={formik.touched.title && formik.errors.title}
                                    label="Project Title"
                                    name="title"
                                    value={formik.values.title}
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    placeholder="e.g Installation of the entrance door"
                                /> :
                                <Link
                                    color="text.primary"
                                    variant="h5"
                                    href={projectDetailLink}
                                    underline={"none"}
                                    component={RouterLink}
                                >
                                    {project.title}
                                </Link>}

                        </Stack>

                        <Stack
                            alignItems={"start"}
                            direction="row"
                            spacing={1}
                        >

                            {edit ? <>
                                <Button
                                    variant="contained"
                                    color={"success"}
                                    onClick={formik.handleSubmit}
                                    disabled={formik.isSubmitting || !formik.isValid || !formik.dirty}
                                >
                                    Save
                                </Button>
                                <Button
                                    variant="outlined"
                                    color={"warning"}
                                    onClick={handleCloseEdit}
                                >
                                    Cancel
                                </Button>
                            </> : <>
                                {projectDetailLink && role === "customer" &&
                                    <Button
                                        variant={"text"}
                                        href={projectDetailLink}
                                        component={RouterLink}
                                    >
                                        General View
                                    </Button>}


                                <ProjectCardEditButton project={project} user={user} role={role}
                                                       onApply={handleEdit}/>
                                <ProjectCardPublishButton project={project} user={user} role={role}
                                                          onApply={onProjectListChanged}/>
                                <ProjectCardUnpublishButton project={project} user={user} role={role}
                                                            onApply={onProjectListChanged}/>
                                <ProjectCardRemoveButton project={project} user={user} role={role}
                                                         onApply={onProjectListChanged}/>
                                <ProjectCardResponseButton project={project} user={user} role={role}
                                                           onApply={() => {
                                                           }}/>
                                <ProjectCardNotInterestedButton project={project} user={user} role={role}
                                                                onApply={onProjectListChanged}/>
                            </>}
                        </Stack>
                    </Stack>
                    <Divider sx={{mt: 2}}/>
                    <Stack direction={"column"} spacing={2}>
                        {edit ?
                            <QuillEditorField
                                name="description"
                                smUp={smUp}
                                readOnly={formik.isSubmitting}
                            />
                            :
                            <div
                                dangerouslySetInnerHTML={{__html: project.description}}/>
                        }

                        {edit ?
                            (<AttachesField
                                name="attaches"
                                smUp={smUp}
                                readOnly={formik.isSubmitting}
                            />)
                            :
                            (project.attach &&
                                <Fancybox
                                    options={{
                                        Carousel: {
                                            infinite: false,
                                        },
                                    }}
                                >
                                    <ImageList
                                        variant="quilted"
                                        cols={8}
                                        rowHeight={101}
                                    >
                                        {project.attach.map((url) =>
                                            <a data-fancybox="gallery" href={url} className={"my-fancy-link"}><Preview
                                                attach={{preview: url}}/>
                                            </a>
                                        )}
                                    </ImageList>
                                </Fancybox>
                            )}
                    </Stack>
                    <List>
                        <ListItem
                            disableGutters
                            divider
                        >
                            <ListItemAvatar>
                                <SvgIcon color="action">
                                    <ClockIcon/>
                                </SvgIcon>
                            </ListItemAvatar>
                            <ListItemText
                                disableTypography
                                primary={edit ?
                                    <Stack direction={"row"} spacing={1}>
                                        <ProjectStartTypeRadioGroup
                                            name={"projectStartType"}
                                            value={formik.values.projectStartType}
                                        />
                                        {
                                            formik.values.projectStartType === 'period'
                                            && <DateRangePickerField
                                                name="projectDates"
                                            />

                                        }
                                    </Stack>
                                    :
                                    <ProjectDatesView project={project}/>}
                            />
                        </ListItem>
                        <ListItem
                            disableGutters
                            divider
                        >
                            <ListItemAvatar>
                                <SvgIcon color="action">
                                    <MarkerPin01/>
                                </SvgIcon>
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    edit ?
                                        <LocationField name="location"
                                                       readOnly={formik.isSubmitting}/>
                                        :
                                        <Typography variant="subtitle2">
                                            {project.location?.place_name}
                                        </Typography>
                                }
                            />
                        </ListItem>
                        <ListItem
                            disableGutters
                            divider
                        >
                            <ListItemAvatar>
                                <SvgIcon color="action">
                                    <BankNote01/>
                                </SvgIcon>
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    edit ?
                                        <TextField
                                            error={!!(formik.touched.projectMaximumBudget && formik.errors.projectMaximumBudget)}
                                            helperText={formik.touched.projectMaximumBudget && formik.errors.projectMaximumBudget}
                                            label="Max budget"
                                            name="projectMaximumBudget"
                                            value={formik.values.projectMaximumBudget}
                                            onBlur={formik.handleBlur}
                                            onChange={formik.handleChange}
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                            }}
                                            type="number"
                                        /> :
                                        <Typography variant="subtitle2">
                                            Max budget: <Chip label={"$" + project.projectMaximumBudget}/>
                                        </Typography>
                                }
                            />
                        </ListItem>

                    </List>
                    <Stack direction="row"
                           justifyContent="space-between"
                           alignItems={"start"}
                           spacing={4}>
                        <Stack spacing={2}>
                            <Typography
                                variant={"caption"} color={"text.secondary"}
                                sx={{mt: 2, fontSize: "10px"}}>#{project.id}</Typography>
                        </Stack>

                        <Stack
                            alignItems={"start"}
                            direction="row"
                            spacing={2}
                        >
                            {edit && <>
                                <Button
                                    variant="contained"
                                    color={"success"}
                                    onClick={formik.handleSubmit}
                                    disabled={formik.isSubmitting || !formik.isValid || !formik.dirty}
                                >
                                    Save
                                </Button>
                                <Button
                                    variant="outlined"
                                    color={"warning"}
                                    onClick={handleCloseEdit}
                                >
                                    Cancel
                                </Button>
                            </>}
                        </Stack>
                    </Stack>
                </CardContent>
            </FormikProvider>
        </Card>);
};

ProjectCard.propTypes = {
    project: PropTypes.object.isRequired,
    role: PropTypes.oneOf(["customer", "contractor", "admin"]).isRequired,
    onProjectListChanged: PropTypes.func
};
