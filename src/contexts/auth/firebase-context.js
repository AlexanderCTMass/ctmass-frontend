import { createContext, useCallback, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import {
    applyActionCode,
    createUserWithEmailAndPassword,
    FacebookAuthProvider, fetchSignInMethodsForEmail,
    getAuth,
    GoogleAuthProvider,
    onAuthStateChanged,
    sendPasswordResetEmail, sendSignInLinkToEmail,
    signInWithEmailAndPassword, signInWithEmailLink, signInWithPhoneNumber,
    signInWithPopup,
    signOut
} from 'firebase/auth';
import { Notifications } from "src/enums/notifications";
import { firebaseApp, firestore } from 'src/libs/firebase';
import { collection, doc, onSnapshot, serverTimestamp, getDocs, query, where, updateDoc } from "firebase/firestore";
import { Issuer } from 'src/utils/auth';
import { roles } from "../../roles";
import { profileApi } from "../../api/profile";
import { generateUrlFromStr } from "../../utils/regexp";
import { emailSender } from "../../libs/email-sender";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from 'uuid';
import { ERROR, INFO } from "src/libs/log";
import { projectFlow } from "src/flows/project/project-flow";
import { projectsLocalApi } from "src/api/projects/project-local-storage";

const auth = getAuth(firebaseApp);

const ADMIN_EMAILS = ['alex.neu.ctmass@gmail.com', 'george.ctmass@gmail.com'];
const isAdminEmail = (email) => Boolean(email) && ADMIN_EMAILS.includes(email);

var ActionType;
(function (ActionType) {
    ActionType['AUTH_STATE_CHANGED'] = 'AUTH_STATE_CHANGED';
    ActionType['USER_UPDATED'] = 'USER_UPDATED';
})(ActionType || (ActionType = {}));

const initialState = {
    isAuthenticated: false,
    isInitialized: false,
    user: null,
    unsubscribe: null
};

const reducer = (state, action) => {
    if (action.type === ActionType.AUTH_STATE_CHANGED) {
        const { isAuthenticated, user, unsubscribe } = action.payload;
        INFO("Auth state changed");
        if (!isAuthenticated) {
            if (state.unsubscribe) {
                INFO("Unsubscribe from profile change")
                state.unsubscribe();
            }
        }

        return {
            ...state,
            isAuthenticated,
            isInitialized: true,
            user, unsubscribe
        };
    }

    if (action.type === ActionType.USER_UPDATED) {
        const { user } = action.payload;
        if (!state.isAuthenticated)
            return state;

        INFO("User update");
        return {
            ...state,
            user
        };
    }

    return state;
};

export const AuthContext = createContext({
    ...initialState,
    issuer: Issuer.Firebase,
    createUserWithEmailAndPassword: () => Promise.resolve(),
    signInWithEmailAndPassword: () => Promise.resolve(),
    signInWithGoogle: () => Promise.resolve(),
    signInWithFacebook: () => Promise.resolve(),
    sendPasswordResetEmail: () => Promise.resolve(),
    signInWithEmailLink: () => Promise.resolve(),
    registerWithEmailAndPhone: () => Promise.resolve(),
    unifiedSignIn: () => Promise.resolve(),
    signOut: () => Promise.resolve(),
    setRole: () => Promise.resolve()
});

function addQueryParamWithoutReload(paramValue) {
    const url = new URL(window.location.href);
    url.searchParams.set('returnTo', paramValue);

    // Изменяет URL без перезагрузки
    window.history.pushState({}, '', url.toString());
}

const getPartnerByEmail = async (email) => {
    const q = query(collection(firestore, 'partners'),
        where('contactPerson.email', '==', email));
    const snap = await getDocs(q);
    return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
};

const isActivePartnerRecord = (partner) => {
    if (!partner) {
        return false;
    }

    const status = typeof partner.status === 'string' ? partner.status.toLowerCase() : '';
    return status === 'active';
};

export const AuthProvider = (props) => {
    const { children } = props;
    const [state, dispatch] = useReducer(reducer, initialState);

    const handleAuthStateChanged = useCallback(async (user) => {
        INFO("handleAuthStateChanged", user);
        if (user) {
            const profileSnap = await profileApi.getProfileByEmail(user.email);
            let profileData;

            if (!profileSnap.empty) {
                profileData = profileSnap.docs[0].data();

                const pDoc = await getPartnerByEmail(user.email);
                const hasActivePartnerDoc = isActivePartnerRecord(pDoc);

                if (hasActivePartnerDoc && profileData.role !== roles.PARTNER) {
                    profileData.role = roles.PARTNER;
                    await updateDoc(doc(firestore, 'profiles', profileSnap.docs[0].id),
                        { role: roles.PARTNER });
                    if (!pDoc.uid) {
                        await updateDoc(doc(firestore, 'partners', pDoc.id),
                            { uid: profileSnap.docs[0].id });
                    }
                }

                if (isAdminEmail(profileData?.email)) {
                    profileData.role = roles.ADMIN;
                    profileData.isAdmin = true;
                }
                // if (profileData && (profileData.email === "zhandarova.00@bk.ru" || profileData.email === "yashuta@yandex.ru" || profileData.email === "nazarovyakov@gmail.com"))
                //     profileData.role = roles.CONTENT;

                INFO("Subscribe to profile change in auth", user.email);
                const userDocRef = doc(firestore, 'profiles', profileSnap.docs[0].id);
                const unsubscribe = onSnapshot(userDocRef, (snapshotDoc) => {
                    if (snapshotDoc.exists()) {
                        const updatedUser = snapshotDoc.data();
                        if (isAdminEmail(updatedUser.email)) {
                            updatedUser.isAdmin = true;
                        }
                        dispatch({
                            type: ActionType.USER_UPDATED,
                            payload: {
                                user: updatedUser
                            }
                        });
                    }
                });
                dispatch({
                    type: ActionType.AUTH_STATE_CHANGED,
                    payload: {
                        isAuthenticated: true,
                        user: profileData,
                        unsubscribe
                    }
                });
            } else {
                const partnerDoc = await getPartnerByEmail(user.email);
                const hasActivePartnerDoc = isActivePartnerRecord(partnerDoc);

                const snapshot = await profileApi.getTempProfileByEmail(user.email);
                let tempProfileData;
                if (!snapshot.empty) {
                    tempProfileData = snapshot.docs[0].data();
                }

                const role =
                    hasActivePartnerDoc ? roles.PARTNER :
                        tempProfileData?.isProvider ? roles.WORKER :
                            roles.CUSTOMER;

                const referralCode = tempProfileData?.referredBy || window.localStorage.getItem('referralCode') || null;

                profileData = {
                    id: user.uid,
                    avatar: user.avatar || null,
                    name: user.displayName || tempProfileData?.name || user.email,
                    email: user.email,
                    businessName: user.displayName || tempProfileData?.name || user.email,
                    profilePage: generateUrlFromStr(user.displayName || tempProfileData?.name || user.email),
                    emailVerified: user.emailVerified || false,
                    phone: user.phoneNumber || tempProfileData?.phone || null,
                    plan: 'Base',
                    role: role,
                    registrationAt: serverTimestamp(),
                    notifications: [Notifications.EVENTS_NOTIFICATIONS],
                    notificationList: [],
                    ...(referralCode && { referredBy: referralCode })
                };

                if (referralCode) {
                    window.localStorage.removeItem('referralCode');
                }

                if (isAdminEmail(profileData?.email)) {
                    profileData.role = roles.ADMIN;
                    profileData.isAdmin = true;
                }
                if (profileData && (profileData.email === "zhandarova.00@bk.ru" || profileData.email === "yashuta@yandex.ru" || profileData.email === "nazarovyakov@gmail.com"))
                    profileData.role = roles.CONTENT;

                await profileApi.createProfile(user.uid, profileData);

                if (hasActivePartnerDoc) {
                    await updateDoc(
                        doc(firestore, 'partners', partnerDoc.id),
                        { uid: user.uid }
                    );
                }
                try {
                    if (tempProfileData?.project) {
                        await projectFlow.create(tempProfileData?.project, profileData);
                        await projectsLocalApi.deleteProject();
                    }
                } catch (e) {
                    toast.error("Error while creating project", {
                        id: uuidv4()
                    });
                }
                await profileApi.deleteTempProfile(user.email);
                try {
                    await emailSender.sendHello(user);
                    INFO("Send hello email");
                    await emailSender.sendAdmin_newRegistration(user);
                    INFO("send admin new registration email");
                } catch (e) {
                    ERROR(e);
                }

                const userDocRef = doc(firestore, 'profiles', user.uid);
                const unsubscribe = onSnapshot(userDocRef, (snapshotDoc) => {
                    if (snapshotDoc.exists()) {
                        const updatedUser = snapshotDoc.data();
                        if (isAdminEmail(updatedUser.email)) {
                            updatedUser.isAdmin = true;
                        }
                        dispatch({
                            type: ActionType.USER_UPDATED,
                            payload: {
                                user: updatedUser
                            }
                        });
                    }
                });

                dispatch({
                    type: ActionType.AUTH_STATE_CHANGED,
                    payload: {
                        isAuthenticated: true,
                        user: profileData,
                        unsubscribe
                    }
                });
            }
        } else {
            dispatch({
                type: ActionType.AUTH_STATE_CHANGED,
                payload: {
                    isAuthenticated: false,
                    user: null,
                    unsubscribe: null
                }
            });
        }
    }, [dispatch]);

    useEffect(() => onAuthStateChanged(auth, handleAuthStateChanged),
        []);

    const _signInWithEmailAndPassword = useCallback(async (email, password) => {
        await signInWithEmailAndPassword(auth, email, password);
    }, []);

    const _sendPasswordResetEmail = useCallback(async (restoredEmail) => {
        await sendPasswordResetEmail(auth, restoredEmail);
    }, []);

    const _handleVerifyEmail = useCallback(async (actionCode, continueUrl, lang) => {
        await applyActionCode(auth, actionCode);
    }, []);

    const unifiedSignIn = async (email, phone) => {
        const auth = getAuth();

        if (email) {
            // Проверяем существование email
            const methods = await fetchSignInMethodsForEmail(auth, email);
            if (methods.length > 0) {
                const actionCodeSettings = {
                    url: window.location.href,
                    handleCodeInApp: true
                };
                await sendSignInLinkToEmail(auth, email, actionCodeSettings);
                return { exists: true };
            }
            return { exists: false };
        }

        if (phone) {
            // Для телефона проверяем через API
            const isRegistered = await profileApi.checkExistPhone(phone);
            if (isRegistered) {
                const appVerifier = window.recaptchaVerifier;
                const confirmation = await signInWithPhoneNumber(auth, phone, appVerifier);
                return { exists: true, confirmation };
            }
            return { exists: false };
        }

        throw new Error('No email or phone provided');
    };

    const _registerWithEmailAndPhone = async (email, phone, isProvider, link) => {
        try {
            // 1. Send sign in link to email
            const actionCodeSettings = {
                url: link,
                handleCodeInApp: true,
            };

            await sendSignInLinkToEmail(auth, email, actionCodeSettings);
            window.localStorage.setItem('emailForSignIn', email);
            return true;
        } catch (error) {
            throw error;
        }
    };

    const signInWithFacebook = useCallback(async () => {
        const provider = new FacebookAuthProvider();
        provider.addScope('email');
        provider.setCustomParameters({
            'display': 'popup'
        });
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            // Step 2: User's email already exists.
            if (error.code === "auth/account-exists-with-different-credential") {
                // The pending Facebook credential.
                let pendingCred = error.credential;
                console.log(pendingCred);

                // Step 3: Save the pending credential in temporary storage,

                // Step 4: Let the user know that they already have an account
                // but with a different provider, and let them choose another
                // sign-in method.
                toast.error('You already have an account with the same email address as on facebook!');
                throw error;
            }
        }
    }, []);


    const signInWithGoogle = useCallback(async () => {
        const provider = new GoogleAuthProvider();

        try {
            return await signInWithPopup(auth, provider);
        } catch (error) {
            // Step 2: User's email already exists.
            if (error.code === "auth/account-exists-with-different-credential") {
                // The pending Facebook credential.
                let pendingCred = error.credential;
                console.log(pendingCred);

                // Step 3: Save the pending credential in temporary storage,

                // Step 4: Let the user know that they already have an account
                // but with a different provider, and let them choose another
                // sign-in method.
                toast.error('You already have an account with the same email address as on google!');
                throw error;
            }
        }
    }, []);

    const _signInWithEmailLink = useCallback(async (email, link) => {
        return await signInWithEmailLink(auth, email, link);
    }, []);

    const _createUserWithEmailAndPassword = useCallback(async (email, password) => {
        return await createUserWithEmailAndPassword(auth, email, password);
    }, []);

    const _signOut = useCallback(async () => {
        await signOut(auth);
    }, []);

    const setRole = useCallback(async (newRole) => {
        const userId = state.user?.id;
        if (!userId) return;
        if (newRole === roles.ADMIN && !isAdminEmail(state.user?.email)) return;
        await updateDoc(doc(firestore, 'profiles', userId), { role: newRole });
    }, [state.user]);

    return (
        <AuthContext.Provider
            value={{
                ...state,
                issuer: Issuer.Firebase,
                createUserWithEmailAndPassword: _createUserWithEmailAndPassword,
                signInWithEmailAndPassword: _signInWithEmailAndPassword,
                sendPasswordResetEmail: _sendPasswordResetEmail,
                signInWithEmailLink: _signInWithEmailLink,
                unifiedSignIn,
                signInWithGoogle,
                signInWithFacebook,
                registerWithEmailAndPhone: _registerWithEmailAndPhone,
                signOut: _signOut,
                setRole
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired
};

export const AuthConsumer = AuthContext.Consumer;