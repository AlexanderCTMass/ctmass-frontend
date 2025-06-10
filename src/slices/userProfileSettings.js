import {createSlice} from '@reduxjs/toolkit';
import {
    addNotificationThunk,
    createUserThunk,
    deleteUserThunk,
    getUserThunk, removeNotificationThunk, setUserThunk,
    updateUserThunk
} from "src/thunks/userProfileSettings";
import {objFromArray} from 'src/utils/obj-from-array';

const initialState = {
    user: {}, // Хранилище пользователей
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null, // Ошибки
};

const reducers = {};


export const slice = createSlice({
    name: 'userProfileSettings',
    initialState,
    reducers,
    extraReducers: (builder) => {
        builder
            // Создание пользователя
            .addCase(setUserThunk.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(setUserThunk.fulfilled, (state, action) => {
                const {...userData} = action.payload;
                state.user = userData;
                state.status = 'succeeded';
            })
            .addCase(setUserThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // Обновление пользователя
            .addCase(updateUserThunk.fulfilled, (state, action) => {
                const {userId, updates} = action.payload;
                state.user = {
                    ...state.user,
                    ...updates,
                };
            })

            // Добавление уведомления
            .addCase(addNotificationThunk.fulfilled, (state, action) => {
                const {userId, notification} = action.payload;
                state.user.notifications = [
                    ...(state.user.notifications || []),
                    notification,
                ];
            })

            // Удаление уведомления
            .addCase(removeNotificationThunk.fulfilled, (state, action) => {
                const {userId, notification} = action.payload;
                state.user.notifications = state.user.notifications.filter(
                    (notif) => JSON.stringify(notif) !== JSON.stringify(notification)
                );
            });
    }
});

export const {reducer} = slice;