import {dictionaryApi} from 'src/api/dictionary';
import {slice} from 'src/slices/dictionary';

const getAllServiceCategorized = (params) => async (dispatch) => {
    const response = await dictionaryApi.getAllServiceCategorized(params);
    dispatch(slice.actions.getAllServiceCategorized(response));
};

const getDictionary = () => async (dispatch) => {
    const categories = await dictionaryApi.getCategories();
    const specialties = await dictionaryApi.getSpecialties();
    dispatch(slice.actions.getDictionary({categories, specialties}));
};


const getDictionaryWithServices = () => async (dispatch) => {
    const categories = await dictionaryApi.getCategories();
    const specialties = await dictionaryApi.getSpecialties();
    const userSpecialties = await dictionaryApi.getUserSpecialties();

    dispatch(slice.actions.getDictionary({
        categories, specialties: specialties.map((spec) => {
            return {
                ...spec,
                users: userSpecialties.filter((us) => us.specialty === spec.id),
                services: userSpecialties.filter((us) => us.specialty === spec.id).map((us) => us.services || []).flat().map((s) => {
                    return {...s, id: s.name}
                })
            }
        })
    }));
};


const getCategories = (params) => async (dispatch) => {
    // const response = await dictionaryApi.getAllServiceCategorized(params);
    // dispatch(slice.actions.getCategories(response));
};

const addCategory = (category) => async (dispatch) => {
    let response = await dictionaryApi.addCategory(category);

    dispatch(slice.actions.addCategory(response));
};

const updateCategory = (category, id) => async (dispatch) => {
    let response = await dictionaryApi.updateCategory(category, id);

    dispatch(slice.actions.updateCategory(response));
};

const removeCategory = (category) => async (dispatch) => {
    let response = await dictionaryApi.removeCategory(category);

    dispatch(slice.actions.removeCategory(response));
};

const getCategory = (params) => async (dispatch) => {
    const response = await dictionaryApi.getCategory(params);

    dispatch(slice.actions.getCategory(response));
};

const addSpecialty = (specialty) => async (dispatch) => {
    let response = await dictionaryApi.addSpecialty(specialty);

    dispatch(slice.actions.addSpecialty(response));
};

const updateSpecialty = (specialty, id) => async (dispatch) => {
    let response = await dictionaryApi.updateSpecialty(specialty, id);

    dispatch(slice.actions.updateSpecialty(response));
};

const removeSpecialty = (category) => async (dispatch) => {
    let response = await dictionaryApi.removeSpecialty(category);

    dispatch(slice.actions.removeSpecialty(response));
};

const addNewCategoryWithoutSave = (category) => async (dispatch) => {
    console.log(category);
    dispatch(slice.actions.addCategory(category));
};

export const thunks = {
    getDictionary,
    getCategory,
    addCategory,
    updateCategory,
    removeCategory,
    addSpecialty,
    updateSpecialty,
    removeSpecialty,
    getCategories,
    getAllServiceCategorized,
    addNewCategoryWithoutSave,
    getDictionaryWithServices
};
