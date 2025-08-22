// useRemoteConfig.js
import { useState, useEffect } from 'react';
import { fetchAndActivate, getValue } from 'firebase/remote-config';
import { remoteConfig } from "src/libs/firebase";
import { ERROR, INFO } from "src/libs/log";
import { getAll } from "@firebase/remote-config";

export function useRemoteConfig() {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                await fetchAndActivate(remoteConfig);
                INFO("Remote Config:", getAll(remoteConfig));

                // Получаем все значения
                const newConfig = {
                    features: {
                        // newDashboard: getValue(remoteConfig, 'feature_new_dashboard').asBoolean(),
                        // experimental: getValue(remoteConfig, 'feature_experimental').asBoolean(),
                    },
                    contactInfo: JSON.parse(getValue(remoteConfig, 'contactInfo').asString()),
                    // maintenance: getValue(remoteConfig, 'maintenance_mode').asBoolean(),
                    // apiEndpoint: getValue(remoteConfig, 'api_endpoint').asString(),
                    // uiSettings: JSON.parse(getValue(remoteConfig, 'ui_settings').asString())
                };

                setConfig(newConfig);
            } catch (err) {
                setError(err);
                ERROR("Remote Config error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchConfig();
    }, []);

    return { config, loading, error };
}