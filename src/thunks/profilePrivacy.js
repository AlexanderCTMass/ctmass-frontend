import { createAsyncThunk } from '@reduxjs/toolkit';
import { profileApi } from '../api/profile';
import { profileActions } from '../slices/profile';
import { useAuth } from "../hooks/use-auth";
import { getAuth } from 'firebase/auth';

export const savePrivacyThunk = createAsyncThunk(
    'profile/savePrivacy',
    async (updates, { dispatch, rejectWithValue }) => {
        const user = getAuth().currentUser;
        if (!user) return rejectWithValue('Not authenticated');

        dispatch(profileActions.updatePrivacy(updates));

        try {
            await profileApi.update(user.uid, { privacySettings: updates });
        } catch (e) {
            if (e?.code !== 'permission-denied')
                dispatch(profileActions.updatePrivacy(
                    prev => ({ ...prev, ...Object.keys(updates).reduce((o, k) => (o[k] = !updates[k], o), {}) })
                ));
            return rejectWithValue(e.message);
        }
    }
);