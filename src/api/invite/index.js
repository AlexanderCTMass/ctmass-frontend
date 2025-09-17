import { httpsCallable } from 'firebase/functions';
import { functions } from 'src/libs/firebase';

const fn = httpsCallable(functions, 'sendInvite');

class InviteApi {
    async send(payload) {
        if (process.env.NODE_ENV === 'development') {
            return console.log('[InviteAPI] dev-mode payload', payload);
        }
        return fn(payload);
    }
}

export const inviteApi = new InviteApi();