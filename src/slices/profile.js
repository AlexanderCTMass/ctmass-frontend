import {createSlice} from '@reduxjs/toolkit';
import {objFromArray} from 'src/utils/obj-from-array';

const initialState = {
    isLoaded: false,
    specialties: {
        byId: {},
        allIds: []
    }
};

const reducers = {
    getProfile(state, action) {
        const profile = action.payload;

        state.specialties.byId = objFromArray(profile.specialties);
        state.specialties.allIds = Object.keys(state.columns.byId);
        state.isLoaded = true;
    }
};


export const slice = createSlice({
    name: 'profile',
    initialState,
    reducers
});

export const {reducer} = slice;