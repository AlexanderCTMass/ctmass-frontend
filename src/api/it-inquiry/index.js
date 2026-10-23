import { httpsCallable } from 'firebase/functions';
import { functions } from 'src/libs/firebase';

export const CALENDLY_URL = 'https://calendly.com/ctmass-support/cutting-edge-software-development';

const sendServiceInquiryFn = httpsCallable(functions, 'sendServiceInquiry', { timeout: 30000 });

export const sendServiceInquiry = async ({ name, email, services, message, source, booking, meta }) => {
    await sendServiceInquiryFn({
        name: name || '',
        email,
        services: services || [],
        message: message || '',
        source: source || 'web',
        booking: booking === true,
        meta: meta || null
    });
};

export const buildProjectDetails = (services, message) => [
    services.length ? `Services: ${services.join(', ')}` : '',
    (message || '').trim()
]
    .filter(Boolean)
    .join('\n\n');
