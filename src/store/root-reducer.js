import { combineReducers } from '@reduxjs/toolkit';
import { reducer as calendarReducer } from 'src/slices/calendar';
import { reducer as chatReducer } from 'src/slices/chat';
import { reducer as chatNewReducer } from 'src/slices/chatNew';
import { reducer as dictionaryReducer } from 'src/slices/dictionary';
import { reducer as kanbanReducer } from 'src/slices/kanban';
import { reducer as mailReducer } from 'src/slices/mail';
import { reducer as profileReducer } from 'src/slices/profile';
import { reducer as projectsReducer } from 'src/slices/projects';
import { reducer as userProfileSettingsReducer } from 'src/slices/userProfileSettings';
import { reducer as messengerReducer } from 'src/slices/messenger'

export const rootReducer = combineReducers({
    calendar: calendarReducer,
    chat: chatReducer,
    chatNew: chatNewReducer,
    kanban: kanbanReducer,
    mail: mailReducer,
    profile: profileReducer, //?
    dictionary: dictionaryReducer,
    projects: projectsReducer,
    userProfileSettings: userProfileSettingsReducer,
    messenger: messengerReducer
});
