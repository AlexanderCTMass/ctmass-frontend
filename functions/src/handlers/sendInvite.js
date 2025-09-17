import { onCall } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import * as logger from 'firebase-functions/logger';
import sgMail from '@sendgrid/mail';
import twilioPack from 'twilio';

const SENDGRID_KEY = defineSecret('SENDGRID_API_KEY');
const TWILIO_SID = defineSecret('TWILIO_ACCOUNT_SID');
const TWILIO_TOKEN = defineSecret('TWILIO_AUTH_TOKEN');
const TWILIO_NUMBER = defineSecret('TWILIO_PHONE_FROM');

export const sendInvite = onCall(
    {
        region: 'us-central1',
        secrets: [SENDGRID_KEY, TWILIO_SID, TWILIO_TOKEN, TWILIO_NUMBER]
    },
    async (request) => {
        const { channel, to, text, categoryKey, profileId } = request.data;
        const inviter = request.auth?.token?.name || 'CTMASS user';

        const link = `https://ctmass.com/register?invite=${profileId}`;

        const fullText = `${inviter} invites you to join CTMASS and add \
you in the «${categoryKey}».
${text ? `\nPrivate message:\n${text}\n` : ''}
Registration link: ${link}`;

        try {
            if (channel === 'email') {
                sgMail.setApiKey(SENDGRID_KEY.value());
                await sgMail.send({
                    to,
                    from: 'noreply@ctmass.com',
                    subject: 'Invitation to CTMASS',
                    text: fullText
                });
            } else {
                const twilio = twilioPack(
                    TWILIO_SID.value(),
                    TWILIO_TOKEN.value()
                );
                await twilio.messages.create({
                    body: fullText,
                    from: TWILIO_NUMBER.value(),
                    to
                });
            }

            return { ok: true };
        } catch (e) {
            logger.error('sendInvite failed', e);
            throw new Error('Delivery failed: ' + e.message);
        }
    }
);