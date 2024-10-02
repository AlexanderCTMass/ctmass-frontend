import {TreeItem, TreeView} from "@mui/lab";
import {ChevronRight, ExpandMore} from "@mui/icons-material";
import {Box, Button, Card, CardActions, Container, Divider, Stack, SvgIcon, TextField, Typography} from "@mui/material";
import * as React from "react";
import {useCallback, useEffect, useState} from "react";
import Grid from "@mui/material/Unstable_Grid2";
import AddIcon from '@mui/icons-material/Add';
import EditTreeItem from "./editTreeItem";
import AddTreeItem from "./addTreeItem";
import {dictionaryApi} from "./dictionaryApi"
import {useDispatch, useSelector} from "../../../store";
import {thunks} from "../../../thunks/dictionary";
import CategoryForm from "./categoryForm";
import SpecialtyForm from "./specialtyForm";
import {usePageView} from "../../../hooks/use-page-view";


const useDictionary = () => {
    const dispatch = useDispatch();
    const dictionary = useSelector((state) => state.dictionary);

    const handleDictionaryGet = useCallback(() => {
        dispatch(thunks.getDictionary({}));
    }, [dispatch]);

    useEffect(() => {
            handleDictionaryGet();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []);

    return {dictionary: dictionary};
};

const SpecialtiesView = () => {
    usePageView();

    const {dictionary} = useDictionary();
    const categories = dictionary.categories.allIds.map((id) => dictionary.categories.byId[id]);
    const specialties = dictionary.specialties.allIds.map((id) => dictionary.specialties.byId[id]);

    const [categoryFormOpen, setCategoryFormOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState({});

    const [specialtyFormOpen, setSpecialtyFormOpen] = useState(false);
    const [selectedSpecialty, setSelectedSpecialty] = useState({});

    const categoryRenderer = category => (category &&
        <React.Fragment key={"categoryRenderer" + category.id}>
            <TreeItem nodeId={category.id.toString()} label={
                <Card
                    onClick={(event) => {
                        setCategoryFormOpen(true);
                        setSelectedCategory(category);
                        event.stopPropagation()
                    }}>
                    <CardActions>
                        <Box
                            sx={{
                                alignItems: 'center',
                                backgroundColor: 'neutral.50',
                                backgroundImage: 'url(' + category.img + ')',
                                backgroundPosition: 'center',
                                backgroundSize: 'cover',
                                borderRadius: 1,
                                display: 'flex',
                                height: 80,
                                justifyContent: 'center',
                                overflow: 'hidden',
                                width: 80
                            }}
                        />
                        <Typography
                            sx={{pl: 2, color: category.accepted ? 'green' : 'red'}}>{category.label}</Typography>
                    </CardActions>
                </Card>
            }>
                {specialties && specialties.filter((spec) => spec.parent === category.id).map(specialty => specialtyRender(specialty))}
                <Button
                    size={"small"}
                    variant={"text"}
                    onClick={() => handleAddSpecialty(category)}
                    startIcon={(
                        <SvgIcon>
                            <AddIcon/>
                        </SvgIcon>
                    )}>
                    Add specialty
                </Button>
            </TreeItem>
        </React.Fragment>
    );

    const specialtyRender = specialty => (<React.Fragment key={"specialtyRender" + specialty.id}>
            <TreeItem nodeId={specialty.id.toString()} label={
                <Card
                    onClick={(event) => {
                        setSpecialtyFormOpen(true);
                        setSelectedSpecialty(specialty);
                        event.stopPropagation()
                    }}>
                    < CardActions>
                        <Box
                            sx={
                                {
                                    alignItems: 'center',
                                    backgroundColor: 'neutral.50',
                                    backgroundImage: 'url(' + specialty.img + ')',
                                    backgroundPosition: 'center',
                                    backgroundSize: 'cover',
                                    borderRadius: 1,
                                    display: 'flex',
                                    height: 80,
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                    width: 80
                                }
                            }
                        />
                        <Typography
                            sx={{pl: 2, color: specialty.accepted ? 'green' : 'red'}}>{specialty.label}</Typography>
                    </CardActions>
                </Card>
            }>
            </TreeItem>
        </React.Fragment>
    );


    const handleAddCategory = () => {
        setCategoryFormOpen(true);
        setSelectedCategory({});
    }

    const handleAddSpecialty = (category) => {
        setSelectedSpecialty({parent: category.id});
        setSpecialtyFormOpen(true);
    }

    return (
        <Container>
            <Stack gutterBottom>
            </Stack>
            <Grid container direction={"row"}>
                <Grid md={6} onClick={() => {
                    if (open === true) {
                        setOpen(false);
                    }
                }}>
                    <TreeView
                        aria-label="Dictionary"
                        defaultCollapseIcon={<ExpandMore/>}
                        defaultExpandIcon={<ChevronRight/>}
                    >
                        {categories.length !== 0 && categories.map(category => categoryRenderer(category))}
                        <Button
                            variant={"text"}
                            size={"small"}
                            onClick={handleAddCategory}
                            startIcon={(
                                <SvgIcon>
                                    <AddIcon/>
                                </SvgIcon>
                            )}>
                            Add category
                        </Button>
                    </TreeView>
                </Grid>
                <Grid md={6}>
                    <CategoryForm
                        open={categoryFormOpen} setOpen={setCategoryFormOpen} category={selectedCategory} allcategories={categories}
                    />
                    <SpecialtyForm
                        open={specialtyFormOpen} setOpen={setSpecialtyFormOpen} specialty={selectedSpecialty}
                    />
                </Grid>
            </Grid>
        </Container>
    );


}
export default SpecialtiesView;
