import emailjs from "@emailjs/browser";
import debug from "debug";
import {Notifications} from "src/enums/notifications";
import toast from "react-hot-toast";
import {EmailSenderFeatureToggles} from "src/featureToggles/EmailSenderFeatureToggles";

const logger = debug("[EMAIL SENDER]")

function stripHtmlTags(input) {
    if (!input) return "";
    return input.replace(/<\/?[^>]+(>|$)/g, "");
}

const DEFAULT_TEMPLATE_ID = 'template_epduqer';

class EmailSender {
    send(templateId = DEFAULT_TEMPLATE_ID, templateParams, notificationKey, recipient, blocked = false) {
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
        let message = "Job info: " + job.title + "\n" + job.description + "\n" + job.address + "\n\n\nUser: " + user.email + "\n" + user.phone;
        return this.sendAdminMail("New order", message);
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
}

export const emailSender = new EmailSender();



