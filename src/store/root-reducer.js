import {combineReducers} from '@reduxjs/toolkit';
import {reducer as calendarReducer} from 'src/slices/calendar';
import {reducer as chatReducer} from 'src/slices/chat';
import {reducer as kanbanReducer} from 'src/slices/kanban';
import {reducer as mailReducer} from 'src/slices/mail';
import {reducer as profileReducer} from 'src/slices/profile';
import {reducer as dictionaryReducer} from 'src/slices/dictionary';

export const rootReducer = combineReducers({
    calendar: calendarReducer,
    chat: chatReducer,
    kanban: kanbanReducer,
    mail: mailReducer,
    profile: profileReducer,
    dictionary: dictionaryReducer
});
