export const AD_PLACEMENTS = [
    {
        key: 'HomeTopAdPlace',
        label: 'Home · Top carousel',
        short: 'Home top',
        audience: 'Homeowners & contractors',
        kind: 'carousel',
        description: 'Swipeable carousel at the top of the Home screen, shared by the Homeowner and Contractor tabs.'
    },
    {
        key: 'ContractorHomeBetweenRequestAdPlace',
        label: 'Home · Contractor feed',
        short: 'Contractor feed',
        audience: 'Contractors',
        kind: 'inline',
        description: 'Inline banner between nearby requests in the Contractor tab.'
    },
    {
        key: 'HomeownerHomeBetweenRequestAdPlace',
        label: 'Home · Homeowner feed',
        short: 'Homeowner feed',
        audience: 'Homeowners',
        kind: 'inline',
        description: 'Inline banner between “My requests” cards in the Homeowner tab.'
    },
    {
        key: 'ShopAdPlace',
        label: 'Shop · Between items',
        short: 'Shop',
        audience: 'Everyone',
        kind: 'inline',
        description: 'Inline banner between product cards in the Shop tab.'
    }
];

export const AD_PLACEMENT_MAP = Object.fromEntries(AD_PLACEMENTS.map((p) => [p.key, p]));

export const DEFAULT_PLACEMENT_SETTINGS = {
    HomeTopAdPlace: { enabled: true, maxItems: 5, autoplayMs: 3000, every: 1 },
    ContractorHomeBetweenRequestAdPlace: { enabled: true, maxItems: 5, autoplayMs: 0, every: 3 },
    HomeownerHomeBetweenRequestAdPlace: { enabled: true, maxItems: 5, autoplayMs: 0, every: 3 },
    ShopAdPlace: { enabled: true, maxItems: 5, autoplayMs: 0, every: 3 }
};

export const AD_LAYOUTS = [
    {
        value: 'split',
        label: 'Text + logo',
        description: 'Headline, subtitle and button on the left, the image (logo/product) contained on the right.'
    },
    {
        value: 'cover',
        label: 'Text over photo',
        description: 'The photo fills the banner, text sits on a soft fade on the left.'
    },
    {
        value: 'image',
        label: 'Image only',
        description: 'A fully designed creative (1200×400). No text is drawn on top.'
    }
];

export const AD_STATUSES = {
    draft: { label: 'Draft', color: '#667085', bg: '#F2F4F7' },
    pending: { label: 'In review', color: '#B54708', bg: '#FEF0C7' },
    active: { label: 'Active', color: '#087443', bg: '#D1FADF' },
    scheduled: { label: 'Scheduled', color: '#175CD3', bg: '#D1E9FF' },
    ended: { label: 'Ended', color: '#475467', bg: '#EAECF0' },
    paused: { label: 'Paused', color: '#B54708', bg: '#FFFAEB' },
    archived: { label: 'Archived', color: '#475467', bg: '#F2F4F7' }
};

export const AD_ASPECT_RATIO = 3;
export const AD_MAX_FILE_BYTES = 5 * 1024 * 1024;
export const AD_ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const getDisplayStatus = (banner, now = Date.now()) => {
    if (!banner) return 'draft';
    if (banner.status !== 'active') return banner.status || 'draft';
    if (banner.endAt && now >= banner.endAt) return 'ended';
    if (banner.startAt && now < banner.startAt) return 'scheduled';
    return 'active';
};

export const ctr = (clicks, impressions) => (impressions > 0 ? (clicks / impressions) * 100 : 0);
