// RemoteConfigContext.js
import { createContext, useContext } from 'react';
import {useRemoteConfig} from "src/hooks/use-remote-config";

const RemoteConfigContext = createContext();

export function RemoteConfigProvider({ children }) {
    const { config, loading, error } = useRemoteConfig();

    return (
        <RemoteConfigContext.Provider value={{ config, loading, error }}>
            {children}
        </RemoteConfigContext.Provider>
    );
}

export function useConfig() {
    const context = useContext(RemoteConfigContext);
    if (!context) {
        throw new Error('useConfig must be used within a RemoteConfigProvider');
    }
    return context;
}