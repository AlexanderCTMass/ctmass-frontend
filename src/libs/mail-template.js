import { emailTemplateService } from "src/service/email-template-service";
import { emailSender } from "./email-sender";

export async function sendByTemplate(
    templateName,
    data,
    fallback
) {
    let compiled;
    try {
        compiled = await emailTemplateService.compile(templateName, data);
    } catch (e) {
        console.error(`[EmailTemplate] validation fail for ${templateName}`, e);
        throw e;
    }

    if (!compiled) {
        compiled = fallback();
    }

    const params = {
        mail_to: data?.user?.email || data?.email || '',
        from_name: 'CTMASS.com',
        from: process.env.REACT_APP_ADMIN_MAIL,
        subject: compiled.subject,
        html: compiled.html,
        text: compiled.text
    };

    return emailSender.send('template_epduqer', params, false, null, false);
}