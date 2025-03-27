import {paths} from "src/paths";

class EmailService {
    createBagFeedbackEmailHtml = (templateParams) => {
        const {name, email, description, location, screenshot} = templateParams;

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
        const {title, description, projectMaximumBudget, location} = project;

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
                    <a href="${process.env.REACT_APP_HOST_P}${paths.cabinet.projects.find.detail.replace(":projectId", project.id)}" class="button">View Project</a>

                    <p>Best regards,</p>
                    <p>CTMASS Team</p>
                </div>
            </body>
        </html>
    `;

        return htmlContent;
    }

    createSpecialistReadyEmail(user, project, threadId) {
        const projectLink = `${process.env.REACT_APP_HOST_P}${paths.cabinet.projects.detail.replace(":projectId", project.id)}?threadKey=${threadId}`;

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

    createSelectedAsPerformerEmail(project, threadId) {
        const projectLink = `${process.env.REACT_APP_HOST_P}${paths.cabinet.projects.find.detail.replace(":projectId", project.id)}?threadKey=${threadId}`;

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
        const projectLink = `${process.env.REACT_APP_HOST_P}${paths.cabinet.projects.find.detail.replace(":projectId", project.id)}`;

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
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            border-left: 4px solid #3498db;
            display: flex;
            align-items: center;
            gap: 15px;
        }
        .owner-avatar {
            width: 200px;
            height: 200px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid #3498db;
        }
        .owner-info {
            flex: 1;
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
        <div class="owner-info">
            <p><strong>Jacob, Founder of CTMASS</strong></p>
            <p>We created this platform to connect vetted professionals with clients who value quality and reliability. Your feedback helps us maintain high service standards.</p>
        </div>
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
        const projectLink = `${process.env.REACT_APP_HOST_P}${paths.cabinet.projects.find.detail.replace(":projectId", projectId)}?threadKey=${threadId}`;

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
        const projectLink = `${process.env.REACT_APP_HOST_P}${paths.cabinet.projects.find.detail.replace(":projectId", project.id)}?threadKey=${thread.id}`;

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
                    <p>CTMass Team</p>
                </div>
            </body>
        </html>
    `;

        return htmlContent;
    }

    createProjectCompletionConfirmationEmail(project, thread) {
        const projectLink = `${process.env.REACT_APP_HOST_P}${paths.cabinet.projects.detail.replace(":projectId", project.id)}?threadKey=${thread.id}`;

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
}

export const emailService = new EmailService();