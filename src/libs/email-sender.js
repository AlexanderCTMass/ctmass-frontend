import emailjs from "@emailjs/browser";
import debug from "debug";
import { Notifications } from "src/enums/notifications";
import toast from "react-hot-toast";
import { EmailSenderFeatureToggles } from "src/featureToggles/EmailSenderFeatureToggles";

const logger = debug("[EMAIL SENDER]")

function stripHtmlTags(input) {
    if (!input) return "";
    return input.replace(/<\/?[^>]+(>|$)/g, "");
}

const DEFAULT_TEMPLATE_ID = 'template_epduqer';

class EmailSender {
    send(templateId = DEFAULT_TEMPLATE_ID, templateParams, notificationKey, recipient, blocked = false) {
        if (recipient && recipient.notificationPreferences?.email?.frequency === 'never') {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            if (notificationKey && recipient && !recipient.notifications?.includes(notificationKey)) {
                logger("Email disable");
                return resolve();
            }

            if (!EmailSenderFeatureToggles.sendRealEmail) {
                toast.success("Send email imitation: " + templateId);
                return resolve();
            }

            if (templateId === DEFAULT_TEMPLATE_ID) {
                if (EmailSenderFeatureToggles.replaceEmails) {
                    templateParams.mail_to = "alex.neu.ctmass@gmail.com"
                }
            }

            logger("send email", templateId);

            emailjs.send('default_service', templateId, templateParams, {
                publicKey: "as4ih3rGW3abw98dk",
            }).then(
                (response) => {
                    logger("send email SUCCESS");
                    resolve(response);
                },
                (error) => {
                    logger('send email FAILED...', error);
                    if (blocked) {
                        reject(error);
                    } else {
                        resolve()
                    }
                },);
        });
    }

    sendBugFeedback(name, email, message) {
        const templateParams = {
            'subject': "Bug report",
            'html': message,
            'mail_to': process.env.REACT_APP_ADMIN_MAIL,
            'from_name': name,
            'from': email
        }
        return this.send(DEFAULT_TEMPLATE_ID, templateParams, false, null, true);
    }

    sendFeedback(name, email, message) {
        let mailTo = process.env.REACT_APP_ADMIN_MAIL;
        const templateParams = {
            'name': name,
            'email': email,
            'message': message,
            'to': mailTo,
            'site_name': 'CTMASS.com',
        }
        return this.send("template_feed_to_admin", templateParams,);
    }

    sendAdminMail(subject, message, blocked = false) {
        let mailTo = process.env.REACT_APP_ADMIN_MAIL;
        const templateParams = {
            'subject': subject,
            'message': message,
            'mail_to': mailTo,
            'from_name': 'CTMASS.com',
            'from': mailTo
        }
        return this.send(DEFAULT_TEMPLATE_ID, templateParams, blocked);
    }

    sendAdmin_newRegistration(user) {
        let message = "User: " + user.email;
        return this.sendAdminMail("New registration", message);
    }

    sendAdmin_newOrder(job, user, blocked) {
        const message = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #1F2D77; color: white; padding: 16px 24px; border-radius: 8px 8px 0 0;">
    <h2 style="margin: 0; font-size: 20px;">📋 New Project Order</h2>
  </div>
  <div style="border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px; padding: 24px;">
    <h3 style="margin: 0 0 16px; color: #1F2D77;">Project Info</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 6px 0; color: #666; width: 120px;">ID:</td><td style="padding: 6px 0; font-weight: 600;">${job.id || '—'}</td></tr>
      <tr><td style="padding: 6px 0; color: #666;">Title:</td><td style="padding: 6px 0; font-weight: 600;">${job.title || '—'}</td></tr>
      <tr><td style="padding: 6px 0; color: #666;">Description:</td><td style="padding: 6px 0;">${job.description || '—'}</td></tr>
      <tr><td style="padding: 6px 0; color: #666;">Location:</td><td style="padding: 6px 0;">${job.location?.place_name || '—'}</td></tr>
    </table>
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 16px 0;" />
    <h3 style="margin: 0 0 16px; color: #1F2D77;">Customer</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 6px 0; color: #666; width: 120px;">Email:</td><td style="padding: 6px 0;">${user.email || '—'}</td></tr>
      <tr><td style="padding: 6px 0; color: #666;">Phone:</td><td style="padding: 6px 0;">${user.phone || '—'}</td></tr>
    </table>
  </div>
</div>`.trim();

        return this.sendAdminMail(job.notKnowSpecialistCategory ? "New order without specialist category" : "New order", message);
    }

    sendAdmin_newOrderForModerate(job, blocked) {
        const message = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #f57c00; color: white; padding: 16px 24px; border-radius: 8px 8px 0 0;">
    <h2 style="margin: 0; font-size: 20px;">⚠️ Project for Moderation</h2>
  </div>
  <div style="border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px; padding: 24px;">
    <h3 style="margin: 0 0 16px; color: #f57c00;">Project Info</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 6px 0; color: #666; width: 120px;">ID:</td><td style="padding: 6px 0; font-weight: 600;">${job.id || '—'}</td></tr>
      <tr><td style="padding: 6px 0; color: #666;">Title:</td><td style="padding: 6px 0; font-weight: 600;">${job.title || '—'}</td></tr>
      <tr><td style="padding: 6px 0; color: #666;">Description:</td><td style="padding: 6px 0;">${job.description || '—'}</td></tr>
      <tr><td style="padding: 6px 0; color: #666;">Location:</td><td style="padding: 6px 0;">${job.location?.place_name || '—'}</td></tr>
    </table>
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 16px 0;" />
    <h3 style="margin: 0 0 16px; color: #f57c00;">Customer</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 6px 0; color: #666; width: 120px;">Email:</td><td style="padding: 6px 0;">${job.customerEmail || '—'}</td></tr>
      <tr><td style="padding: 6px 0; color: #666;">Phone:</td><td style="padding: 6px 0;">${job.customerPhone || '—'}</td></tr>
    </table>
  </div>
</div>`.trim();

        return this.sendAdminMail(job.notKnowSpecialistCategory ? "New project for moderate without specialist category!!!" : "New project for moderate!!!", message);
    }

    sendAdmin_feedback_registration(user, rating, feedback, blocked) {
        const stars = '⭐'.repeat(Math.min(Math.max(Number(rating) || 0, 0), 5));
        const message = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #2e7d32; color: white; padding: 16px 24px; border-radius: 8px 8px 0 0;">
    <h2 style="margin: 0; font-size: 20px;">💬 Specialist Registration Feedback</h2>
  </div>
  <div style="border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px; padding: 24px;">
    <h3 style="margin: 0 0 16px; color: #2e7d32;">Feedback</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 6px 0; color: #666; width: 120px;">Rating:</td><td style="padding: 6px 0; font-size: 20px;">${stars} (${rating})</td></tr>
      <tr><td style="padding: 6px 0; color: #666; vertical-align: top;">Comment:</td><td style="padding: 6px 0;">${feedback || '—'}</td></tr>
    </table>
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 16px 0;" />
    <h3 style="margin: 0 0 16px; color: #2e7d32;">Specialist</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 6px 0; color: #666; width: 120px;">Business:</td><td style="padding: 6px 0; font-weight: 600;">${user.businessName || '—'}</td></tr>
      <tr><td style="padding: 6px 0; color: #666;">Email:</td><td style="padding: 6px 0;">${user.email || '—'}</td></tr>
      <tr><td style="padding: 6px 0; color: #666;">Phone:</td><td style="padding: 6px 0;">${user.phone || '—'}</td></tr>
    </table>
  </div>
</div>`.trim();

        return this.sendAdminMail("Feedback from specialist registration", message);
    }

    sendHelloForCreateProject(newUser, sender) {
        const templateParams = {
            'Customer_Name': newUser.name || 'dear friend',
            'Link_to_dashboard': process.env.REACT_APP_HOST_P + '/dashboard',
            'site_name': 'CTMASS.com',
            'send_to': newUser.email,
            'from_name': (sender && sender.name) || 'Yakov',
            'reply_to': (sender && sender.email) || process.env.REACT_APP_ADMIN_MAIL
        }
        return this.send('template_hello', templateParams);
    }


    sendHello(newUser, sender) {
        const templateParams = {
            'Customer_Name': newUser.name || 'dear friend',
            'Link_to_dashboard': process.env.REACT_APP_HOST_P + '/dashboard',
            'site_name': 'CTMASS.com',
            'send_to': newUser.email,
            'from_name': (sender && sender.name) || 'Yakov',
            'reply_to': (sender && sender.email) || process.env.REACT_APP_ADMIN_MAIL
        }
        return this.send('template_hello', templateParams);
    }

    notifyCustomerForFeedback(user, customerMail, customerName, postLink) {
        const templateParams = {
            'Customer_Name': customerName || 'dear friend',
            'postLink': postLink,
            'Customer_Mail': customerMail,
            'reply_to': '',
            'send_to': customerMail,
            'from_name': user.name,
            'site_name': 'CTMASS.com'
        }
        return this.send('template_review_message', templateParams);
    }

    notifyWorkerForFeedback(customer, worker, post) {
        let postRating = "⭐".repeat(post.rating);

        const templateParams = {
            'Worker_Name': worker.name,
            'Customer_Name': customer.name,
            'post_rating': postRating,
            "customerFeedback": stripHtmlTags(post.customerFeedback),
            'support_mail': process.env.REACT_APP_ADMIN_MAIL,
            'reply_to': '',
            'send_to': worker.email,
            'from_name': customer.businessName,
            'site_name': 'CTMASS.com'
        }
        return this.send('template_feeback_message', templateParams, Notifications.EVENTS_NOTIFICATIONS, worker);
    }

    notifyUserForPostComment(user, author, comment) {
        const templateParams = {
            'Name': author.name,
            'Commenter_Name': user.name,
            'Comment': stripHtmlTags(comment),
            'send_to': author.email,
            'site_name': "CTMASS.com",
            'from': process.env.REACT_APP_ADMIN_MAIL,
            'support_mail': process.env.REACT_APP_ADMIN_MAIL
        }
        return this.send("new_post_comment", templateParams, Notifications.EVENTS_NOTIFICATIONS, author);
    }

    sendProjectActionNotification(mailTo, title, text) {
        const templateParams = {
            'subject': title,
            'html': text,
            'mail_to': mailTo,
            'from_name': 'CTMASS.com',
            'from': process.env.REACT_APP_ADMIN_MAIL
        }
        return this.send(DEFAULT_TEMPLATE_ID, templateParams, false, null, false);
    }

    sendReviewRequestPastClients(mailTo, text) {
        const templateParams = {
            'subject': "Review request",
            'html': text,
            'mail_to': mailTo,
            'from_name': 'CTMASS.com',
            'from': process.env.REACT_APP_ADMIN_MAIL
        }
        return this.send(DEFAULT_TEMPLATE_ID, templateParams, false, null, false);
    }
}

export const emailSender = new EmailSender();