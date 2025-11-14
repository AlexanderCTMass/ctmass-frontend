import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { analytics } from 'src/libs/firebase'
import { logEvent } from 'firebase/analytics'

export const usePageTracking = () => {
    const location = useLocation();

    useEffect(() => {
        if (!analytics) return;
        logEvent(analytics, "page_view", {
            page_path: location.pathname + location.search,
        });
    }, [location]);
};