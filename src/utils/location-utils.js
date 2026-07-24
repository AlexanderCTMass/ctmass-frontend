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
