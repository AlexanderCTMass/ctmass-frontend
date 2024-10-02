import {Avatar, Box, Button, ButtonGroup, Drawer, SvgIcon, TextField, Typography} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import * as React from "react";
import {dictionaryApi} from "./dictionaryApi";
import {useCallback, useEffect, useRef, useState} from "react";
import toast from "react-hot-toast";
import {getDownloadURL, ref, uploadBytes} from "firebase/storage";
import {storage} from "../../../libs/firebase";
import {deleteObject} from "firebase/storage";

const EditTreeItem = (props) => {
    const {open, setOpen, selectItem, selectName, setSelectName, categories, setCategories, lastId} = props;
    const fileInputRef = useRef(null);
    const [icon, setIcon] = useState();
    const [image, setImage] = useState();

    const handleAttach = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleIcon = (e) => {
        try {
            e.target.files && setIcon(e.target.files[0])
        } catch (err) {
            console.error(err);
            toast.error('Something went wrong!');
        }
    };

    const loadIcon = useCallback(async () => {
        try {
            deleteIcon();
            const parentId = selectItem.parent ? selectItem.parent : 0;
            const newRef = ref(storage, '/specialties/' + parentId + selectName);

            uploadBytes(newRef, icon).then((snapshot) => {
                getDownloadURL(newRef).then((url) => {
                    setImage(url)
                    toast.success("Images upload successfully!");
                })
            });

        } catch (err) {
            console.error(err);
            toast.error('Something went wrong!');
        }
    }, [icon]);

    useEffect(() => {
        if (image) {
            updateData()
        }
    }, [image])

    const updateData = () => {
        for (let i = 0; i < categories.length; i++) {
            let currentItem = categories[i];
            if (selectItem.id === currentItem.id) {
                console.log(currentItem);
                currentItem.label = selectName
                currentItem.img = image ? image : selectItem.img
                assignValue()
                return;
            } else if (currentItem.childs) {
                for (let i = 0; i < currentItem.childs.length; i++) {
                    let currentChild = currentItem.childs[i];
                    if (currentChild.id === selectItem.id) {
                        currentChild.label = selectName
                        currentChild.img = image ? image : selectItem.img
                        assignValue()
                        return;
                    } else if (currentChild.services) {
                        for (let i = 0; i < currentChild.services.length; i++) {
                            let currentService = currentChild.services[i];
                            if (currentService.id === selectItem.id) {
                                currentService.name = selectName
                                currentService.img = image ? image : selectItem.img
                                assignValue()
                                return;
                            }
                        }
                    }
                }
            }
        }
    }
    const deleteIcon = () => {
        const parentId = selectItem.parent ? selectItem.parent : 0;
        const currentLabel = selectItem.label ? selectItem.label : selectItem.name;
        const storageRef = ref(storage, '/specialties/' + parentId + currentLabel);
        selectItem.img && selectItem.img.length !== 0 && deleteObject(storageRef).then();
    }
    const deleteIconButton = () => {
        deleteIcon();
        selectItem.img = null
        setImage(null);
        toast.success("Images deleted!");
    }

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={() => setOpen(null)}
            PaperProps={{
                sx: {
                    maxWidth: 500
                }
            }}>
            <Box sx={{p: 3}}>
                <Typography variant="h5" component="div"
                            sx={{
                                marginBottom: "30px"
                            }}>
                    Edit entry
                </Typography>
                <Typography
                    color="text.secondary"
                    variant="caption"
                >
                    Speciality name
                </Typography>
                <Grid
                    container
                    alignItems={"center"}
                >
                    <TextField
                        value={selectName} onChange={(e) => {
                        setSelectName(e.target.value)
                    }
                    }
                        fullWidth/>
                    <ButtonGroup
                        variant="outlined"
                        fullWidth
                        sx={{mt: "30px"}}>

                        <Button onClick={handleAttach}>
                            Change icon
                        </Button>
                        <Button onClick={deleteIconButton}>
                            Delete icon
                        </Button>
                    </ButtonGroup>
                    <input
                        hidden
                        ref={fileInputRef}
                        type="file"
                        onChange={handleIcon}
                    />
                    <Button color="info"
                            variant="contained"
                            fullWidth
                            sx={{marginTop: "30px"}}
                            onClick={() => {
                                if (icon)
                                    loadIcon()
                                else updateData()
                            }}
                    >Update</Button>
                    <Button
                        color="error"
                        variant={"contained"}
                        fullWidth
                        sx={{marginTop: "30px"}}
                        onClick={() => {
                            for (let i = 0; i < categories.length; i++) {
                                let currentItem = categories[i];
                                if (selectItem.id === currentItem.id) {
                                    deleteIcon()
                                    categories.splice(i, 1)
                                    assignValue()
                                    return;
                                } else if (currentItem.childs) {
                                    for (let i = 0; i < currentItem.childs.length; i++) {
                                        let currentChild = currentItem.childs[i];
                                        if (currentChild.id === selectItem.id) {
                                            deleteIcon()
                                            currentItem.childs.splice(i, 1)
                                            assignValue()
                                            return;
                                        } else if (currentChild.services) {
                                            for (let i = 0; i < currentChild.services.length; i++) {
                                                let currentService = currentChild.services[i];
                                                if (currentService.id === selectItem.id) {
                                                    deleteIcon()
                                                    currentChild.services.splice(i, 1)
                                                    assignValue()
                                                    return;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        }>Delete</Button>
                </Grid>
            </Box>
        </Drawer>
    )

    function assignValue() {
        dictionaryApi.save(categories, lastId)
        setCategories(categories)
        setIcon(null)
        setImage(null)

        setOpen(false)
    }
}

export default EditTreeItem;