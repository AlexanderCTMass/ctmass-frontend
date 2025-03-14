export const navigateToCurrentWithParams = (navigate, param, value) => {
    const currentUrl = window.location.href;
    const url = new URL(currentUrl);
    if (value) {
        url.searchParams.set(param, value);
    } else {
        url.searchParams.delete(param);
    }
    navigate(url.pathname + url.search);
};