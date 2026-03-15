import axios from 'axios';

export class BrevoSMSService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.brevo.com/v3';
    }

    /**
     *
     * curl --request POST \
     *      --url https://api.brevo.com/v3/transactionalSMS/send \
     *      --header 'accept: application/json' \
     *      --header 'api-key: YOUR-API-KEY' \
     *      --header 'content-type: application/json' \
     *      --data '
     * {
     *   "sender": "MyShop",
     *   "recipient": "33680065433",
     *   "content": "Enter this code:CAAA08 to validate your account",
     *   "type": "marketing",
     *   "tag": "\"tag1\" OR [\"tag1\", \"tag2\"]",
     *   "webUrl": "http://requestb.in/100lyyx1",
     *   "unicodeEnabled": true,
     *   "organisationPrefix": "MyCompany"
     * }
     * '
     * @param to
     * @param message
     * @param sender
     * @param tag
     * @returns {Promise<{reference, remainingCredits: any, success: boolean, smsCount: (*|number), messageId, usedCredits: any}>}
     */
    async sendSMS({to, message, sender, tag = 'general'}) {
        try {
            const response = await axios({
                method: 'POST',
                url: `${this.baseUrl}/transactionalSMS/send`,
                headers: {
                    'accept': 'application/json',
                    'content-Type': 'application/json',
                    'api-key': this.apiKey
                },
                data: {
                    sender: sender,
                    recipient: to,
                    content: message,
                    type: 'transactional',
                    tag: tag,
                    unicodeEnabled: true,
                    organisationPrefix: ""
                }
            });

            return {
                success: true,
                messageId: response.data.messageId,
                reference: response.data.reference,
                smsCount: response.data.smsCount || 1,
                usedCredits: response.data.usedCredits,
                remainingCredits: response.data.remainingCredits
            };
        } catch (error) {
            console.error('Brevo API error:', error.response?.data || error.message);
            throw this.handleError(error);
        }
    }

    handleError(error) {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;

        if (status === 400) return new Error(`Invalid request: ${message}`);
        if (status === 401) return new Error(`Invalid API key: ${message}`);
        if (status === 402) return new Error(`Insufficient credits: ${message}`);
        if (status === 403) return new Error(`Unauthorized: ${message}`);

        return new Error(`Brevo API error: ${message}`);
    }

    async checkAccount() {
        try {
            const response = await axios({
                method: 'GET',
                url: `${this.baseUrl}/account`,
                headers: {
                    'api-key': this.apiKey,
                    'Accept': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }
}