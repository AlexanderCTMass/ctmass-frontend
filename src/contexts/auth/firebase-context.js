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

                            title: 'Welcome post',
                            description: '<h1>Welcome to CTMASS!</h1>\n' +
                                '<img src="https://firebasestorage.googleapis.com/v0/b/ctmass-8f048.appspot.com/o/static%2Fapple-touch-icon2.png?alt=media&amp;token=5a23306c-428a-412d-af9b-5f3f253b8b48" style="\n' +
                                '    margin: 0 auto;\n' +
                                '    display: block;\n' +
                                '    width: 300px;\n' +
                                '" alt="CTMASS">    ' +
                                '\n' +
                                '    <p>We\'re thrilled to have you join our professional community. Here you\'ll find numerous opportunities to showcase your skills and build successful relationships with clients.</p>\n' +
                                '    \n' +
                                '    <h2>To get started:</h2>\n' +
                                '    \n' +
                                '    <ol>\n' +
                                '        <li><strong>Complete your profile:</strong> Ensure your <a href="' + process.env.REACT_APP_HOST_P + "/dashboard/profile" + '">profile</a> includes all necessary information about your services, experience, and skills. The more details you provide, the easier it will be for clients to find you.</li>\n' +
                                '        \n' +
                                '        <li><strong>Post your offerings:</strong> Create compelling listings for your services so clients can easily understand how you can help them.</li>\n' +
                                '        \n' +
                                '        <li><strong>Stay active:</strong> Respond promptly and courteously to client requests. Good communication is key to successful collaborations.</li>\n' +
                                '        \n' +
                                '        <li><strong>Monitor reviews:</strong> Your reviews play an important role in shaping your image on the platform. Strive to deliver quality services and maintain a high level of customer satisfaction.</li>\n' +
                                '    </ol>\n' +
                                '    \n' +
                                '    <p>Wishing you success and enjoyment as you work on CTMASS! We\'re confident that together we can reach great heights.</p>',

                            postType: "post",
                        }).then(value => {
                        console.log("hello post created")
                        emailSender.sendHello(user).then(() => {
                            console.log("send hello email");
                            emailSender.sendAdmin_newRegistration(user).then(() => {
                                console.log("send admin new registr email");

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

                            }).catch((error) => {
                                console.error(error);
                            });
                        }).catch((error) => {

                        });
                    })


                });
            }


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
