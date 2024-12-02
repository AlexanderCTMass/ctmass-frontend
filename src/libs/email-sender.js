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
                },);
        });
    }

    sendFeedback(name, email, phone, message) {
        let mailTo = process.env.REACT_APP_ADMIN_MAIL;
        const templateParams = {
            'subject': "Feedback from user " + name + " [" + email + " | " + phone + "]",
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

    notifyCustomerForFeedback(user, customerMail, postLink) {
        const templateParams = {
            'subject': "💬 Your feedback matters! Please share your thoughts about our work [CTMASS]",
            'message_html': `<p>Hello,</p>
<p>We have successfully completed your task and would greatly appreciate your feedback. Please take a moment to rate our work and leave a review.</p>
<p>Your input is invaluable and helps us improve!</p>
<p>👉 <a href="${postLink}" rel="noopener"><strong>Leave Your Review</strong></a></p>
<p>If you are not yet registered on our platform, CTMASS, don&rsquo;t worry &mdash; you can quickly sign up using the same link. Simply use your email address (<strong>${customerMail}</strong>) as your login.</p>
<p>💡 Registration takes just a few seconds!</p>
<p>Thank you for helping us grow and improve.</p>
<p>Best regards,<br><strong>${user.businessName}</strong><br>CTMASS Team<br></p>`,
            'mail_to': customerMail,
            'from_name': user.businessName + " from CTMASS",
            'from': process.env.REACT_APP_ADMIN_MAIL
        }
        return this.send(DEFAULT_TEMPLATE_ID, templateParams);
    }

    notifyWorkerForFeedback(customer, worker, post) {
        const templateParams = {
            'subject': "🎉 A New Review About Your Work! [CTMASS]",
            'message_html': `
            <p>Hello ${worker.businessName},</p>
    <p>Your client has left a review about your work, and we’re excited to share it with you!</p>
    <p><strong>Review Details:</strong></p>
    <ul>
      <li><strong>Client Name:</strong> ${customer.businessName} [${customer.email}]</li>
      <li><strong>Rating:</strong> ${post.rating}</li>
      <li><strong>Comment:</strong> *"${post.customerFeedback}"*</li>
    </ul>   
    <p>
      Thank you for your excellent work and contributions to our platform! If you have any questions, feel free to contact our support team at <a href="mailto:${process.env.REACT_APP_ADMIN_MAIL}">${process.env.REACT_APP_ADMIN_MAIL}</a>.
    </p>
    <p>Best regards,<br>The CTMASS Team</p>
            `,
            'mail_to': worker.email,
            'from_name': customer.businessName + " from CTMASS",
            'from': process.env.REACT_APP_ADMIN_MAIL
        }
        return this.send(DEFAULT_TEMPLATE_ID, templateParams);
    }

    notifyUserForPostComment(user, author, comment) {
        const templateParams = {
            'subject': "🔔 New Comment on Your Post! [CTMASS]",
            'message_html': `
            <p>Hello ${author.businessName},</p>
     <p>We wanted to let you know that a new comment has been added to your post on CTMASS.</p>
    <p><strong>Comment Details:</strong></p>
    <ul>
      <li><strong>Commenter:</strong>${user.email}</li>
      <li><strong>Comment:</strong> ${comment}</li>
    </ul> 
    <p>
       Thank you for being an active member of our community! If you have any questions or need assistance, feel free to reach out to our support team at <a href="mailto:${process.env.REACT_APP_ADMIN_MAIL}">${process.env.REACT_APP_ADMIN_MAIL}</a>.
    </p>
    <p>Best regards,<br>The CTMASS Team</p>
            `,
            'mail_to': author.email,
            'from_name': user.businessName + " from CTMASS",
            'from': process.env.REACT_APP_ADMIN_MAIL
        }
        return this.send(DEFAULT_TEMPLATE_ID, templateParams);
    }
}

export const emailSender = new EmailSender();



