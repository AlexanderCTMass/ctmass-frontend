import {
    Avatar,
    Box,
    Button,
    Dialog,
    Divider,
    Drawer,
    IconButton,
    Input,
    Menu,
    Stack,
    SvgIcon,
    Tab,
    Tabs,
    Tooltip,
    Unstable_Grid2 as Grid,
    useMediaQuery
} from "@mui/material";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import EyeOffIcon from "@untitled-ui/icons-react/build/esm/EyeOff";
import ArchiveIcon from "@untitled-ui/icons-react/build/esm/Archive";
import XIcon from "@untitled-ui/icons-react/build/esm/X";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import { profileApi } from "../../../../api/profile";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../../../../libs/firebase";
import toast from "react-hot-toast";
import { arrayRemove, arrayUnion } from "firebase/firestore";
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { ServiceItem } from "./service-item";
import { useFormik } from "formik";
import CertificateList from "./CertificatedList";

export const ServicesEditForm = (props) => {
    const { specialityRoot, onClose, onChange, onRemove, ...other } = props;
    const mdUp = useMediaQuery((theme) => theme.breakpoints.up('md'));
    const [currentTab, setCurrentTab] = useState('overview');
    const [userSpecialty, setUserSpecialty] = useState(null);
    const [attachments, setAttachments] = useState([]);
    const [attachmentAnchorEl, setAttachmentAnchorEl] = useState(null);
    const [showedAttachment, setShowedAttachment] = useState(false);
    const [submit, setSubmit] = useState(false);


    const fileInputRef = useRef(null);
    const handleAttach = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleAddAttachment = async (e) => {
        try {
            if (e.target.files) {
                const file = e.target.files[0];

                const storageRef = ref(storage, '/diplomas/' + specialityRoot.userId + '-' + file.name);
                uploadBytes(storageRef, file).then((snapshot) => {
                    getDownloadURL(storageRef).then(async (url) => {
                        await profileApi.updateUserSpecialty(specialityRoot.userId, specialityRoot.spec.id, {
                            attachments: arrayUnion({
                                id: file.name,
                                url: url
                            })
                        });
                        await handleSetUS();
                        toast.success("Attachment upload successfully!");
                    })
                });
            }
        } catch (err) {
            console.error(err);
            toast.error('Something went wrong!');

        }
    }

    const handleDeleteAttachment = async () => {
        try {
            await profileApi.updateUserSpecialty(specialityRoot.userId, specialityRoot.spec.id, {
                attachments: userSpecialty.attachments.filter((a) => a.id !== attachmentAnchorEl.id)
            });
            await handleSetUS();
            toast.success("Attachment delete successfully!");
        } catch (err) {
            console.error(err);
            toast.error('Something went wrong!');

        }
    }

    const handleSetUS = async () => {
        if (!specialityRoot) return;
        let newVar = await profileApi.getUserSpecialty(specialityRoot.userId, specialityRoot.spec.id);
        if (!newVar) {
            newVar = { ...specialityRoot.spec, user: specialityRoot.userId };
            await profileApi.addSpecialties(specialityRoot.userId, [newVar])
        }
        setUserSpecialty(newVar);
        setAttachmentAnchorEl(null);
    };
    // Reset tab on task change
    useEffect(() => {
        handleSetUS();
    },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [specialityRoot]);

    const handleRemove = () => {
        onRemove(specialityRoot.spec);
    }

    const handleTabsReset = useCallback(() => {
        setCurrentTab('overview');
        setAttachmentAnchorEl(null);
    }, []);

    const handleAttachmentClick = (event) => {
        setAttachmentAnchorEl(event.currentTarget);
    };

    // Reset tab on task change
    useEffect(() => {
        handleTabsReset();
    },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [specialityRoot]);


    const handleTabsChange = useCallback((event, value) => {
        setCurrentTab(value);
    }, []);

    const handleServiceAdd = async () => {
        try {
            await profileApi.updateUserSpecialty(specialityRoot.userId, specialityRoot.spec.id, {
                services: arrayUnion({
                    name: "add service name",
                    price: 0
                })
            });
            await handleSetUS();
        } catch (err) {
            console.error(err);
            toast.error('Something went wrong!');
        }
    }

    const handleServiceRename = async (oldName, name, cost, costType) => {
        try {
            const find = userSpecialty.services.find((service) => service.name === oldName);
            if (find) {
                const of = userSpecialty.services.indexOf(find);
                await profileApi.updateUserSpecialty(specialityRoot.userId, specialityRoot.spec.id, {
                    services: [...userSpecialty.services.slice(0, of), {
                        name: name,
                        cost: cost,
                        costType: costType
                    },
                    ...userSpecialty.services.slice(of + 1)]
                });
                await handleSetUS();
            }
        } catch (err) {
            console.error(err);
            toast.error('Something went wrong!');
        }
    }

    const handleServiceDelete = async (name) => {
        try {
            const find = userSpecialty.services.find((service) => service.name === name);
            if (find) {
                await profileApi.updateUserSpecialty(specialityRoot.userId, specialityRoot.spec.id, {
                    services: arrayRemove(find)
                });
                await handleSetUS();
            }
        } catch (err) {
            console.error(err);
            toast.error('Something went wrong!');
        }
    }


    const formik = useFormik({
        initialValues: {
            description: (userSpecialty && userSpecialty.description) ? userSpecialty.description : "",
            workExperience: (userSpecialty && userSpecialty.workExperience) ? userSpecialty.workExperience : -1,
        },
        enableReinitialize: true,
        onSubmit: async (values, helpers) => {
            setSubmit(true);
            try {
                await profileApi.updateUserSpecialty(specialityRoot.userId, specialityRoot.spec.id, values)
                await handleSetUS();
                setSubmit(false);
                toast.success('The changes were saved successfully!');

            } catch (err) {
                toast.error('Something went wrong!');
                console.error(err);
                helpers.setStatus({ success: false });
                helpers.setErrors({ submit: err.message });
                helpers.setSubmitting(false);
                setSubmit(false);
            }
        }
    });


    const content = (userSpecialty && specialityRoot) ? (
        <>
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
                sx={{ p: 3 }}
            >
                <Box>
                    <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                        {specialityRoot.parent.label}
                    </Typography>
                    <Typography variant="h5" component="div"
                        sx={{ color: !specialityRoot.spec.accepted ? "red" : "auto" }}>
                        {specialityRoot.spec.label}
                    </Typography>
                    {!specialityRoot.spec.accepted &&
                        (<><Typography variant="caption" component="div" sx={{ color: "red" }}>
                            not confirmed by the admin
                        </Typography>
                            <Typography variant="caption" component="div">
                                Continue setting up the specialization, the data will be saved. After approval by the
                                administrator, the information will be publicly available
                            </Typography></>)}
                </Box>
                <Stack
                    justifyContent="flex-end"
                    alignItems="center"
                    direction="row"
                    spacing={1}
                >
                    <IconButton>
                        <SvgIcon>
                            <EyeOffIcon />
                        </SvgIcon>
                    </IconButton>
                    <Tooltip title="Delete">
                        <IconButton color={"error"} onClick={handleRemove}>
                            <SvgIcon>
                                <ArchiveIcon />
                            </SvgIcon>
                        </IconButton>
                    </Tooltip>
                    {!mdUp && (
                        <IconButton onClick={onClose}>
                            <SvgIcon>
                                <XIcon />
                            </SvgIcon>
                        </IconButton>
                    )}
                </Stack>
            </Stack>
            <Tabs
                onChange={handleTabsChange}
                sx={{ px: 3 }}
                value={currentTab}
            >
                <Tab
                    value="overview"
                    label="Overview"
                />
                <Tab
                    value="services"
                    label="Service list"
                />
                <Tab
                    value="certificates"
                    label="Cerificated list"
                />
            </Tabs>
            <Divider />

            <Box sx={{ p: 3 }}>
                {currentTab === 'overview' && (
                    <form
                        onSubmit={formik.handleSubmit}
                        {...other}>
                        <Grid
                            container
                            spacing={2}
                        >
                            <Grid
                                xs={12}
                                sm={4}
                            >
                                <Typography
                                    color="text.secondary"
                                    variant="caption"
                                >
                                    Work experience
                                </Typography>
                            </Grid>
                            <Grid
                                xs={12}
                                sm={8}
                            >
                                <FormControl fullWidth>
                                    <Select
                                        id="demo-simple-select"
                                        name="workExperience"
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        value={formik.values.workExperience}
                                    >
                                        <MenuItem value={0}>Less than a year</MenuItem>
                                        <MenuItem value={1}>1 year</MenuItem>
                                        <MenuItem value={2}>2 years</MenuItem>
                                        <MenuItem value={3}>3 years</MenuItem>
                                        <MenuItem value={4}>4 years</MenuItem>
                                        <MenuItem value={5}>5 years</MenuItem>
                                        <MenuItem value={6}>6 years</MenuItem>
                                        <MenuItem value={7}>7 years</MenuItem>
                                        <MenuItem value={8}>8 years</MenuItem>
                                        <MenuItem value={9}>9 years</MenuItem>
                                        <MenuItem value={10}>More than 10 years</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/*<Grid*/}
                            {/*    xs={12}*/}
                            {/*    sm={4}*/}
                            {/*>*/}
                            {/*    <Typography*/}
                            {/*        color="text.secondary"*/}
                            {/*        variant="caption"*/}
                            {/*    >*/}
                            {/*        Diplomas, certificates, licenses*/}
                            {/*    </Typography>*/}
                            {/*</Grid>*/}
                            {/*<Grid*/}
                            {/*    xs={12}*/}
                            {/*    sm={8}*/}
                            {/*>*/}
                            {/*    <Stack*/}
                            {/*        alignItems="center"*/}
                            {/*        direction="row"*/}
                            {/*        flexWrap="wrap"*/}
                            {/*        spacing={1}*/}
                            {/*    >*/}
                            {/*        {userSpecialty.attachments && userSpecialty.attachments.map((attachment) => (*/}
                            {/*            <IconButton*/}
                            {/*                onClick={handleAttachmentClick}*/}
                            {/*                id={attachment.id}*/}
                            {/*                data-url={attachment.url}*/}
                            {/*            >*/}
                            {/*                <Avatar*/}
                            {/*                    key={attachment.id}*/}
                            {/*                    src={attachment.url || undefined}*/}
                            {/*                    sx={{*/}
                            {/*                        height: 96,*/}
                            {/*                        width: 64*/}
                            {/*                    }}*/}
                            {/*                    variant="rounded"*/}

                            {/*                />*/}
                            {/*            </IconButton>*/}
                            {/*        ))}*/}
                            {/*        <Menu*/}
                            {/*            anchorEl={attachmentAnchorEl}*/}
                            {/*            open={attachmentAnchorEl}*/}
                            {/*            onClose={() => {*/}
                            {/*                setAttachmentAnchorEl(null)*/}
                            {/*            }}*/}
                            {/*            MenuListProps={{*/}
                            {/*                'aria-labelledby': 'basic-button',*/}
                            {/*            }}*/}
                            {/*            anchorOrigin={{*/}
                            {/*                vertical: 'center',*/}
                            {/*                horizontal: 'center',*/}
                            {/*            }}*/}
                            {/*            transformOrigin={{*/}
                            {/*                vertical: 'center',*/}
                            {/*                horizontal: 'center',*/}
                            {/*            }}*/}
                            {/*            sx={{opacity: 0.8}}*/}
                            {/*        >*/}
                            {/*            <MenuItem>*/}
                            {/*                <ZoomInIcon fontSize="small" onClick={() => {*/}
                            {/*                    setShowedAttachment(true)*/}
                            {/*                }}/>*/}
                            {/*            </MenuItem>*/}
                            {/*            <MenuItem>*/}
                            {/*                <DeleteForeverIcon fontSize="small" onClick={handleDeleteAttachment}/>*/}
                            {/*            </MenuItem>*/}
                            {/*        </Menu>*/}
                            {/*        <IconButton onClick={handleAttach}>*/}
                            {/*            <SvgIcon fontSize="small">*/}
                            {/*                <PlusIcon/>*/}
                            {/*            </SvgIcon>*/}
                            {/*        </IconButton>*/}
                            {/*        <input*/}
                            {/*            hidden*/}
                            {/*            ref={fileInputRef}*/}
                            {/*            type="file"*/}
                            {/*            onChange={handleAddAttachment}*/}
                            {/*        />*/}
                            {/*    </Stack>*/}
                            {/*</Grid>*/}


                            <Grid
                                xs={12}
                                sm={4}
                            >
                                <Typography
                                    color="text.secondary"
                                    variant="caption"
                                >
                                    Description
                                </Typography>
                            </Grid>
                            <Grid
                                xs={12}
                                sm={8}
                            >
                                <Input
                                    fullWidth
                                    multiline
                                    disableUnderline
                                    placeholder="What can you tell us about the specifics of you work?"
                                    rows={9}
                                    name="description"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    value={formik.values.description}
                                    sx={{
                                        borderColor: 'divider',
                                        borderRadius: 1,
                                        borderStyle: 'solid',
                                        borderWidth: 1,
                                        p: 1
                                    }}
                                />
                            </Grid>
                            <Button color="info"
                                variant="contained"
                                type="submit"
                                fullWidth
                                sx={{ mt: "30px" }}
                                disabled={submit || (userSpecialty.description === formik.values.description && userSpecialty.workExperience === formik.values.workExperience)}
                            >
                                {"Save"}
                            </Button>
                        </Grid>
                    </form>
                )}


                {currentTab === 'certificates' && (
                    <>
                        <CertificateList userSpecialty={userSpecialty} />
                    </>
                )}

                {currentTab === 'services' && (
                    <Stack spacing={1}>
                        {userSpecialty.services && userSpecialty.services.map((service) => (
                            <ServiceItem key={service.name} service={service}
                                onDelete={() => handleServiceDelete(service.name)}
                                onCost={(cost) => handleServiceRename(service.name, service.name || '', cost, service.costType || 0)}
                                onCostType={(type) => handleServiceRename(service.name, service.name || '', service.cost || 0, type)}
                                onRename={(name) => handleServiceRename(service.name, name, service.cost || 0, service.costType || 0)}
                            />
                        ))}
                        <Button
                            startIcon={(
                                <SvgIcon>
                                    <PlusIcon />
                                </SvgIcon>
                            )}
                            onClick={handleServiceAdd}
                            variant="contained"
                        >
                            Add
                        </Button>
                    </Stack>
                )}
            </Box>
            <Dialog
                open={showedAttachment}
                onClose={() => {
                    setShowedAttachment(false)
                }}
            >
                {showedAttachment && attachmentAnchorEl &&
                    (<img src={attachmentAnchorEl.getAttribute('data-url')} />)}
            </Dialog>
        </>
    ) : null;


    return (
        <Drawer
            anchor="right"
            onClose={() => {
                formik.resetForm();
                onClose();
            }}
            open={specialityRoot}
            PaperProps={{
                sx: {
                    width: '100%',
                    maxWidth: 500
                }
            }}>
            {content}
        </Drawer>
    );
}