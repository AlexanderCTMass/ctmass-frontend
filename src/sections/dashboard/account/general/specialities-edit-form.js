import * as React from 'react';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import {
    Box, Breadcrumbs,
    Button,
    Card, Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle, Divider, FormControlLabel, FormGroup, IconButton, Link,
    Stack, SvgIcon,
    TextField
} from "@mui/material";
import {useKindOfServices} from "src/hooks/use-kind-of-services";
import SpecialityCard from "./specialties-card";
import Typography from "@mui/material/Typography";
import CardContent from "@mui/material/CardContent";
import {useState} from "react";
import TreeView from '@mui/lab/TreeView';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TreeItem from '@mui/lab/TreeItem';
import Trash02Icon from "@untitled-ui/icons-react/build/esm/Trash02";
import {useFormik} from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import {profileApi} from "../../../../api/profile";


export const SpecialitiesEditForm = (props) => {
    const {userSpecialties, onSubmit} = props;
    const specialtyList = useKindOfServices();


    const [open, setOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [specialties, setSpecialties] = useState(userSpecialties);

    const handleClickOpen = () => {
        setOpen(true);
        setSpecialties(userSpecialties);
        setSelectedCategory(null);
    };

    const handleClose = () => {
        setOpen(false);
        setSpecialties(userSpecialties);
        setSelectedCategory(null);
    };

    const handleSubmit = () => {
        try {
            onSubmit({
                specialties: specialties
            });
            handleClose();
            toast.success('Contacts info updated');
        } catch (err) {
            console.error(err);
            toast.error('Something went wrong!');
        }
    }

    return (
        <Stack direction="column" spacing={2}>
            {userSpecialties.map((spec) => (
                <SpecialityCard speciality={spec}/>
            ))}
            <Button
                variant="outlined"
                onClick={handleClickOpen}
            >
                Add specialities
            </Button>
            <Dialog open={open} onClose={handleClose}
                    fullWidth
                    fullHeight
                    maxWidth="sm"
                    minHeight="sm"
            >
                <Box sx={{p: 3, pb: 1}}>
                    <Typography
                        align="center"
                        variant="h5"
                    >
                        Select service categories
                    </Typography>
                </Box>
                <Box sx={{p: 3, pt: 0}}>
                    <Breadcrumbs aria-label="breadcrumb">
                        {selectedCategory &&
                            (<Link underline="none" key="1" color="inherit" onClick={() => {
                                setSelectedCategory(null);
                                setSpecialties(userSpecialties);
                            }}>
                                All categories
                            </Link>)}
                        <Typography
                            color="text.primary">{selectedCategory ? selectedCategory.label : "All categories"}</Typography>
                    </Breadcrumbs>
                </Box>
                {selectedCategory ?
                    (<FormGroup sx={{p: 3, pt: 0, display: 'flex', flexWrap: 'wrap', flexDirection: 'row'}}>
                        {selectedCategory.childs.map((spec) => {
                            const includes = userSpecialties.map((spec) => spec.id).includes(spec.id);
                            return (<FormControlLabel
                                    sx={{width: "49%"}}
                                    control={
                                        <Checkbox defaultChecked={includes}
                                                  disabled={includes} name="selected"
                                                  onChange={(event, checked) => {
                                                      if (checked) {
                                                          setSpecialties([...specialties, spec]);
                                                      } else {
                                                          setSpecialties(specialties.filter((s) => s.id !== spec.id));
                                                      }
                                                  }}/>
                                    }
                                    label={spec.label}
                                />
                            )
                        })}
                    </FormGroup>)
                    :
                    (<TreeView
                        aria-label="service categories"
                        defaultCollapseIcon={<ExpandMoreIcon/>}
                        defaultExpandIcon={<ChevronRightIcon/>}
                        sx={{flexGrow: 2, overflowY: 'auto'}}
                    >
                        {specialtyList.map((category) => (
                            <TreeItem nodeId={category.id} label={category.label}
                                      onClick={() => {
                                          setSelectedCategory(category)
                                      }}
                            />
                        ))}
                    </TreeView>)
                }

                <Divider sx={{p: 3}}/>
                <Stack
                    alignItems="center"
                    direction="row"
                    justifyContent="center"
                    spacing={1}
                    sx={{p: 2}}
                >
                    <Stack
                        alignItems="center"
                        direction="row"
                        spacing={1}
                    >
                        <Button
                            color="inherit"
                            onClick={handleClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={specialties.length === 0}
                            variant="contained"
                            onClick={handleSubmit}
                        >
                            Confirm
                        </Button>
                    </Stack>
                </Stack>
            </Dialog>
        </Stack>
    );
}

