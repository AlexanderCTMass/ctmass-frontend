import Clarity from '@microsoft/clarity';

const PROJECT_ID = process.env.REACT_APP_CLARITY_PROJECT_ID;

let initialized = false;

export const initClarity = () => {
    if (initialized || !PROJECT_ID) return;
    Clarity.init(PROJECT_ID);
    initialized = true;
};

export const identifyClarityUser = (user) => {
    if (!initialized || !user?.id) return;
    Clarity.identify(user.id, undefined, undefined, user.email || user.name || undefined);
    if (user.role) Clarity.setTag('user_role', user.role);
    if (user.email) Clarity.setTag('user_email', user.email);
};

export const clarityEvent = (name) => {
    if (!initialized || !name) return;
    Clarity.event(name);
};

export const trackClarityPage = (path) => {
    if (!initialized || !path) return;
    Clarity.setTag('page_path', path);
    Clarity.event('page_view');
};
