import {createAsyncThunk} from '@reduxjs/toolkit';
import debug from "debug";
import {usersApi} from "src/api/users";

const logger = debug("[UserProfile Thunks]")

export const setUserThunk = createAsyncThunk(
    'userProfileSettings/setUser',
    async (userId, {rejectWithValue}) => {
        try {
            return await usersApi.getUserWithSpecialties(userId);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);


// Обновить пользователя
export const updateUserThunk = createAsyncThunk(
    'userProfileSettings/updateUser',
    async ({userId, updates}, {rejectWithValue}) => {
        try {
            await usersApi.updateUser(userId, updates);
            return {userId, updates};
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Удалить пользователя
export const deleteUserThunk = createAsyncThunk(
    'userProfileSettings/deleteUser',
    async (userId, {rejectWithValue}) => {
        try {
            await usersApi.deleteUser(userId);
            return userId;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Добавить уведомление
export const addNotificationThunk = createAsyncThunk(
    'userProfileSettings/addNotification',
    async ({userId, notificationKey, value}, {rejectWithValue}) => {
        try {
            await usersApi.addNotification(userId, notificationKey, value);
            return {userId, notification: {[notificationKey]: value}};
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Удалить уведомление
export const removeNotificationThunk = createAsyncThunk(
    'userProfileSettings/removeNotification',
    async ({userId, notificationKey, value}, {rejectWithValue}) => {
        try {
            await usersApi.removeNotification(userId, notificationKey, value);
            return {userId, notification: {[notificationKey]: value}};
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);