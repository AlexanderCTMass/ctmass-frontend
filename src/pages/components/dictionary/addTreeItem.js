import { Box, Button, Drawer, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { dictionaryApi } from "./dictionaryApi"
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../../../libs/firebase";
import toast from "react-hot-toast";

const AddTreeItem = (props) => {
    const { parent, parentType, categories, setCategories, open, setOpen, lastId, setLastId } = props;
    const [selectName, setSelectName] = useState("");
    const [icon, setIcon] = useState();
    const [image, setImage] = useState();
    const fileInputRef = useRef(null);
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
            const parentId = parent === null ? 0 : parent.id;
            const storageRef = ref(storage, '/specialties/' + parentId + selectName);
            uploadBytes(storageRef, icon).then((snapshot) => {
                getDownloadURL(storageRef).then((url) => {
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
        let imgValue = image ? image : null
        const lId = lastId !== undefined ? lastId + 1 : 1
        setLastId(lId)
        if (parentType === null) {
            dictionaryApi.addSpecialty({
                id: lId,
                img: imgValue,
                label: selectName,
            }, categories, setCategories, lId)
        }
        if (parentType === "category") {
            const newVar = {
                id: lId,
                img: imgValue,
                label: selectName,
                parent: parent.id
            };
            parent.childs = parent.childs ? [...parent.childs, newVar] : [newVar];
            for (let i = 0; i < categories.length; i++) {
                if (categories[i].id === parent.id) {
                    categories[i] = parent;
                    dictionaryApi.save(categories, lId)
                    break;
                }
            }
        }
        if (parentType === "specialty") {
            let isDone = false;
            const newVar = {
                id: lId,
                img: imgValue,
                name: selectName,
                parent: parent.id
            };
            let temp = parent;
            temp.services = parent.services ? [...parent.services, newVar] : [newVar];

            for (let i = 0; i < categories.length; i++) {
                if (!isDone && categories[i].childs) {
                    for (let j = 0; j < categories[i].childs.length; j++) {
                        if (categories[i].childs[j].id === parent.id) {
                            categories[i].childs[j] = temp;
                            dictionaryApi.save(categories, lId)
                            isDone = true;
                            break;
                        }
                    }
                }
            }
            setCategories([...categories]);
        }
        setOpen(false)
        setSelectName("")
        setIcon(null)
        setImage(null)
    }

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={() => {
                setOpen(null);
                setSelectName("")
            }}
            PaperProps={{
                sx: {
                    maxWidth: 500
                }
            }}>
            <Box sx={{ p: 3 }}>
                <Typography variant="h5" component="div"
                    sx={{
                        marginBottom: "30px"
                    }}>
                    Add entry
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
                        fullWidth />

                    <Button color="success"
                        variant="outlined"
                        fullWidth
                        sx={{ mt: "30px" }}
                        onClick={handleAttach}

                    >
                        Attach icon
                    </Button>
                    <input
                        hidden
                        ref={fileInputRef}
                        type="file"
                        onChange={handleIcon}
                    />

                    <Button color="info"
                        variant="contained"
                        fullWidth
                        sx={{ mt: "30px" }}
                        onClick={() => {
                            if (icon)
                                loadIcon()
                            else updateData()
                        }}
                    > Add </Button>
                </Grid>
            </Box>
        </Drawer>
    )
}

export default AddTreeItem;