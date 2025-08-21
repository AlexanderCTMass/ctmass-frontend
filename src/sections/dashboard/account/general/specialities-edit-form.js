import * as React from 'react';
import { useCallback, useState } from 'react';
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
import { useKindOfServices } from "src/hooks/use-kind-of-services";
import SpecialityCard from "./specialties-card";
import Typography from "@mui/material/Typography";
import TreeView from '@mui/lab/TreeView';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TreeItem from '@mui/lab/TreeItem';
import toast from "react-hot-toast";
import { ServicesEditForm } from "./services-edit-form";
import { arrayUnion, arrayRemove } from "firebase/firestore";
import { profileApi } from "../../../../api/profile";
import { SpecialtySelectForm } from "../../../../components/specialty-select-form";

export const SpecialitiesEditForm = (props) => {
    const { userSpecialties, userId, onSubmit } = props;
    const [open, setOpen] = useState(false);
    const [selectedSpec, setSelectedSpec] = useState(null);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClickClose = () => {
        setOpen(false);
    };

    const handleAddSpecialties = (addedSpecialties) => {
        try {
            profileApi.addSpecialties(userId, [addedSpecialties]).then(r => {
                onSubmit({});
                handleClickClose();
                toast.success(addedSpecialties.label + ' added successfully');
            });
        } catch (err) {
            console.error(err);
            toast.error('Something went wrong!');
        }
    }

    const handleSelectSpec = (spec, parent) => {
        setSelectedSpec({ spec: spec, parent: parent, userId: userId });
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
            {userSpecialties.map((spec) => {
                console.log(spec)
                return (<SpecialityCard
                    key={spec.id || spec.label}
                    speciality={spec}
                    onClick={handleSelectSpec}
                />)
            })}
            <Button
                variant="outlined"
                onClick={handleClickOpen}
            >
                Add specialities
            </Button>
            <SpecialtySelectForm open={open} selectedSpecialties={userSpecialties}
                onChange={handleAddSpecialties} onClose={handleClickClose} />
            <ServicesEditForm specialityRoot={selectedSpec}
                onChange={handleUserSpecialtyChange}
                onRemove={handleUserSpecialtyRemove}
                onClose={() => {
                    setSelectedSpec(null)
                }} />
        </Stack>
    );
}

