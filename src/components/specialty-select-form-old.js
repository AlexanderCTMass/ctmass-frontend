import PropTypes from 'prop-types';
import {
    Box,
    Breadcrumbs,
    Button, Card,
    Checkbox,
    Dialog,
    Divider,
    FormControlLabel,
    FormGroup,
    IconButton,
    Input,
    Link,
    Stack,
    SvgIcon,
    Typography,
    Unstable_Grid2 as Grid, useMediaQuery
} from '@mui/material';
import TreeView from "@mui/lab/TreeView";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TreeItem from "@mui/lab/TreeItem";
import * as React from "react";
import {useEffect, useState} from "react";
import {useDispatch, useSelector} from "../store";
import {thunks} from "../thunks/dictionary";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import {v4 as uuidv4} from 'uuid';
import {dictionaryApi} from "../api/dictionary";
import toast from "react-hot-toast";

const useCategories = () => {
    const dispatch = useDispatch();
    const {categories, specialties} = useSelector((state) => state.dictionary);

    useEffect(() => {
            dispatch(thunks.getDictionary());
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []);

    return categories.allIds.map((id) => {
        const category = categories.byId[id];
        const childs = specialties.allIds.map((id) => specialties.byId[id]).filter((spec) => spec.parent === category.id);
        return {...category, childs: childs};
    }).filter((cat) => cat.childs && cat.childs.length > 0);
};

export const SpecialtySelectFormOld = (props) => {
    const {open, onClose, selectedSpecialties, onChange, onSpecialtyChange, disabledSelected = true} = props;

    const specialtyList = useCategories();

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [addedSpecialties, setAddedSpecialties] = useState([]);
    const [newCategories, setNewCategories] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState();
    const [newSpecialtyName, setNewSpecialtyName] = useState();
    const mdUp = useMediaQuery((theme) => theme.breakpoints.up('md'));


    const handleResetCategory = () => {
        setAddedSpecialties([]);
        setSelectedCategory(null);
    }

    const handleClose = () => {
        onClose();
        handleResetCategory();
    };


    return (
        <>
            <Dialog open={open} onClose={handleClose}
                    fullWidth
                    fullHeight
                    fullScreen={!mdUp}
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
                    (<>
                            <FormGroup sx={{p: 3, pt: 0, display: 'flex', flexWrap: 'wrap', flexDirection: 'row'}}>
                                {selectedCategory.childs.map((spec) => {
                                    const includes = selectedSpecialties.map((spec) => spec.id).includes(spec.id);
                                    return (<FormControlLabel
                                            sx={{
                                                width: "49%",
                                                fontStyle: !spec.accepted ? "italic" : "auto",
                                                color: !spec.accepted ? "red" : "auto"
                                            }}
                                            control={
                                                <Checkbox defaultChecked={includes}
                                                          disabled={disabledSelected && includes} name="selected"
                                                          onChange={(event, checked) => {
                                                              if (onSpecialtyChange) {
                                                                  let newValue = [...selectedSpecialties];

                                                                  if (checked) {
                                                                      newValue.push(spec);
                                                                  } else {
                                                                      newValue = newValue.filter((item) => item.id !== spec.id);
                                                                  }

                                                                  onSpecialtyChange?.(newValue);
                                                              } else {
                                                                  if (checked) {
                                                                      setAddedSpecialties([...addedSpecialties, spec]);
                                                                  } else {
                                                                      setAddedSpecialties(addedSpecialties.filter((s) => s.id !== spec.id));
                                                                  }
                                                              }
                                                          }}/>
                                            }
                                            label={<Box>
                                                <Typography variant="subtitle1" component="div">
                                                    {spec.label}
                                                </Typography>
                                                {!spec.accepted && (<Typography variant="caption" component="div">
                                                    not confirmed by the admin
                                                </Typography>)}
                                            </Box>}
                                        />
                                    )
                                })}
                            </FormGroup>
                            <Box sx={{p: 3}}>
                                <Grid
                                    xs={12}
                                    sm={4}
                                >
                                    <Typography
                                        color="text.secondary"
                                        variant="caption"
                                    >
                                        There is no suitable specialty, offer your own version
                                    </Typography>
                                </Grid>
                                <Stack
                                    alignItems="center"
                                    direction="row"
                                    spacing={2}
                                    sx={{pb:1}}
                                >
                                    <Input
                                        fullWidth
                                        disableUnderline
                                        id={"specialtyName"}
                                        value={newSpecialtyName}
                                        onChange={(e) => {
                                            setNewSpecialtyName(e.target.value)
                                        }}
                                        placeholder="Specialty name"
                                        sx={{
                                            borderColor: 'divider',
                                            borderRadius: 1,
                                            borderStyle: 'solid',
                                            borderWidth: 1,
                                            p: 1
                                        }}
                                    />
                                    <IconButton onClick={() => {
                                        if (!newSpecialtyName)
                                            return;

                                        selectedCategory.childs.push({
                                            id: "new_" + uuidv4(),
                                            label: newSpecialtyName,
                                            childs: [],
                                            parent: selectedCategory
                                        });

                                        setNewSpecialtyName("");
                                    }}>
                                        <SvgIcon>
                                            <PlusIcon/>
                                        </SvgIcon>
                                    </IconButton>
                                </Stack>

                                <Typography
                                    color="text.secondary"
                                    variant="caption"
                                >
                                    Please note! The specialty combines services by type of work. For example,
                                    the
                                    specialty "plumber" combines many services related to water supply,
                                    sewerage,
                                    etc. (installation of a mixer, removal of blockages ...)
                                </Typography>

                            </Box>
                        </>
                    )
                    :
                    (<>
                        <TreeView
                            aria-label="service categories"
                            defaultCollapseIcon={<ExpandMoreIcon/>}
                            defaultExpandIcon={<ChevronRightIcon/>}
                            sx={{flexGrow: 2, height: '100%'}}
                        >
                            {[...specialtyList, ...newCategories].map((category) => (
                                <TreeItem nodeId={category.id} label={<Box>
                                    <Typography variant="subtitle1" component="div">
                                        {category.label}
                                    </Typography>
                                    {!category.accepted && (<Typography variant="caption" component="div">
                                        not confirmed by the admin
                                    </Typography>)}
                                </Box>}
                                          sx={{
                                              fontStyle: !category.accepted ? "italic" : "auto",
                                              color: !category.accepted ? "red" : "auto"
                                          }}
                                          onClick={() => {
                                              setSelectedCategory(category)
                                          }}
                                />
                            ))}
                        </TreeView>
                        <Box sx={{p: 3}}>
                            <Grid
                                xs={12}
                                sm={4}
                            >
                                <Typography
                                    color="text.secondary"
                                    variant="caption"
                                >
                                    There is no suitable category, offer your own version
                                </Typography>
                            </Grid>
                            <Stack
                                alignItems="center"
                                direction="row"
                                spacing={2}
                            >
                                <Input
                                    fullWidth
                                    id={"categoryName"}
                                    disableUnderline
                                    value={newCategoryName}
                                    onChange={(e) => {
                                        setNewCategoryName(e.target.value);
                                    }}
                                    placeholder="Category name"
                                    sx={{
                                        borderColor: 'divider',
                                        borderRadius: 1,
                                        borderStyle: 'solid',
                                        borderWidth: 1,
                                        p: 1
                                    }}
                                />

                                <IconButton onClick={() => {
                                    if (!newCategoryName)
                                        return;

                                    setNewCategories((prevState) => {
                                        return [...prevState, {
                                            id: "new_" + uuidv4(),
                                            label: newCategoryName,
                                            childs: []
                                        }]
                                    });
                                    setNewCategoryName("");
                                }}>
                                    <SvgIcon>
                                        <PlusIcon/>
                                    </SvgIcon>
                                </IconButton>
                            </Stack>
                        </Box>
                    </>)
                }
                <Box sx={{p: 3}}>
                    <Typography
                        color="text.secondary"
                        variant="caption"
                    >
                        You can choose from the list an unconfirmed category or specialty that someone else has added or
                        suggest yourself. As soon as the administrator confirms it, it will be displayed in the profile
                        as usual
                    </Typography>
                </Box>
                <Divider/>
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
                            {onSpecialtyChange ? "Close" : "Cancel"}
                        </Button>
                        {onSpecialtyChange || (
                            <Button
                                disabled={disabledSelected && addedSpecialties.length === 0}
                                variant="contained"
                                onClick={async () => {
                                    try {
                                        let parentId = selectedCategory.id;
                                        if (parentId.startsWith("new_")) {
                                            let response = await dictionaryApi.addCategory({label: selectedCategory.label});
                                            parentId = response.id;
                                        }
                                        let forAddedSpec = [];
                                        for (const specialty of addedSpecialties) {
                                            if (specialty.id.startsWith("new_")) {
                                                let response = await dictionaryApi.addSpecialty({
                                                    label: specialty.label,
                                                    parent: parentId
                                                });
                                                forAddedSpec.push(response);
                                            } else {
                                                forAddedSpec.push(specialty);
                                            }
                                        }
                                        onChange(forAddedSpec);
                                        handleClose();
                                    } catch (error) {
                                        toast.error('Something went wrong!');
                                        console.error(error);
                                    }
                                }}
                            >
                                Confirm
                            </Button>)}
                    </Stack>
                </Stack>
            </Dialog>
        </>
    );
};

SpecialtySelectFormOld.propTypes = {
    open: PropTypes.bool.isRequired,
    selectedSpecialties: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired
};
