import {profileApi} from "../api/profile";
import {slice} from "../slices/profile";
import {useAuth} from "../hooks/use-auth";

const getProfile = () => async (dispatch) => {
    const {user} = useAuth();
    alert("!");
    const data = await profileApi.getSpecialties(user.id);

    dispatch(slice.actions.getProfile({profile: {specialties: data}}));
};

export const thunks = {
    getProfile
}