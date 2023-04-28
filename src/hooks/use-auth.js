import { useContext } from 'react';
import { AuthContext } from 'src/contexts/auth/firebase-context';

export const useAuth = () => useContext(AuthContext);
