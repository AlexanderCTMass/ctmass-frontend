import {createSlice} from '@reduxjs/toolkit';

// Начальное состояние
const initialState = {
    projects: [],
    loading: false,
    error: null,
};

// Slice для управления состоянием проектов
export const slice = createSlice({
    name: 'projects',
    initialState,
    reducers: {
        fetchStart(state) {
            state.loading = true;
            state.error = null;
        },
        fetchSuccess(state, action) {
            state.projects = action.payload;
            state.loading = false;
            state.error = null;
        },
        fetchFailure(state, action) {
            state.error = action.payload;
            state.loading = false;
        },
    },
});

// Экспорт редьюсера
export const {reducer} = slice;
