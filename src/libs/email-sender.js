/*
                var templateParams = {
                    'mail_to': 'alexneuro31@gmail.com',
                    'from_name': 'from_name',
                    'to_name': 'TO',
                    'message': 'message',
                    'reply_to': 'reply_to'
                };


        */
import {deepCopy} from "../utils/deep-copy";
import {logs} from "../api/customers/data";
import emailjs from "@emailjs/browser";
import {data} from "../api/kanban/data";
import {createResourceId} from "../utils/create-resource-id";


const DEFAULT_TEMPLATE_ID = 'template_epduqer';

class EmailSender {
    send(templateId = DEFAULT_TEMPLATE_ID, templateParams) {
        return new Promise((resolve, reject) => {
            emailjs.send('default_service', templateId, templateParams, {
                publicKey: "as4ih3rGW3abw98dk",
            }).then(
                (response) => {
                    resolve(response);
                },
                (error) => {
                    console.log('Email Sender FAILED...', error);
                    reject(error);
                },
            );
        });
    }

    sendFeedback(name, email, phone, message) {
        let mailTo = process.env.REACT_APP_ADMIN_MAIL;
        const templateParams = {
            'subject': "Feedback from user " + name + " [" + email + " | " +  phone + "]",
            'message': message,
            'mail_to': mailTo,
            'from_name': name + ' [feedback on CTMass.com]' + (phone && ' phone: ' + phone),
            'from': email
        }
        return this.send(DEFAULT_TEMPLATE_ID, templateParams);
    }

    sendAdminMail(subject, message) {
        let mailTo = process.env.REACT_APP_ADMIN_MAIL;
        const templateParams = {
            'subject': subject,
            'message': message,
            'mail_to': mailTo,
            'from_name': 'CTMass.com',
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

    sendHello(sendTo, user) {
        const templateParams = {
            'site_url': process.env.REACT_APP_HOST_P,
            'site_name': 'CTMass.com',
            'send_to': sendTo,
            'from_name': (user && user.name) || 'Yakov',
            'reply_to': (user && user.email) || process.env.REACT_APP_ADMIN_MAIL
        }
        return this.send('template_hello', templateParams);
    }

    notifyCustomerForFeedback(){
        const templateParams = {
            'subject': "",
            'message': message,
            'mail_to': mailTo,
            'from_name': 'CTMass.com',
            'from': mailTo
        }
        return this.send(DEFAULT_TEMPLATE_ID, templateParams);
    }

}

export const emailSender = new EmailSender();



