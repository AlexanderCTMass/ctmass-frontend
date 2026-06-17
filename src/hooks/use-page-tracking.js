import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { analytics } from 'src/libs/firebase'
import { logEvent } from 'firebase/analytics'
import { trackClarityPage } from 'src/libs/analytics/clarity'
import { trackReferralSource } from 'src/libs/analytics/ga4'

export const usePageTracking = () => {
    const location = useLocation();

    useEffect(() => {
        trackClarityPage(location.pathname + location.search);

        // Capture/send a ?reqFrom=<platform> referral source once per user.
        // Runs on every navigation so it still fires if analytics loads late.
        trackReferralSource();

        if (!analytics) return;
        logEvent(analytics, "page_view", {
            page_path: location.pathname + location.search,
        });
    }, [location]);
};