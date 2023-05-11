import {createContext, useCallback, useEffect, useReducer} from 'react';
import PropTypes from 'prop-types';
import {
    createUserWithEmailAndPassword,
    getAuth,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut
} from 'firebase/auth';
import {firebaseApp, firestore} from 'src/libs/firebase';
import {getFirestore, getDoc, addDoc, setDoc, collection, doc} from "firebase/firestore";
import {Issuer} from 'src/utils/auth';
import {roles} from "../../roles";

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
    signOut: () => Promise.resolve()
});

export const AuthProvider = (props) => {
    const {children} = props;
    const [state, dispatch] = useReducer(reducer, initialState);

    const handleAuthStateChanged = useCallback(async (user) => {
        if (user) {
            // Here you should extract the complete user profile to make it available in your entire app.
            // The auth state only provides basic information.
            const accountRef = doc(firestore, "accounts", user.uid);
            const accountSnap = await getDoc(accountRef);
            let accountData = {};
            if (accountSnap.exists()) {
                {
                    accountData = accountSnap.data();
                    console.log("Document data:", accountData);
                }
            } else {
                accountData = {
                    id: user.uid,
                    avatar: user.photoURL || undefined,
                    name: user.displayName || "no name",
                    email: user.email,
                    plan: 'Premium',
                    role: roles.WORKER
                };
                await setDoc(accountRef, accountData);
            }


            dispatch({
                type: ActionType.AUTH_STATE_CHANGED,
                payload: {
                    isAuthenticated: true,
                    user: accountData
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
