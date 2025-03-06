import React, {createContext, useState} from 'react';
import ContextDialog from "src/components/context-dialog";

// Создаем контекст
export const DialogContext = createContext();

// Провайдер контекста
export const DialogProvider = ({children}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [dialogConfig, setDialogConfig] = useState({
        icon: null,
        title: '',
        message: '',
        buttons: null,
    });

    const openDialog = (config) => {
        setDialogConfig(config);
        setIsOpen(true);
    };

    const closeDialog = () => {
        setIsOpen(false);
    };

    return (
        <DialogContext.Provider value={{openDialog, closeDialog}}>
            {children}
            {/* Компонент диалога */}
            <ContextDialog
                icon={dialogConfig.icon}
                title={dialogConfig.title}
                message={dialogConfig.message}
                buttons={dialogConfig.buttons}
                onClose={closeDialog}
                open={isOpen}
            />
            )
        </DialogContext.Provider>
    );
};