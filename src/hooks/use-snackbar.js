import { useCallback } from 'react';
import { useSnackbar as useNotistackSnackbar } from 'notistack';

export const useSnackbar = () => {
    const { enqueueSnackbar } = useNotistackSnackbar();

    const success = useCallback((message) => {
        enqueueSnackbar(message, { variant: 'success' });
    }, [enqueueSnackbar]);

    const error = useCallback((message) => {
        enqueueSnackbar(message, { variant: 'error' });
    }, [enqueueSnackbar]);

    const warning = useCallback((message) => {
        enqueueSnackbar(message, { variant: 'warning' });
    }, [enqueueSnackbar]);

    const info = useCallback((message) => {
        enqueueSnackbar(message, { variant: 'info' });
    }, [enqueueSnackbar]);

    return {
        success,
        error,
        warning,
        info
    };
};