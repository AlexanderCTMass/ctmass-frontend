const PRODUCTION_PROJECT_ID = "ctmass-8f048";

const isProduction = process.env.REACT_APP_FIREBASE_projectId === PRODUCTION_PROJECT_ID;

const resolveSendRealEmail = () => {
    const override = process.env.REACT_APP_EMAIL_SEND_ENABLED;
    if (override === "true") return true;
    if (override === "false") return false;
    return isProduction;
};

export const EmailSenderFeatureToggles = {
    isProduction,
    sendRealEmail: resolveSendRealEmail(),
    sendAdminNotifications: isProduction,
    replaceEmails: false
};
