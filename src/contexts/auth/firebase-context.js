import {createContext, useCallback, useEffect, useReducer} from 'react';
import PropTypes from 'prop-types';
import {
    applyActionCode,
    createUserWithEmailAndPassword,
    FacebookAuthProvider,
    getAuth,
    GoogleAuthProvider,
    onAuthStateChanged,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut
} from 'firebase/auth';
import {Notifications} from "src/enums/notifications";
import {firebaseApp, firestore} from 'src/libs/firebase';
import {addDoc, collection, doc, onSnapshot, serverTimestamp} from "firebase/firestore";
import {Issuer} from 'src/utils/auth';
import {roles} from "../../roles";
import {profileApi} from "../../api/profile";
import {generateUrlFromStr} from "../../utils/regexp";
import {emailSender} from "../../libs/email-sender";
import toast from "react-hot-toast";
import {v4 as uuidv4} from 'uuid';
import {ERROR, INFO} from "src/libs/log";

const auth = getAuth(firebaseApp);

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
        const {isAuthenticated, user} = action.payload;
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
            user
        };
    }

    if (action.type === ActionType.USER_UPDATED) {
        const {user} = action.payload;
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
    signOut: () => Promise.resolve()
});

export const AuthProvider = (props) => {
    const {children} = props;
    const [state, dispatch] = useReducer(reducer, initialState);

    const handleAuthStateChanged = useCallback(async (user) => {
        INFO("handleAuthStateChanged", user);
        if (user) {
            const profileSnap = await profileApi.getProfileByEmail(user.email);
            let profileData;
            if (!profileSnap.empty) {
                profileData = profileSnap.docs[0].data();
                if (profileData && (profileData.email === "alex.neu.ctmass@gmail.com" || profileData.email === "rusl102kr@gmail.com"))
                    profileData.role = roles.ADMIN;
                // if (profileData && (profileData.email === "zhandarova.00@bk.ru" || profileData.email === "yashuta@yandex.ru" || profileData.email === "nazarovyakov@gmail.com"))
                //     profileData.role = roles.CONTENT;

                INFO("Subscribe to profile change in auth", user.email);
                const userDocRef = doc(firestore, 'profiles', profileSnap.docs[0].id);
                const unsubscribe = onSnapshot(userDocRef, (doc) => {
                    if (doc.exists()) {
                        const updatedUser = doc.data();
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
                profileData = {
                    id: user.uid,
                    avatar: user.photoURL || null,
                    name: user.displayName || user.email,
                    email: user.email,
                    businessName: user.displayName || user.email,
                    profilePage: generateUrlFromStr(user.displayName || user.email),
                    emailVerified: user.emailVerified || false,
                    phone: user.phoneNumber || null,
                    plan: 'Base',
                    role: roles.CUSTOMER,
                    registrationAt: serverTimestamp(),
                    notifications: [Notifications.EVENTS_NOTIFICATIONS],
                    notificationList: []
                };

                if (profileData && profileData.email === "alex.neu.ctmass@gmail.com")
                    profileData.role = roles.ADMIN;
                if (profileData && (profileData.email === "zhandarova.00@bk.ru" || profileData.email === "yashuta@yandex.ru" || profileData.email === "nazarovyakov@gmail.com"))
                    profileData.role = roles.CONTENT;

                await profileApi.createProfile(user.uid, profileData);
                try {
                    await emailSender.sendHello(user);
                    INFO("Send hello email");
                    await emailSender.sendAdmin_newRegistration(user);
                    INFO("send admin new registration email");
                } catch (e) {
                    ERROR(e);
                }

                const userDocRef = doc(firestore, 'profiles', user.uid);
                const unsubscribe = onSnapshot(userDocRef, (doc) => {
                    if (doc.exists()) {
                        const updatedUser = doc.data();
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

    const _createUserWithEmailAndPassword = useCallback(async (email, password) => {
        return await createUserWithEmailAndPassword(auth, email, password);
    }, []);

    const _signOut = useCallback(async () => {
        await signOut(auth);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                ...state,
                issuer: Issuer.Firebase,
                createUserWithEmailAndPassword: _createUserWithEmailAndPassword,
                signInWithEmailAndPassword: _signInWithEmailAndPassword,
                sendPasswordResetEmail: _sendPasswordResetEmail,
                signInWithGoogle,
                signInWithFacebook,
                signOut: _signOut
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
