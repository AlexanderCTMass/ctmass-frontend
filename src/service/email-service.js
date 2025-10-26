import { paths } from "src/paths";
import { emailSender } from "src/libs/email-sender";
import { emailTemplateService } from 'src/service/email-template-service';
import { EmailTriggers } from "src/constants/email-triggers";
import Handlebars from 'handlebars/dist/handlebars.min.js';

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
                        background-color: #007BFF;
                        color: #fff;
                        text-decoration: none;
                        border-radius: 5px;
                    }
                    .button:hover {
                        background-color: #0056b3;
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
        const hostUrl = process.env.REACT_APP_HOST_FOR_ENV;

        // Generate HTML email
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
        const profileLink = `${process.env.REACT_APP_HOST_FOR_ENV}${paths.cabinet.profiles.my.index}`;

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

    createInviteEmail(inviterName, categoryTitle, profileId, personalText) {
        const link = `${process.env.REACT_APP_HOST_FOR_ENV}/register?invite=${profileId}`;
        const safeText = personalText
            ? `<p style="margin:16px 0;"><strong>Personal message:</strong><br/>${this.convertTemplateToHtml(personalText)}</p>`
            : '';

        return `
        <p>${inviterName} invites you to join <strong>CTMASS</strong> and adds you to the category «${categoryTitle}».</p>
        ${safeText}
        <p><a href="${link}" style="display:inline-block;padding:12px 24px;background:#007bff;color:#fff;border-radius:4px;text-decoration:none">
           Register on CTMASS
        </a></p>`;
    }

    sendInviteEmail({ inviterName, toEmail, categoryTitle, profileId, personalText = '' }) {
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
                html: this.createInviteEmail(inviterName, categoryTitle, profileId, personalText),
                text:
                    `${inviterName} invites you to join CTMASS and adds you to the category «${categoryTitle}».
${personalText ? `\nPersonal message:\n${personalText}\n` : ''}
Registration link: ${process.env.REACT_APP_HOST_FOR_ENV}/register?invite=${profileId}`
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
            { values },
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