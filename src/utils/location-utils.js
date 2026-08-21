export function getZipFromPlace(place) {
    if (!place) {
        return '';
    }

    if (place.zip) {
        return place.zip;
    }
    if (place.postcode) {
        return place.postcode;
    }

    if (typeof place.id === 'string' && place.id.startsWith('postcode') && place.text) {
        return place.text;
    }

    const context = Array.isArray(place.context) ? place.context : [];
    const zipContext = context.find(
        (item) => typeof item?.id === 'string' && item.id.startsWith('postcode')
    );
    if (zipContext?.text) {
        return zipContext.text;
    }

    const match = typeof place.place_name === 'string'
        ? place.place_name.match(/\b(\d{5})(?:-\d{4})?\b/)
        : null;
    return match ? match[1] : '';
}

export async function lookupApproximateLocation() {
    try {
        const response = await fetch('https://ipwho.is/');
        const data = await response.json();
        if (!data || data.success === false) {
            return null;
        }

        if (!isUsCountryCode(data.country_code)) {
            return null;
        }

        const parts = [data.city, data.region, data.country].filter(Boolean);

        return {
            ip: data.ip || '',
            place_name: parts.length ? parts.join(', ') : '',
            zip: data.postal || ''
        };
    } catch (error) {
        return null;
    }
}

export const US_COUNTRY_CODE = 'us';

export const US_MAP_MAX_BOUNDS = [[-179.9, 15.0], [-63.0, 72.0]];

export const US_ONLY_LOCATION_MESSAGE = 'CTMASS is available in the United States only. Please pick a US address.';

const isUsCountryCode = (value) => {
    const code = typeof value === 'string' ? value.trim().toLowerCase() : '';
    return code === US_COUNTRY_CODE || code.startsWith(`${US_COUNTRY_CODE}-`);
};

export function isUsPlace(place) {
    if (!place) {
        return false;
    }

    const context = Array.isArray(place.context) ? place.context : [];
    const countryContext = context.find(
        (item) => typeof item?.id === 'string' && item.id.startsWith('country')
    );
    if (countryContext) {
        return isUsCountryCode(countryContext.short_code);
    }

    if (place.properties?.short_code) {
        return isUsCountryCode(place.properties.short_code);
    }

    const placeName = typeof place.place_name === 'string' ? place.place_name.trim() : '';
    return /(^|,\s*)united states$/i.test(placeName);
}

export function filterUsPlaces(features) {
    return Array.isArray(features) ? features.filter(isUsPlace) : [];
}

export function findUsPlace(features) {
    return filterUsPlaces(features)[0] || null;
}
