import {createSlice} from '@reduxjs/toolkit';
import {childsFromArray, objFromArray} from 'src/utils/obj-from-array';

const initialState = {
    categories: {
        byId: {},
        allIds: []
    },
    specialties: {
        byId: {},
        allIds: []
    },
    services: {
        byId: {},
        allIds: []
    }
};

const reducers = {
    getDictionary(state, action) {
        const dictionary = action.payload;
        state.categories.byId = objFromArray(dictionary.categories);
        state.categories.allIds = Object.keys(state.categories.byId);

        state.specialties.byId = objFromArray(dictionary.specialties);
        state.specialties.allIds = Object.keys(state.specialties.byId);

        state.services.byId = objFromArray(dictionary.services);
        state.services.allIds = Object.keys(state.services.byId);
    },
    getAllServiceCategorized(state, action) {
        const dictionary = action.payload;
        state.categories.byId = objFromArray(dictionary);
        state.categories.allIds = Object.keys(state.categories.byId);


        const allSpec = [];
        dictionary.map(category => {
            if (category.specialties)
                allSpec.push(...category.specialties);
        })
        state.specialties.byId = objFromArray(allSpec);
        state.specialties.allIds = Object.keys(state.specialties.byId);
        state.specialties.idsByCategoryId = childsFromArray(allSpec);
        state.lastId = dictionary.lastId;

    },
    getCategories(state, action) {
        const dictionary = action.payload;
        state.categories.byId = objFromArray(dictionary);
        state.categories.allIds = Object.keys(state.categories.byId);

        const allSpec = [];
        dictionary.map(category => {
            if (category.childs)
                allSpec.push(...category.childs);
        })
        state.specialties.byId = objFromArray(allSpec);
        state.specialties.allIds = Object.keys(state.specialties.byId);
        state.specialties.idsByCategoryId = childsFromArray(allSpec);
        state.lastId = dictionary.lastId;

    },
    getSpecialties(state, action) {
        const dictionary = action.payload;
        console.log(dictionary);
        state.categories.byId = objFromArray(dictionary);
        state.categories.allIds = Object.keys(state.categories.byId);

        const allSpec = [];
        dictionary.map(category => {
            if (category.childs)
                allSpec.push(...category.childs);
        })
        state.specialties.byId = objFromArray(allSpec);
        state.specialties.allIds = Object.keys(state.specialties.byId);
        state.specialties.idsByCategoryId = childsFromArray(allSpec);
        state.lastId = dictionary.lastId;

    },
    getCategory(state, action) {
        const category = action.payload;

        state.categories.byId[category.id] = category;

        if (!state.categories.allIds.includes(category.id)) {
            state.categories.allIds.push(category.id);
        }
    },

    addCategory(state, action) {
        const category = action.payload;
        state.categories.byId[category.id] = category;
        if (!state.categories.allIds.includes(category.id)) {
            state.categories.allIds.push(category.id);
        }
    },

    updateCategory(state, action) {
        const category = action.payload;
        state.categories.byId[category.id] = category;
    },
    removeCategory(state, action) {
        const categoryId = action.payload;

        delete state.categories.byId[categoryId];
        state.categories.allIds = state.categories.allIds.filter((id) => id !== categoryId);
    },

    addSpecialty(state, action) {
        const specialty = action.payload;
        state.specialties.byId[specialty.id] = specialty;
        if (!state.specialties.allIds.includes(specialty.id)) {
            state.specialties.allIds.push(specialty.id);
        }
    },

    updateSpecialty(state, action) {
        const specialty = action.payload;
        state.specialties.byId[specialty.id] = specialty;
    },

    removeSpecialty(state, action) {
        const specialtyId = action.payload;

        delete state.specialties.byId[specialtyId];
        state.specialties.allIds = state.specialties.allIds.filter((id) => id !== specialtyId);
    },

    addNewCategoryWithoutSave(state, action) {
        const category = action.payload;
        state.categories.byId[category.id] = category;
        if (!state.categories.allIds.includes(category.id)) {
            state.categories.allIds.push(category.id);
        }
    }
};

export const slice = createSlice({
    name: 'dictionary',
    initialState,
    reducers
});

export const {reducer} = slice;
