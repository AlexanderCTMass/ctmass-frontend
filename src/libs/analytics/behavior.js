import { analytics } from "src/libs/firebase";
import { logEvent } from "firebase/analytics";

export const trackClick = (elementName, extra = {}) => {
    if (!analytics) return;

    logEvent(analytics, "ui_click", {
        element_name: elementName,
        ...extra
    });
};

export const trackKPI = (kpiName, params = {}) => {
    if (!analytics) return;

    logEvent(analytics, `kpi_${kpiName}`, params);
};