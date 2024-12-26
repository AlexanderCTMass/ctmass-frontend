import {createContext, useCallback, useEffect, useReducer} from 'react';
import PropTypes from 'prop-types';
import {
    createUserWithEmailAndPassword,
    getAuth, linkWithPopup,
    GoogleAuthProvider, FacebookAuthProvider,
    onAuthStateChanged, sendPasswordResetEmail, applyActionCode,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut
} from 'firebase/auth';
import {Notifications} from "src/enums/notifications";
import {firebaseApp, firestore} from 'src/libs/firebase';
import {getFirestore, getDoc, addDoc, setDoc, collection, doc, serverTimestamp} from "firebase/firestore";
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
    signInWithFacebook: () => Promise.resolve(),
    sendPasswordResetEmail: () => Promise.resolve(),
    signOut: () => Promise.resolve()
});

export const AuthProvider = (props) => {
    const {children} = props;
    const [state, dispatch] = useReducer(reducer, initialState);

    const handleAuthStateChanged = useCallback(async (user) => {
        if (user) {
            const profileSnap = await profileApi.getProfileByEmail(user.email);
            let profileData;
            if (!profileSnap.empty) {
                profileData = profileSnap.docs[0].data();
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
                    notifications: [Notifications.EMAILS_POST, Notifications.EMAILS_SECURITY]
                };
                profileApi.set(user.uid, profileData).then(r => {
                    console.log("create profile");

                    addDoc(collection(firestore, "specialistPosts"),
                        {
                            createdAt: serverTimestamp(),
                            authorId: profileData.id,

                            authorEmail: profileData.email,
                            authorName: profileData.name,
                            authorAvatar: profileData.avatar,

                            title: 'Hello',
                            description: 'HELLO',

                            postType: "post",
                        }).then(value => {
                        console.log("hello post created")
                    })

                    emailSender.sendHello(user).then(() => {
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
                toast.error('You already have an account with the same email address as on google!');
                throw error;
            }
        }
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
