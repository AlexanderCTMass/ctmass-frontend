/*
                var templateParams = {
                    'mail_to': 'alexneuro31@gmail.com',
                    'from_name': 'from_name',
                    'to_name': 'TO',
                    'message': 'message',
                    'reply_to': 'reply_to'
                };


        */
import emailjs from "@emailjs/browser";
import debug from "debug";
import {Notifications} from "src/enums/notifications";

const logger = debug("[EMAIL SENDER]")

function stripHtmlTags(input) {
    if (!input) return ""; // Проверка на пустое значение
    return input.replace(/<\/?[^>]+(>|$)/g, ""); // Удаление тегов
}

const DEFAULT_TEMPLATE_ID = 'template_epduqer';

class EmailSender {
    send(templateId = DEFAULT_TEMPLATE_ID, templateParams, notificationKey, recipient) {
        if (!notificationKey || !recipient || (recipient.notifications && recipient.notifications.includes(notificationKey))) {
            logger("send email", templateId);
            return new Promise((resolve, reject) => {
                emailjs.send('default_service', templateId, templateParams, {
                    publicKey: "as4ih3rGW3abw98dk",
                }).then(
                    (response) => {
                        logger("send email SUCCESS");
                        resolve(response);
                    },
                    (error) => {
                        logger('send email FAILED...', error);
                        reject(error);
                    },);
            });
        }
    }

    sendFeedback(name, email, phone, message) {
        let mailTo = process.env.REACT_APP_ADMIN_MAIL;
        const templateParams = {
            'name': name,
            'email': email,
            'phone': phone,
            'message': message,
            'to': mailTo,
            'site_name': 'CTMASS.com',
        }
        return this.send("template_feed_to_admin", templateParams,);
    }

    sendAdminMail(subject, message) {
        let mailTo = process.env.REACT_APP_ADMIN_MAIL;
        const templateParams = {
            'subject': subject,
            'message': message,
            'mail_to': mailTo,
            'from_name': 'CTMASS.com',
            'from': mailTo
        }
        return this.send(DEFAULT_TEMPLATE_ID, templateParams);
    }

    sendAdmin_newRegistration(user) {
        let message = "User: " + user.email;
        return this.sendAdminMail("New registration", message);
    }

    sendAdmin_newOrder(job, user) {
        let message = "Job info: " + job.title + "\n" + job.description + "\n" + job.address + "\n\n\nUser: " + user.email + "\n" + user.phone;
        return this.sendAdminMail("New order", message);
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

    notifyCustomerForFeedback(user, customerMail, customerName,  postLink) {
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
        return this.send('template_feeback_message', templateParams, Notifications.EMAILS_POST, worker);
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
        return this.send("new_post_comment", templateParams, Notifications.EMAILS_POST, author);
    }
}

export const emailSender = new EmailSender();



