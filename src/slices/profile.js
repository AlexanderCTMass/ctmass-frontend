import { createSlice } from '@reduxjs/toolkit';
import { objFromArray } from 'src/utils/obj-from-array';

export const DEFAULT_PRIVACY = {
    name: true,
    email: false,
    phone: false,
    location: false
};

const initialState = {
    isLoaded: false,
    privacySettings: DEFAULT_PRIVACY,
    specialties: {
        byId: {},
        allIds: []
    }
};

const reducers = {
    getProfile(state, action) {
        const profile = action.payload.profile ?? action.payload;

        state.privacySettings = { ...DEFAULT_PRIVACY, ...(profile.privacySettings ?? {}) }
        state.specialties.byId = objFromArray(profile.specialties);
        state.specialties.allIds = Object.keys(state.specialties.byId);
        state.isLoaded = true;
    },
    updatePrivacy(state, action) {
        state.privacySettings = { ...state.privacySettings, ...action.payload };
    }
};


export const slice = createSlice({
    name: 'profile',
    initialState,
    reducers
});

export const { reducer, actions: profileActions } = slice;