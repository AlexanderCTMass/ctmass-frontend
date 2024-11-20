import {createContext, useCallback, useEffect, useReducer} from 'react';
import PropTypes from 'prop-types';
import {
    createUserWithEmailAndPassword,
    getAuth,
    GoogleAuthProvider,
    onAuthStateChanged, sendPasswordResetEmail, applyActionCode,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut
} from 'firebase/auth';
import {firebaseApp, firestore} from 'src/libs/firebase';
import {getFirestore, getDoc, addDoc, setDoc, collection, doc} from "firebase/firestore";
import {Issuer} from 'src/utils/auth';
import {roles} from "../../roles";
import {profileApi} from "../../api/profile";
import {generateUrlFromStr} from "../../utils/regexp";
import {emailSender} from "../../libs/email-sender";
import toast from "react-hot-toast";

const auth = getAuth(firebaseApp);

var ActionType;
(function (ActionType) {
    ActionType['AUTH_STATE_CHANGED'] = 'AUTH_STATE_CHANGED';
})(ActionType || (ActionType = {}));

const initialState = {
    isAuthenticated: false,
    isInitialized: false,
    user: null
};

const reducer = (state, action) => {
    if (action.type === 'AUTH_STATE_CHANGED') {
        const {isAuthenticated, user} = action.payload;

        return {
            ...state,
            isAuthenticated,
            isInitialized: true,
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
    sendPasswordResetEmail: () => Promise.resolve(),
    signOut: () => Promise.resolve()
});

export const AuthProvider = (props) => {
    const {children} = props;
    const [state, dispatch] = useReducer(reducer, initialState);

    const handleAuthStateChanged = useCallback(async (user) => {
        if (user) {
            const profileSnap = await profileApi.getSnap(user.uid);
            let profileData;
            if (profileSnap.exists()) {
                profileData = profileSnap.data();
            } else {
                profileData = {
                    id: user.uid,
                    avatar: user.photoURL || null,
                    name: user.displayName || user.email,
                    email: user.email,
                    businessName: user.displayName || user.email,
                    profilePage: generateUrlFromStr(user.displayName || user.email),
                    emailVerified: user.emailVerified || true,
                    phone: user.phoneNumber || null,
                    plan: 'Premium',
                    role: roles.CUSTOMER
                };
                profileApi.set(user.uid, profileData).then(r => {
                    console.log("create profile");

                    emailSender.sendHello(user.email).then(() => {
                        console.log("send hello email");
                        emailSender.sendAdmin_newRegistration(user).then(() => {
                            console.log("send admin new registr email");
                        }).catch((error) => {
                            console.error(error);
                        });
                    }).catch((error) => {

                    });
                });

            }

            if (profileData && profileData.email === "alex.neu.ctmass@gmail.com")
                profileData.role = roles.ADMIN;
            if (profileData && (profileData.email === "zhandarova.00@bk.ru" || profileData.email === "yashuta@yandex.ru" || profileData.email === "nazarovyakov@gmail.com"))
                profileData.role = roles.CONTENT;
            dispatch({
                type: ActionType.AUTH_STATE_CHANGED,
                payload: {
                    isAuthenticated: true,
                    user: profileData
                }
            });
        } else {
            dispatch({
                type: ActionType.AUTH_STATE_CHANGED,
                payload: {
                    isAuthenticated: false,
                    user: null
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

    const signInWithGoogle = useCallback(async () => {
        const provider = new GoogleAuthProvider();

        await signInWithPopup(auth, provider);
    }, []);

    const _createUserWithEmailAndPassword = useCallback(async (email, password) => {
        await createUserWithEmailAndPassword(auth, email, password);
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
