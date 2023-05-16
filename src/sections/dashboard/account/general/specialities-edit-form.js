import * as React from 'react';
import {useCallback, useState} from 'react';
import {
    Box,
    Breadcrumbs,
    Button,
    Checkbox,
    Dialog,
    Divider,
    FormControlLabel,
    FormGroup,
    Link,
    Stack
} from "@mui/material";
import {useKindOfServices} from "src/hooks/use-kind-of-services";
import SpecialityCard from "./specialties-card";
import Typography from "@mui/material/Typography";
import TreeView from '@mui/lab/TreeView';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TreeItem from '@mui/lab/TreeItem';
import toast from "react-hot-toast";
import {ServicesEditForm} from "./services-edit-form";
import {arrayUnion, arrayRemove} from "firebase/firestore";
import {profileApi} from "../../../../api/profile";

export const SpecialitiesEditForm = (props) => {
    const {userSpecialties, userId, onSubmit} = props;
    const specialtyList = useKindOfServices();


    const [open, setOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [addedSpecialties, setAddedSpecialties] = useState([]);
    const [selectedSpec, setSelectedSpec] = useState(null);


    const handleResetCategory = () => {
        setAddedSpecialties([]);
        setSelectedCategory(null);
    }

    const handleClickOpen = () => {
        setOpen(true);
        handleResetCategory();
    };

    const handleClose = () => {
        setOpen(false);
        handleResetCategory();
    };

    const handleAddSpecialties = () => {
        try {
            onSubmit({
                specialties: arrayUnion(...addedSpecialties)
            });
            profileApi.addSpecialties(userId, addedSpecialties);
            setAddedSpecialties([]);
            setOpen(false);
            toast.success('Add successfully');
        } catch (err) {
            console.error(err);
            toast.error('Something went wrong!');
        }
    }

    const handleSelectSpec = (spec, parent) => {
        setSelectedSpec({spec: spec, parent: parent, userId: userId});
    }

    const handleUserSpecialtyRemove = useCallback((userSpecialty) => {
        try {
            onSubmit({
                specialties: arrayRemove(userSpecialty)
            });
            profileApi.removeSpecialty(userId, userSpecialty);
            setSelectedSpec(null);
            toast.success('Remove successfully');
        } catch (err) {
            console.error(err);
            toast.error('Something went wrong!');
        }
    }, []);

    const handleUserSpecialtyChange = useCallback((userSpecialty, values) => {
        try {
            onSubmit({
                specialties: arrayRemove(userSpecialty)
            });
            onSubmit({
                specialties: arrayUnion({
                    ...userSpecialty,
                    values
                })
            });
            setSelectedSpec(null);
            toast.success('Change successfully');
        } catch (err) {
            console.error(err);
            toast.error('Something went wrong!');
        }
    }, []);

    return (
        <Stack direction="column" spacing={2}>
            {userSpecialties.map((spec) => (
                <SpecialityCard speciality={spec} onClick={handleSelectSpec}/>
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
                            (<Link underline="none" key="1" color="inherit" onClick={handleResetCategory}>
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
                                                          setAddedSpecialties([...addedSpecialties, spec]);
                                                      } else {
                                                          setAddedSpecialties(addedSpecialties.filter((s) => s.id !== spec.id));
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
                            disabled={addedSpecialties.length === 0}
                            variant="contained"
                            onClick={handleAddSpecialties}
                        >
                            Confirm
                        </Button>
                    </Stack>
                </Stack>
            </Dialog>
            <ServicesEditForm specialityRoot={selectedSpec}
                              onChange={handleUserSpecialtyChange}
                              onRemove={handleUserSpecialtyRemove}
                              onClose={() => {
                                  setSelectedSpec(null)
                              }}/>
        </Stack>
    );
}

