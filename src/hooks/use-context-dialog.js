import {useContext} from 'react';
import {DialogContext} from "src/contexts/dialog-context";

export const useContextDialog = () => {
    const {openDialog, closeDialog} = useContext(DialogContext);
    return {openDialog, closeDialog};
};