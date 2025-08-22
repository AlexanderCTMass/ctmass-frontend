import { useDispatch as useReduxDispatch, useSelector as useReduxSelector } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from './root-reducer';

export const store = configureStore({
    reducer: rootReducer,
    devTools: process.env.REACT_APP_ENABLE_REDUX_DEV_TOOLS === 'true',
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['chat/getThreads'],
                ignoredPaths: ['chat.threads'],
            },
        }),
});

export const useSelector = useReduxSelector;

export const useDispatch = () => useReduxDispatch();
