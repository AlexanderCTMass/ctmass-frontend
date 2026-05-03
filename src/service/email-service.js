import { paths } from "src/paths";
import { emailSender } from "src/libs/email-sender";
import { emailTemplateService } from 'src/service/email-template-service';
import { EmailTriggers } from "src/constants/email-triggers";
import Handlebars from 'handlebars/dist/handlebars.min.js';

const isCTMASSCoin = false;
const BUG_REPORT_ADMIN_EMAIL = 'george.ctmass@gmail.com';

class EmailService {
    notificationFreqToLabel = {
        immediately: 'immediately',
        daily: 'once a day',
        every_three_days: 'once every 3 days',
        weekly: 'once a week',
        monthly: 'once a month',
        never: 'no email notifications'
    };

    async sendByTrigger(trigger, data, fallbackFn) {
        if (data?.user?.notificationPreferences?.email?.frequency === 'never') {
            return;
        }

        let compiled;
        try {
            compiled = await emailTemplateService.compileByTrigger(trigger, data);
        } catch (e) {
            console.error(`[EmailTemplate] validation fail for trigger "${trigger}"`, e);
            throw e;
        }

        if (!compiled && fallbackFn) {
            compiled = fallbackFn();
        }
        if (!compiled) {
            throw new Error(`E-mail template for trigger "${trigger}" not found`);
        }

        const toHtml = (txt) => `<pre style="font-family:Inter,Arial,Helvetica,sans-serif;white-space:pre-wrap">${Handlebars.Utils.escapeExpression(txt)}</pre>`;

        const params = {
            mail_to: data?.user?.email || data?.email || '',
            from_name: 'CTMASS.com',
            from: process.env.REACT_APP_ADMIN_MAIL,
            subject: compiled.subject,
            html: compiled.html || toHtml(compiled.text),
            text: compiled.text || ' '
        };

        return emailSender.send('template_epduqer', params, false, data?.user, false);
    }

    async sendTemplate(templateName, data, fallback) {
        return this.sendByTrigger(templateName, data, fallback);
    }


    createBagFeedbackEmailHtml = (templateParams) => {
        const { name, email, description, location, screenshot } = templateParams;

        return `
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    color: #333;
                    margin: 0;
                    padding: 20px;
                }
                .container {
                    background-color: #fff;
                    border-radius: 8px;
                    padding: 20px;
                    max-width: 600px;
                    margin: 0 auto;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }
                h1 {
                    color: #007bff;
                    font-size: 24px;
                    margin-bottom: 20px;
                }
                p {
                    font-size: 16px;
                    line-height: 1.6;
                    margin: 10px 0;
                }
                .label {
                    font-weight: bold;
                    color: #555;
                }
                .screenshot {
                    margin-top: 20px;
                }
                .screenshot img {
                    max-width: 100%;
                    border-radius: 8px;
                    border: 1px solid #ddd;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>New Feedback Received</h1>
                <p><span class="label">Name:</span> ${name}</p>
                <p><span class="label">Email:</span> ${email}</p>
                <p><span class="label">Description:</span> ${description}</p>
                <p><span class="label">Location:</span> <a href="${location}">${location}</a></p>
                ${screenshot ? `
                    <div class="screenshot">
                        <p class="label">Screenshot:</p>
                        <img src="${screenshot}" alt="Screenshot" />
                    </div>
                ` : ''}
            </div>
        </body>
        </html>
    `;
    };


    createBugReportAdminEmailHtml = ({ bugNumber, name, email, description, location, screenshot }) => {
        return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body{font-family:Arial,sans-serif;background:#f4f4f4;color:#333;margin:0;padding:20px}
  .container{background:#fff;border-radius:8px;padding:28px;max-width:600px;margin:0 auto;box-shadow:0 4px 8px rgba(0,0,0,.1)}
  .header{background:#dc3545;color:#fff;padding:16px 20px;border-radius:6px;margin-bottom:24px}
  .header h1{margin:0;font-size:22px}
  .badge{display:inline-block;background:#fff;color:#dc3545;font-size:13px;font-weight:700;padding:4px 12px;border-radius:12px;margin-top:8px}
  .field{margin:14px 0;padding:12px 16px;background:#f8f9fa;border-radius:6px;border-left:4px solid #0d6efd}
  .field.desc{border-left-color:#6c757d}
  .label{font-weight:700;color:#555;font-size:11px;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px}
  .value{font-size:15px;word-break:break-word}
  .screenshot{margin-top:20px}
  .screenshot img{max-width:100%;border-radius:8px;border:1px solid #ddd;margin-top:8px}
  a{color:#0d6efd}
  .footer{margin-top:24px;font-size:12px;color:#999;text-align:center}
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>&#x1F41B; New Bug Report</h1>
    <span class="badge">BUG #${bugNumber}</span>
  </div>
  <div class="field">
    <div class="label">Reported by</div>
    <div class="value"><strong>${name}</strong> &lt;<a href="mailto:${email}">${email}</a>&gt;</div>
  </div>
  <div class="field desc">
    <div class="label">Description</div>
    <div class="value">${description.replace(/\n/g, '<br>')}</div>
  </div>
  <div class="field">
    <div class="label">Page URL</div>
    <div class="value"><a href="${location}">${location}</a></div>
  </div>
  ${screenshot ? `
  <div class="screenshot">
    <div class="label" style="font-weight:700;font-size:11px;text-transform:uppercase;color:#555;letter-spacing:.5px">Screenshot</div>
    <img src="${screenshot}" alt="Screenshot" />
  </div>` : ''}
  <div class="footer">CTMASS Bug Tracking &middot; ${new Date().toLocaleString()}</div>
</div>
</body>
</html>`;
    };

    createBugReportConfirmationEmailHtml = ({ bugNumber, name }) => {
        return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body{font-family:Arial,sans-serif;color:#333;background:#f4f4f4;margin:0;padding:20px}
  .container{max-width:600px;margin:0 auto;background:#fff;border-radius:8px;padding:32px;box-shadow:0 4px 8px rgba(0,0,0,.08)}
  .header{text-align:center;padding-bottom:24px;border-bottom:1px solid #e9ecef;margin-bottom:24px}
  .header h2{margin:0;color:#0d6efd;font-size:22px}
  .badge{display:inline-block;background:#0d6efd;color:#fff;font-size:15px;font-weight:700;padding:8px 22px;border-radius:20px;margin-top:12px}
  p{line-height:1.7;margin:12px 0}
  .coin-notice{margin-top:20px;padding:14px 18px;background:#fff8e1;border-left:4px solid #f59e0b;border-radius:4px}
  .footer{margin-top:32px;padding-top:20px;border-top:1px solid #e9ecef;text-align:center;color:#6c757d;font-size:13px}
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h2>Support Ticket Received</h2>
    <div class="badge">Ticket #${bugNumber}</div>
  </div>
  <p>Hello <strong>${name}</strong>,</p>
  <p>Thank you for contacting our support team.</p>
  <p>Your ticket number is <strong>#${bugNumber}</strong>. We have received your request and our team is <strong>already working on it</strong>. We will keep you updated and provide a response within the next <strong>24 hours</strong>.</p>
  <p>We truly appreciate you taking the time to report issues and help us improve our platform. Your feedback helps us identify and fix technical bugs faster, making the experience <strong>better for everyone</strong>.</p>
  <p>Thank you for helping us grow and improve.</p>
  ${isCTMASSCoin ? `
  <div class="coin-notice">
    <p style="margin:0">&#x1FA99; If your reported issue is confirmed and your recommendation helps us resolve it, you will be <strong>awarded 1 CTMASS Coin</strong>.</p>
  </div>` : ''}
  <div class="footer">
    <p><strong>Best regards,</strong><br>Help Desk Manager<br><strong>George</strong></p>
    <p>CTMASS Support Team</p>
  </div>
</div>
</body>
</html>`;
    };

    sendBugReportToAdmin = (params) => {
        return emailSender.send(
            'template_epduqer',
            {
                subject: `BUG #${params.bugNumber}`,
                html: this.createBugReportAdminEmailHtml(params),
                mail_to: BUG_REPORT_ADMIN_EMAIL,
                from_name: params.name,
                from: process.env.REACT_APP_ADMIN_MAIL,
            },
            false,
            null,
            true
        );
    };

    sendBugReportConfirmationToUser = (params) => {
        return emailSender.send(
            'template_epduqer',
            {
                subject: `Your Support Ticket Has Been Received – #${params.bugNumber}`,
                html: this.createBugReportConfirmationEmailHtml(params),
                mail_to: params.email,
                from_name: 'CTMASS Support',
                from: process.env.REACT_APP_ADMIN_MAIL,
            },
            false,
            null,
            false
        );
    };

    createProjectNotificationEmail = (project) => {
        const { title, description, projectMaximumBudget, location } = project;

        // Форматируем бюджет в USD
        const formattedBudget = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(projectMaximumBudget);

        // Генерация HTML-письма
        const htmlContent = `
        <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        background-color: #f9f9f9;
                        padding: 20px;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background: #fff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    }
                    h1 {
                        color: #007BFF;
                        font-size: 24px;
                        margin-bottom: 20px;
                    }
                    p {
                        margin: 10px 0;
                    }
                    .project-details {
                        margin-top: 20px;
                        padding: 15px;
                        background: #f1f1f1;
                        border-radius: 8px;
                    }
                    .project-details h2 {
                        font-size: 20px;
                        margin-bottom: 10px;
                        color: #333;
                    }
                    .project-details p {
                        margin: 5px 0;
                    }
                    .button {
                        display: inline-block;
                        margin-top: 20px;
                        padding: 10px 20px;
                        background-color: #2E7D32;
                        color: #fff;
                        text-decoration: none;
                        border-radius: 5px;
                    }
                    .button:hover {
                        background-color: #1B5E20;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>New Project Available!</h1>
                    <p>Hello,</p>
                    <p>A new project has been posted on our platform that matches your expertise. Here are the details:</p>

                    <div class="project-details">
                        <h2>${title}</h2>
                        <p><strong>Description:</strong> ${description}</p>
                        <p><strong>Budget:</strong> ${formattedBudget}</p>
                        <p><strong>Location:</strong> ${location.place_name}</p>
                    </div>

                    <p>If you're interested, please log in to the platform to view the full details and submit your proposal.</p>
                    <a href="${process.env.REACT_APP_HOST_FOR_ENV}${paths.cabinet.projects.find.detail.replace(":projectId", project.id)}" class="button">View Project</a>

                    <p>Best regards,</p>
                    <p>CTMASS Team</p>
                </div>
            </body>
        </html>
    `;

        return htmlContent;
    }

    createNotificationPreferencesUpdated(user, newFreq) {
        const freqLabel = this.notificationFreqToLabel[newFreq] ?? newFreq;
        return `
               <p>Hello ${user.name || user.email},</p>
               <p>You have successfully updated your notification preferences on CTMASS.com.<br/>
                  Your notifications will now be sent <strong>${freqLabel}</strong>.</p>
               <p><em>Reminder of available options:</em></p>
               <ul>
                 <li>Immediately — Receive notifications as soon as updates happen</li>
                 <li>Once a Day — Receive a daily summary</li>
                 <li>Once Every 3 Days — Receive updates every three days</li>
                 <li>Once a Week — Receive weekly updates</li>
                 <li>Once a Month — Receive monthly updates</li>
                 <li>Do Not Receive Notifications — Opt out of notifications</li>
               </ul>
               <p>You can change your preferences at any time in your profile settings.</p>
               <p><a href="${process.env.REACT_APP_HOST_FOR_ENV}/cabinet/profiles/my/settings"
                     style="display:inline-block;padding:10px 20px;background:#007BFF;color:#fff;
                     text-decoration:none;border-radius:4px;">
                  Go to profile settings
               </a></p>
               <p>Thank you for staying up-to-date with CTMASS!</p>
             `;
    }

    createSpecialistReadyEmail(user, project, threadId) {
        const projectLink = `${process.env.REACT_APP_HOST_FOR_ENV}${paths.cabinet.projects.detail.replace(":projectId", project.id)}?threadKey=${threadId}`;

        // Генерация HTML-письма
        const htmlContent = `
        <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        background-color: #f9f9f9;
                        padding: 20px;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background: #fff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    }
                    h1 {
                        color: #007BFF;
                        font-size: 24px;
                        margin-bottom: 20px;
                    }
                    p {
                        margin: 10px 0;
                    }
                    .project-details {
                        margin-top: 20px;
                        padding: 15px;
                        background: #f1f1f1;
                        border-radius: 8px;
                    }
                    .project-details h2 {
                        font-size: 20px;
                        margin-bottom: 10px;
                        color: #333;
                    }
                    .project-details p {
                        margin: 5px 0;
                    }
                    .button {
                        display: inline-block;
                        margin-top: 20px;
                        padding: 10px 20px;
                        background-color: #007BFF;
                        color: #fff;
                        text-decoration: none;
                        border-radius: 5px;
                    }
                    .button:hover {
                        background-color: #0056b3;
                    }
                    .specialist-info {
                        margin-top: 20px;
                        padding: 15px;
                        background: #e9f5ff;
                        border-radius: 8px;
                    }
                    .specialist-info h2 {
                        font-size: 20px;
                        margin-bottom: 10px;
                        color: #007BFF;
                    }
                    .specialist-info p {
                        margin: 5px 0;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Specialist Ready to Help!</h1>
                    <p>Hello,</p>
                    <p>We are excited to inform you that a specialist is ready to assist you with your project. Here are the details:</p>

                    <div class="project-details">
                        <h2>${project.title}</h2>
                        <p><strong>Description:</strong> ${project.description}</p>
                        <p><strong>Budget:</strong> ${new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(project.projectMaximumBudget)}</p>
                        <p><strong>Location:</strong> ${project.location.place_name}</p>
                    </div>

                    <div class="specialist-info">
                        <h2>Specialist Details</h2>
                        <p><strong>Business Name:</strong> ${user.businessName || user.name}</p>
                        <p><strong>Contact:</strong> <a href="mailto:${user.email}">${user.email}</a></p>
                    </div>

                    <p>To view the project and communicate with the specialist, click the button below:</p>
                    <a href="${projectLink}" class="button">View Project</a>

                    <p>Best regards,</p>
                    <p>CTMASS Team</p>
                </div>
            </body>
        </html>
    `;

        return htmlContent;
    }


    createProjectOfferEmail(user, project, threadId) {
        const projectLink = `${process.env.REACT_APP_HOST_FOR_ENV}${paths.cabinet.projects.find.detail.replace(":projectId", project.id)}?threadKey=${threadId}`;
        // Генерация HTML-письма
        const htmlContent = `
    <html>
        <head>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background-color: #f5f7fa;
                    padding: 0;
                    margin: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    background: #fff;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                }
                .header {
                    text-align: center;
                    padding-bottom: 20px;
                    border-bottom: 1px solid #eaeaea;
                    margin-bottom: 25px;
                }
                h1 {
                    color: #2c3e50;
                    font-size: 26px;
                    margin-bottom: 10px;
                }
                .intro {
                    font-size: 16px;
                    margin-bottom: 25px;
                }
                .card {
                    background: #f8f9fa;
                    border-radius: 10px;
                    padding: 20px;
                    margin: 15px 0;
                }
                .card-title {
                    color: #2c3e50;
                    font-size: 18px;
                    margin-top: 0;
                    margin-bottom: 15px;
                }
                .detail-row {
                    margin-bottom: 8px;
                    display: flex;
                }
                .detail-label {
                    font-weight: 600;
                    min-width: 100px;
                    color: #495057;
                }
                .button-container {
                    text-align: center;
                    margin: 30px 0;
                }
                .button {
                    display: inline-block;
                    padding: 12px 30px;
                    background-color: #3498db;
                    color: #fff;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: 600;
                    font-size: 16px;
                    transition: background-color 0.3s;
                }
                .button:hover {
                    background-color: #2980b9;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    color: #7f8c8d;
                    font-size: 14px;
                }
                .highlight {
                    color: #e74c3c;
                    font-weight: 600;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>New Project Opportunity for You</h1>
                </div>

                <div class="intro">
                    <p>Hello <span class="highlight">friend</span>,</p>
                    <p>We've found a project that matches your expertise and would like to invite you to participate.</p>
                </div>

                <div class="card">
                    <h2 class="card-title">Project Details</h2>
                    <div class="detail-row">
                        <span class="detail-label">Title:</span>
                        <span>${project.title}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Description:</span>
                        <span>${project.description}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Personal Message:</span>
                        <span>${project.proposerMessage}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Budget:</span>
                        <span>${new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(project.projectMaximumBudget)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Location:</span>
                        <span>${project.location.place_name}</span>
                    </div>
                </div>

                <div class="card">
                    <h2 class="card-title">Client Information</h2>
                    <div class="detail-row">
                        <span class="detail-label">Name:</span>
                        <span>${user.name}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Contact:</span>
                        <span><a href="mailto:${user.email}">${user.email}</a></span>
                    </div>
                </div>

                <div class="button-container">
                    <p>The client is waiting for your response. Please review the project details and respond as soon as possible.</p>
                    <a href="${projectLink}" class="button">View Project & Respond</a>
                </div>

                <div class="footer">
                    <p>Best regards,</p>
                    <p><strong>CTMASS Team</strong></p>
                    <p>If you're not interested in this project, you can <a href="#">update your preferences</a>.</p>
                </div>
            </div>
        </body>
    </html>
    `;

        return htmlContent;
    }

    createSelectedAsPerformerEmail(project, threadId) {
        const projectLink = `${process.env.REACT_APP_HOST_FOR_ENV}${paths.cabinet.projects.find.detail.replace(":projectId", project.id)}?threadKey=${threadId}`;

        // Генерация HTML-письма
        const htmlContent = `
        <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        background-color: #f9f9f9;
                        padding: 20px;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background: #fff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    }
                    h1 {
                        color: #007BFF;
                        font-size: 24px;
                        margin-bottom: 20px;
                    }
                    p {
                        margin: 10px 0;
                    }
                    .project-details {
                        margin-top: 20px;
                        padding: 15px;
                        background: #f1f1f1;
                        border-radius: 8px;
                    }
                    .project-details h2 {
                        font-size: 20px;
                        margin-bottom: 10px;
                        color: #333;
                    }
                    .project-details p {
                        margin: 5px 0;
                    }
                    .button {
                        display: inline-block;
                        margin-top: 20px;
                        padding: 10px 20px;
                        background-color: #007BFF;
                        color: #fff;
                        text-decoration: none;
                        border-radius: 5px;
                    }
                    .button:hover {
                        background-color: #0056b3;
                    }
                    .congratulations {
                        margin-top: 20px;
                        padding: 15px;
                        background: #e9f5ff;
                        border-radius: 8px;
                        text-align: center;
                    }
                    .congratulations h2 {
                        font-size: 20px;
                        margin-bottom: 10px;
                        color: #007BFF;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Congratulations!</h1>
                    <p>Hello,</p>
                    <p>We are excited to inform you that you have been selected as the performer for the following project:</p>

                    <div class="project-details">
                        <h2>${project.title}</h2>
                        <p><strong>Description:</strong> ${project.description}</p>
                        <p><strong>Budget:</strong> ${new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(project.projectMaximumBudget)}</p>
                        <p><strong>Location:</strong> ${project.location.place_name}</p>
                    </div>

                    <div class="congratulations">
                        <h2>You're the Chosen One!</h2>
                        <p>This is a great opportunity to showcase your skills and deliver outstanding results.</p>
                    </div>

                    <p>To view the project details and start working, click the button below:</p>
                    <a href="${projectLink}" class="button">View Project</a>

                    <p>Best regards,</p>
                    <p>CTMASS Team</p>
                </div>
            </body>
        </html>
    `;

        return htmlContent;
    }

    createRejectedFromProjectEmail(project) {
        const projectLink = `${process.env.REACT_APP_HOST_FOR_ENV}${paths.cabinet.projects.find.detail.replace(":projectId", project.id)}`;

        // Генерация HTML-письма
        const htmlContent = `
        <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        background-color: #f9f9f9;
                        padding: 20px;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background: #fff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    }
                    h1 {
                        color: #ff4d4d;
                        font-size: 24px;
                        margin-bottom: 20px;
                    }
                    p {
                        margin: 10px 0;
                    }
                    .project-details {
                        margin-top: 20px;
                        padding: 15px;
                        background: #f1f1f1;
                        border-radius: 8px;
                    }
                    .project-details h2 {
                        font-size: 20px;
                        margin-bottom: 10px;
                        color: #333;
                    }
                    .project-details p {
                        margin: 5px 0;
                    }
                    .button {
                        display: inline-block;
                        margin-top: 20px;
                        padding: 10px 20px;
                        background-color: #007BFF;
                        color: #fff;
                        text-decoration: none;
                        border-radius: 5px;
                    }
                    .button:hover {
                        background-color: #0056b3;
                    }
                    .rejection-notice {
                        margin-top: 20px;
                        padding: 15px;
                        background: #ffe6e6;
                        border-radius: 8px;
                        text-align: center;
                    }
                    .rejection-notice h2 {
                        font-size: 20px;
                        margin-bottom: 10px;
                        color: #ff4d4d;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Project Rejection Notice</h1>
                    <p>Hello,</p>
                    <p>We regret to inform you that you have been rejected from the following project:</p>

                    <div class="project-details">
                        <h2>${project.title}</h2>
                        <p><strong>Description:</strong> ${project.description}</p>
                        <p><strong>Budget:</strong> ${new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(project.projectMaximumBudget)}</p>
                        <p><strong>Location:</strong> ${project.location.place_name}</p>
                    </div>

                    <div class="rejection-notice">
                        <h2>We Appreciate Your Effort</h2>
                        <p>While you were not selected for this project, we encourage you to keep applying for other opportunities on our platform.</p>
                    </div>

                    <p>To view the project details, click the button below:</p>
                    <a href="${projectLink}" class="button">View Project</a>

                    <p>Best regards,</p>
                    <p>СTMASS Team</p>
                </div>
            </body>
        </html>
    `;

        return htmlContent;
    }

    convertTemplateToHtml(template) {
        // Заменяем переносы строк на HTML теги
        // Одиночные переносы - line breaks
        // Оборачиваем в базовую HTML структуру
        return template
            .replace(/\n\n/g, '</p><p>')  // Двойные переносы - новые параграфы
            .replace(/\n/g, '<br>');
    }

    createReviewRequestPastClients(contractorName, contractorEmail, message, link) {
        return `<html>
<head>
    <meta charset="UTF-8">
    <title>Rate ${contractorName}'s work on CTMASS</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        .header {
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        .owner-message {
            background-color: #f0f7ff;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
            border-left: 4px solid #3498db;
            text-align: center;
        }
        .owner-avatar {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid #3498db;
            margin-bottom: 15px;
        }
        .footer {
            margin-top: 30px;
            font-size: 0.9em;
            color: #7f8c8d;
            border-top: 1px solid #ecf0f1;
            padding-top: 20px;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #3498db;
            color: white !important;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
        }
        .benefits {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .button-container {
            text-align: center;
            margin: 25px 0;
        }
        .contractor-message {
            font-style: italic;
            border-left: 3px solid #f1c40f;
            padding-left: 15px;
            margin: 20px 0;
            color: #555;
        }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>Hello!</h1>
    </div>

    <div class="owner-message">
        <img src="https://lh3.googleusercontent.com/a-/ALV-UjW-0PsVoQMAFMR1H86Z1ZIPD5-qYDHn1T_QNOgZgvWx7X0HQbxP=s272-p-k-rw-no" alt="Jacob, Founder of CTMASS" class="owner-avatar">
        <p><strong>Jacob, Founder of CTMASS</strong></p>
        <p>We created this platform to connect vetted professionals with clients who value quality and reliability. Your feedback helps us maintain high service standards.</p>
    </div>

    <p>The specialist <strong>${contractorName}</strong>, who worked for you, is requesting your feedback on our platform.</p>

    ${message ? `
    <div class="contractor-message">
        <p>Message from ${contractorName}:</p>
        <p>"${this.convertTemplateToHtml(message)}"</p>
    </div>
    ` : ''}

    <div class="button-container">
        <a href="${link}" class="button">Leave a Review</a>
    </div>

    <div class="benefits">
        <h3 style="margin-top: 0; color: #2c3e50;">Why we recommend joining our platform and using CTMASS:</h3>
        <ul style="margin-bottom: 0;">
            <li>⭐ All specialists are verified with document checks</li>
            <li>💎 Ratings and reviews from real clients</li>
            <li>🔐 Secure transactions with quality guarantees</li>
            <li>📱 Convenient app for ordering services</li>
        </ul>
    </div>

    <p>Best regards,<br>
        <strong>The CTMASS Team</strong></p>

    <div class="footer">
        <p style="font-size: 0.8em;">You received this email at the request of ${contractorName} (${contractorEmail}).</p>
    </div>
</div>
</body>
</html>`;
    }

    createCustomerReadyToWorkAgainEmail(projectId, threadId) {
        const projectLink = `${process.env.REACT_APP_HOST_FOR_ENV}${paths.cabinet.projects.find.detail.replace(":projectId", projectId)}?threadKey=${threadId}`;

        // Генерация HTML-письма
        const htmlContent = `
        <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        background-color: #f9f9f9;
                        padding: 20px;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background: #fff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    }
                    h1 {
                        color: #007BFF;
                        font-size: 24px;
                        margin-bottom: 20px;
                    }
                    p {
                        margin: 10px 0;
                    }
                    .project-details {
                        margin-top: 20px;
                        padding: 15px;
                        background: #f1f1f1;
                        border-radius: 8px;
                    }
                    .project-details h2 {
                        font-size: 20px;
                        margin-bottom: 10px;
                        color: #333;
                    }
                    .project-details p {
                        margin: 5px 0;
                    }
                    .button {
                        display: inline-block;
                        margin-top: 20px;
                        padding: 10px 20px;
                        background-color: #007BFF;
                        color: #fff;
                        text-decoration: none;
                        border-radius: 5px;
                    }
                    .button:hover {
                        background-color: #0056b3;
                    }
                    .positive-notice {
                        margin-top: 20px;
                        padding: 15px;
                        background: #e9f5ff;
                        border-radius: 8px;
                        text-align: center;
                    }
                    .positive-notice h2 {
                        font-size: 20px;
                        margin-bottom: 10px;
                        color: #007BFF;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Great News!</h1>
                    <p>Hello,</p>
                    <p>We are excited to inform you that the customer, has expressed interest in working with you again on the following project:</p>

                   <div class="positive-notice">
                        <h2>Your Work is Valued!</h2>
                        <p>This is a great opportunity to continue building a strong professional relationship with the customer.</p>
                    </div>

                    <p>To view the project details and confirm your availability, click the button below:</p>
                    <a href="${projectLink}" class="button">View Project</a>

                    <p>Best regards,</p>
                    <p>CTMASS Team</p>
                </div>
            </body>
        </html>
    `;

        return htmlContent;
    }


    createEvaluateInteractionEmail(project, thread) {
        const projectLink = `${process.env.REACT_APP_HOST_FOR_ENV}${paths.cabinet.projects.find.detail.replace(":projectId", project.id)}?threadKey=${thread.id}`;

        // Генерация HTML-письма
        const htmlContent = `
        <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        background-color: #f9f9f9;
                        padding: 20px;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background: #fff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    }
                    h1 {
                        color: #007BFF;
                        font-size: 24px;
                        margin-bottom: 20px;
                    }
                    p {
                        margin: 10px 0;
                    }
                    .project-details {
                        margin-top: 20px;
                        padding: 15px;
                        background: #f1f1f1;
                        border-radius: 8px;
                    }
                    .project-details h2 {
                        font-size: 20px;
                        margin-bottom: 10px;
                        color: #333;
                    }
                    .project-details p {
                        margin: 5px 0;
                    }
                    .button {
                        display: inline-block;
                        margin-top: 20px;
                        padding: 10px 20px;
                        background-color: #007BFF;
                        color: #fff;
                        text-decoration: none;
                        border-radius: 5px;
                    }
                    .button:hover {
                        background-color: #0056b3;
                    }
                    .evaluation-notice {
                        margin-top: 20px;
                        padding: 15px;
                        background: #e9f5ff;
                        border-radius: 8px;
                        text-align: center;
                    }
                    .evaluation-notice h2 {
                        font-size: 20px;
                        margin-bottom: 10px;
                        color: #007BFF;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Evaluate Your Interaction</h1>
                    <p>Hello,</p>
                    <p>We would like to ask you to evaluate your interaction with the customer on the following project:</p>

                    <div class="project-details">
                        <h2>${project.title}</h2>
                        <p><strong>Description:</strong> ${project.description}</p>
                        <p><strong>Budget:</strong> ${new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(project.projectMaximumBudget)}</p>
                        <p><strong>Location:</strong> ${project.location.place_name}</p>
                    </div>

                    <div class="evaluation-notice">
                        <h2>Your Feedback is Important!</h2>
                        <p>Your evaluation helps us improve the platform and ensure a better experience for everyone.</p>
                    </div>

                    <p>To evaluate the interaction, click the button below:</p>
                    <a href="${projectLink}" class="button">Evaluate Interaction</a>

                    <p>Best regards,</p>
                    <p>CTMASS Team</p>
                </div>
            </body>
        </html>
    `;

        return htmlContent;
    }

    createProjectCompletionConfirmationEmail(project, thread) {
        const projectLink = `${process.env.REACT_APP_HOST_FOR_ENV}${paths.cabinet.projects.detail.replace(":projectId", project.id)}?threadKey=${thread.id}`;

        // Генерация HTML-письма
        const htmlContent = `
        <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        background-color: #f9f9f9;
                        padding: 20px;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background: #fff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    }
                    h1 {
                        color: #007BFF;
                        font-size: 24px;
                        margin-bottom: 20px;
                    }
                    p {
                        margin: 10px 0;
                    }
                    .project-details {
                        margin-top: 20px;
                        padding: 15px;
                        background: #f1f1f1;
                        border-radius: 8px;
                    }
                    .project-details h2 {
                        font-size: 20px;
                        margin-bottom: 10px;
                        color: #333;
                    }
                    .project-details p {
                        margin: 5px 0;
                    }
                    .button {
                        display: inline-block;
                        margin-top: 20px;
                        padding: 10px 20px;
                        background-color: #007BFF;
                        color: #fff;
                        text-decoration: none;
                        border-radius: 5px;
                    }
                    .button:hover {
                        background-color: #0056b3;
                    }
                    .completion-notice {
                        margin-top: 20px;
                        padding: 15px;
                        background: #e9f5ff;
                        border-radius: 8px;
                        text-align: center;
                    }
                    .completion-notice h2 {
                        font-size: 20px;
                        margin-bottom: 10px;
                        color: #007BFF;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Project Completion Notice</h1>
                    <p>Hello,</p>
                    <p>We are pleased to inform you that the specialist has marked the following project as completed:</p>

                    <div class="project-details">
                        <h2>${project.title}</h2>
                        <p><strong>Description:</strong> ${project.description}</p>
                        <p><strong>Budget:</strong> ${new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(project.maxBudget)}</p>
                        <p><strong>Location:</strong> ${project.location.place_name}</p>
                    </div>

                    <div class="completion-notice">
                        <h2>Confirm Completion</h2>
                        <p>Please review the work and confirm that the project has been completed to your satisfaction.</p>
                    </div>

                    <p>To confirm the completion, click the button below:</p>
                    <a href="${projectLink}" class="button">Confirm Completion</a>

                    <p>Best regards,</p>
                    <p>The Platform Team</p>
                </div>
            </body>
        </html>
    `;

        return htmlContent;
    }

    createWelcomeRequestEmail() {
        const htmlContent = `
    <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background-color: #f9f9f9;
                    padding: 20px;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background: #fff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                h1 {
                    color: #007BFF;
                    font-size: 24px;
                    margin-bottom: 20px;
                }
                p {
                    margin: 10px 0;
                }
                .request-details {
                    margin-top: 20px;
                    padding: 15px;
                    background: #f1f1f1;
                    border-radius: 8px;
                }
                .request-details h2 {
                    font-size: 20px;
                    margin-bottom: 10px;
                    color: #333;
                }
                .request-details p {
                    margin: 5px 0;
                }
                .notice {
                    margin-top: 20px;
                    padding: 15px;
                    background: #e9f5ff;
                    border-radius: 8px;
                }
                .notice h2 {
                    font-size: 20px;
                    margin-bottom: 10px;
                    color: #007BFF;
                }
                .contact-info {
                    margin-top: 20px;
                    padding: 15px;
                    background: #fff8e1;
                    border-radius: 8px;
                    border-left: 4px solid #ffc107;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Thank You for Your Request!</h1>
                <p>Hello,</p>
                <p>We appreciate you reaching out to find the right specialist for your needs. Here's what happens next:</p>

                <div class="notice">
                    <h2>Your Request is Under Review</h2>
                    <p>Since you're not yet registered on our platform, your request is currently being moderated by our team.</p>
                    <p>A manager will contact you shortly at the phone number or email you provided to verify details and complete the posting process.</p>
                </div>

                <p>Once approved, your request will be visible to qualified specialists who can submit proposals for your project.</p>

                <p>Thank you for choosing our platform!</p>
                <p>Best regards,</p>
                <p>The CTMASS Team</p>
            </div>
        </body>
    </html>
    `;

        return htmlContent;
    }

    createThankYouEmail(user, platformBenefits = []) {
        const registerLink = `${process.env.REACT_APP_HOST_FOR_ENV}${paths.register.index}`;

        // Генерация HTML-письма
        return `
    <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background-color: #f9f9f9;
                    padding: 20px;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background: #fff;
                    padding: 30px;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                h1 {
                    color: #007BFF;
                    font-size: 28px;
                    margin-bottom: 10px;
                }
                .thank-you {
                    font-size: 20px;
                    color: #28a745;
                    text-align: center;
                    margin-bottom: 20px;
                }
                p {
                    margin: 15px 0;
                    font-size: 16px;
                }
                .benefits {
                    margin: 25px 0;
                    padding: 0;
                }
                .benefit-item {
                    display: flex;
                    align-items: center;
                    margin-bottom: 15px;
                }
                .benefit-icon {
                    font-size: 24px;
                    margin-right: 15px;
                    color: #007BFF;
                }
                .benefit-text {
                    font-size: 16px;
                }
                .button-container {
                    text-align: center;
                    margin: 30px 0;
                }
                .button {
                    display: inline-block;
                    padding: 12px 30px;
                    background-color: #007BFF;
                    color: #fff;
                    text-decoration: none;
                    border-radius: 5px;
                    font-weight: bold;
                    font-size: 18px;
                }
                .button:hover {
                    background-color: #0056b3;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    color: #666;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to CTMASS</h1>
                    <div class="thank-you">Thank you for your feedback!</div>
                </div>

                <p>Dear ${user.name},</p>

                <p>We truly appreciate you taking the time to share your experience. Your feedback helps us improve our platform and services.</p>

                <p>Did you know you can get even more benefits by joining our platform?</p>

                <div class="benefits">
                    ${platformBenefits.map(benefit => `
                        <div class="benefit-item">
                            <div class="benefit-icon">${benefit.icon || '✓'}</div>
                            <div class="benefit-text">${benefit.text}</div>
                        </div>
                    `).join('')}
                </div>

                <div class="button-container">
                    <a href="${registerLink}" class="button">Join CTMASS Now</a>
                </div>

                <p>By registering, you'll be able to:</p>
                <ul>
                    <li>Connect with top-rated specialists</li>
                    <li>Manage all your projects in one place</li>
                    <li>Get exclusive access to premium features</li>
                    <li>Receive special offers and discounts</li>
                </ul>

                <div class="footer">
                    <p>Best regards,</p>
                    <p><strong>The CTMASS Team</strong></p>
                    <p>Need help? Contact us at support@ctmass.com</p>
                </div>
            </div>
        </body>
    </html>
`;
    }


    createSpecialistReviewNotificationEmail(specialist, review, project) {
        const profileLink = `${process.env.REACT_APP_HOST_FOR_ENV}${paths.dashboard.overview.index}`;

        // Генерация HTML-письма
        return `
<html>
    <head>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f9f9f9;
                padding: 20px;
                margin: 0;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background: #fff;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 25px;
                padding-bottom: 20px;
                border-bottom: 1px solid #eee;
            }
            h1 {
                color: #2c7be5;
                font-size: 26px;
                margin-bottom: 15px;
            }
            .notification {
                background-color: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .rating {
                color: #ffc107;
                font-size: 24px;
                margin: 10px 0;
            }
            .review-text {
                font-style: italic;
                padding: 15px;
                background-color: #fff;
                border-left: 3px solid #2c7be5;
                margin: 15px 0;
            }
            .project-info {
                margin: 20px 0;
                padding: 15px;
                background-color: #f1f8fe;
                border-radius: 8px;
            }
            .button-container {
                text-align: center;
                margin: 30px 0;
            }
            .button {
                display: inline-block;
                padding: 12px 25px;
                background-color: #2c7be5;
                color: #fff;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
            }
            .button:hover {
                background-color: #1a68d1;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                color: #666;
                font-size: 14px;
                border-top: 1px solid #eee;
                padding-top: 20px;
            }
            .stars {
                color: #ffc107;
                font-size: 20px;
                letter-spacing: 3px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>New Review on Your Profile</h1>
                <p>Hello ${specialist.name}, you've received a new review!</p>
            </div>

            <div class="notification">
                <h3>Review Summary:</h3>
                <div class="rating">
                    Rating: <span class="stars">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span> (${review.rating}/5)
                </div>
                
                <div class="review-text">
                    "${review.message}"
                </div>
                
                <p><strong>From:</strong> ${review.authorName}</p>                    
            </div>

            ${project ? `
            <div class="project-info">
                <h3>Project Details:</h3>
                <p><strong>Project:</strong> ${project.title || 'No title'}</p>
                ${project.shortDescription ? `<p><strong>Description:</strong> ${project.shortDescription}</p>` : ''}
            </div>
            ` : ''}

            <div class="button-container">
                <a href="${profileLink}" class="button">View in Your Profile</a>
            </div>

            <div class="footer">
                <p>Best regards,</p>
                <p><strong>The CTMASS Team</strong></p>
            </div>
        </div>
    </body>
</html>
`;
    }

    partnerApplicationTpl(values) {
        return {
            subject: `🆕 Partner application: ${values.companyName}`,
            html: `
        <p>Новая заявка на партнёрство</p>
        <pre>${JSON.stringify(values, null, 2)}</pre>
        <p>Откройте Admin → Dashboard → Partners → Pending</p>
      `
        };
    }

    partnerApprovedTpl(values, magicLink) {
        return {
            subject: `✅ Partnership approved for ${values.companyName}`,
            html: `
        <p>Hello ${values.contactPerson},</p>
        <p>Your partnership request has been approved!<br/>
           Click the link below to finish account activation:</p>
        <p>${magicLink}</p>
        <p>— CTMASS team</p>
      `
        };
    }

    createInviteEmail(inviterName, categoryTitle, profileId, personalText, toEmail, categoryKey) {
        const params = new URLSearchParams({ invite: profileId });
        if (toEmail) params.set('email', toEmail);
        if (categoryKey) params.set('category', categoryKey);
        const link = `${process.env.REACT_APP_HOST_FOR_ENV}/register?${params.toString()}`;
        const personalBlock = personalText
            ? `<tr><td style="padding:0 40px 24px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
                    style="background:#f0f7ff;border-left:4px solid #2563eb;border-radius:4px;padding:16px 20px;">
                    <tr><td>
                        <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#2563eb;text-transform:uppercase;letter-spacing:0.5px;">Personal note</p>
                        <p style="margin:0;font-size:15px;color:#374151;line-height:1.6;">${this.convertTemplateToHtml(personalText)}</p>
                    </td></tr>
                </table>
               </td></tr>`
            : '';

        return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>You're invited to CTMASS</title></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Inter,Arial,Helvetica,sans-serif;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#f3f4f6;padding:40px 16px;">
  <tr><td align="center">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

      <tr><td style="background:linear-gradient(135deg,#1e40af 0%,#2563eb 100%);padding:40px 40px 36px;text-align:center;">
        <p style="margin:0 0 8px;font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">CTMASS</p>
        <p style="margin:0;font-size:14px;color:#bfdbfe;letter-spacing:0.5px;">Contractor &amp; Service Marketplace</p>
      </td></tr>

      <tr><td style="padding:40px 40px 8px;">
        <p style="margin:0 0 16px;font-size:22px;font-weight:700;color:#111827;">You've been invited! 🎉</p>
        <p style="margin:0;font-size:16px;color:#374151;line-height:1.7;">
          <strong style="color:#111827;">${inviterName}</strong> is inviting you to join the CTMASS community and adding you to their
          <strong style="color:#2563eb;">${categoryTitle}</strong> network.
        </p>
      </td></tr>

      ${personalBlock}

      <tr><td style="padding:24px 40px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#f9fafb;border-radius:8px;padding:20px 24px;">
          <tr><td>
            <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Why join CTMASS?</p>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr><td style="padding:4px 0;font-size:14px;color:#374151;">✅&nbsp; Connect with trusted contractors</td></tr>
              <tr><td style="padding:4px 0;font-size:14px;color:#374151;">✅&nbsp; Find and manage home improvement projects</td></tr>
              <tr><td style="padding:4px 0;font-size:14px;color:#374151;">✅&nbsp; Build your professional network</td></tr>
            </table>
          </td></tr>
        </table>
      </td></tr>

      <tr><td style="padding:8px 40px 40px;text-align:center;">
        <a href="${link}" style="display:inline-block;padding:14px 36px;background:#2563eb;color:#ffffff;font-size:16px;font-weight:700;border-radius:8px;text-decoration:none;letter-spacing:0.25px;">
          Create My Account
        </a>
        <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;">
          Or paste this link in your browser:<br/>
          <a href="${link}" style="color:#2563eb;word-break:break-all;">${link}</a>
        </p>
      </td></tr>

      <tr><td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
        <p style="margin:0;font-size:12px;color:#9ca3af;">
          © ${new Date().getFullYear()} CTMASS.com — Contractor &amp; Service Marketplace<br/>
          You received this email because ${inviterName} sent you a personal invitation.
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
    }

    createCoinAdjustmentEmailHtml = ({ userName, userEmail, amount, newBalance, reason, isAward }) => {
        const absAmount = Math.abs(amount);
        const formattedDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
        });
        const accentColor = isAward ? '#16a34a' : '#d97706';
        const iconEmoji = isAward ? '🪙' : '📋';
        const headerBg = isAward
            ? 'linear-gradient(135deg,#14532d 0%,#16a34a 100%)'
            : 'linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%)';
        const actionLabel = isAward ? 'Coins Added' : 'Balance Adjusted';
        const amountLabel = isAward
            ? `+${absAmount.toLocaleString()} CTMASS Coins`
            : `−${absAmount.toLocaleString()} CTMASS Coins`;
        const bodyText = isAward
            ? `Great news! Your CTMASS Coins balance has been updated — <strong>${absAmount.toLocaleString()} coins</strong> were added to your account.`
            : `Your CTMASS Coins balance has been updated by our support team. <strong>${absAmount.toLocaleString()} coins</strong> have been adjusted on your account.`;

        return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${actionLabel} — CTMASS Coins</title></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Inter,Arial,Helvetica,sans-serif;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#f3f4f6;padding:40px 16px;">
  <tr><td align="center">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

      <tr><td style="background:${headerBg};padding:36px 40px;text-align:center;">
        <p style="margin:0 0 6px;font-size:30px;">${iconEmoji}</p>
        <p style="margin:0 0 6px;font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">CTMASS</p>
        <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.8);">${actionLabel}</p>
      </td></tr>

      <tr><td style="padding:36px 40px 24px;">
        <p style="margin:0 0 12px;font-size:18px;font-weight:700;color:#111827;">Hello, ${userName || userEmail}!</p>
        <p style="margin:0;font-size:15px;color:#374151;line-height:1.7;">${bodyText}</p>
      </td></tr>

      <tr><td style="padding:0 40px 24px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
          style="background:#f9fafb;border-radius:10px;padding:24px;border:1px solid #e5e7eb;">
          <tr>
            <td style="padding:8px 16px;text-align:center;border-right:1px solid #e5e7eb;">
              <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Amount</p>
              <p style="margin:0;font-size:22px;font-weight:800;color:${accentColor};">${amountLabel}</p>
            </td>
            <td style="padding:8px 16px;text-align:center;">
              <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">New Balance</p>
              <p style="margin:0;font-size:22px;font-weight:800;color:#111827;">${newBalance.toLocaleString()} coins</p>
            </td>
          </tr>
        </table>
      </td></tr>

      <tr><td style="padding:0 40px 24px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
          style="background:#f0f7ff;border-left:4px solid #2563eb;border-radius:4px;padding:16px 20px;">
          <tr><td>
            <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#2563eb;text-transform:uppercase;letter-spacing:0.5px;">Reason</p>
            <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">${reason}</p>
          </td></tr>
        </table>
      </td></tr>

      <tr><td style="padding:0 40px 32px;">
        <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.7;">
          This adjustment was made on <strong>${formattedDate}</strong> by the CTMASS support team.
          If you have any questions or believe this is a mistake, please contact us at
          <a href="mailto:${BUG_REPORT_ADMIN_EMAIL}" style="color:#2563eb;text-decoration:none;font-weight:600;">${BUG_REPORT_ADMIN_EMAIL}</a>.
        </p>
      </td></tr>

      <tr><td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
        <p style="margin:0;font-size:12px;color:#9ca3af;">
          © ${new Date().getFullYear()} CTMASS.com — Contractor &amp; Service Marketplace<br/>
          You received this email because your CTMASS Coins balance was updated by our team.
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
    };

    sendCoinAdjustmentEmail = ({ userName, userEmail, amount, newBalance, reason }) => {
        const isAward = amount > 0;
        const absAmount = Math.abs(amount);
        const subject = isAward
            ? `+${absAmount.toLocaleString()} CTMASS Coins added to your account`
            : `Your CTMASS Coins balance has been updated`;

        return emailSender.send(
            'template_epduqer',
            {
                subject,
                html: this.createCoinAdjustmentEmailHtml({ userName, userEmail, amount, newBalance, reason, isAward }),
                mail_to: userEmail,
                from_name: 'CTMASS Support',
                from: process.env.REACT_APP_ADMIN_MAIL,
            },
            false,
            null,
            false
        );
    };

    sendInviteEmail({ inviterName, toEmail, categoryTitle, profileId, personalText = '', categoryKey = '' }) {
        const params = new URLSearchParams({ invite: profileId });
        if (toEmail) params.set('email', toEmail);
        if (categoryKey) params.set('category', categoryKey);
        const registerLink = `${process.env.REACT_APP_HOST_FOR_ENV}/register?${params.toString()}`;
        return this.sendByTrigger(
            EmailTriggers.INVITE_CONNECTION,
            {
                user: { email: toEmail },
                inviterName,
                categoryTitle,
                profileId,
                personalText
            },
            () => ({
                subject: 'Invitation to CTMASS',
                html: this.createInviteEmail(inviterName, categoryTitle, profileId, personalText, toEmail, categoryKey),
                text:
                    `${inviterName} invites you to join CTMASS and adds you to the category «${categoryTitle}».
${personalText ? `\nPersonal message:\n${personalText}\n` : ''}
Registration link: ${registerLink}`
            })
        );
    }

    sendNotificationPreferencesUpdatedEmail(user, newFreq) {
        return this.sendByTrigger(
            EmailTriggers.NOTIFICATION_PREF_UPDATED,
            { user, newFreq },
            () => ({
                subject: 'Your Notification Preferences Have Been Updated',
                html: this.createNotificationPreferencesUpdated(user, newFreq)
            })
        );
    }

    sendPartnerApplication(values) {
        return this.sendByTrigger(
            EmailTriggers.PARTNER_APPLICATION,
            {
                email: process.env.REACT_APP_ADMIN_MAIL,
                values
            },
            () => this.partnerApplicationTpl(values)
        );
    }

    sendPartnerApproved(values, magicLink) {
        return this.sendByTrigger(
            EmailTriggers.PARTNER_APPROVED,
            { values, magicLink },
            () => this.partnerApprovedTpl(values, magicLink)
        );
    }
}

export const emailService = new EmailService();