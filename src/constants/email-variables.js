export const VARIABLE_SCHEMAS = {
    project_offer: {
        name: 'Project Offer Template',
        variables: [
            { key: 'user.name', display: 'User name', template: '{{user.name}}', description: 'Имя получателя' },
            { key: 'user.email', display: 'User e-mail', template: '{{user.email}}', description: 'E-mail получателя' },
            { key: 'project.title', display: 'Project title', template: '{{project.title}}', description: 'Заголовок проекта' },
            { key: 'project.description', display: 'Project description', template: '{{project.description}}', description: 'Описание проекта' },
            { key: 'project.projectMaximumBudget', display: 'Budget (USD)', template: '{{project.projectMaximumBudget}}', description: 'Максимальный бюджет' },
            { key: 'project.location.place_name', display: 'Location', template: '{{project.location.place_name}}', description: 'Геолокация' },
            { key: 'threadId', display: 'Thread id', template: '{{threadId}}', description: 'ID переписки' }
        ]
    },

    welcome_email: {
        name: 'Welcome E-mail',
        variables: [
            { key: 'user.firstName', display: 'First name', template: '{{user.firstName}}', description: 'Имя' },
            { key: 'user.lastName', display: 'Last name', template: '{{user.lastName}}', description: 'Фамилия' },
            { key: 'activationLink', display: 'Activation link', template: '{{activationLink}}', description: 'Ссылка активации' }
        ]
    },

    notification_preferences_updated: {
        name: 'Notification settings updated',
        variables: [
            { key: 'user.name', display: 'User name', template: '{{user.name}}', description: 'Имя пользователя' },
            { key: 'user.email', display: 'User e-mail', template: '{{user.email}}', description: 'E-mail' },
            { key: 'newFreq', display: 'New frequency', template: '{{newFreq}}', description: 'Новая частота' }
        ]
    },

    specialist_ready: {
        name: 'Specialist ready',
        variables: [
            { key: 'user.name', display: 'Specialist name', template: '{{user.name}}' },
            { key: 'user.email', display: 'Specialist e-mail', template: '{{user.email}}' },
            { key: 'project.title', display: 'Project title', template: '{{project.title}}' },
            { key: 'project.description', display: 'Project description', template: '{{project.description}}' },
            { key: 'project.projectMaximumBudget', display: 'Budget', template: '{{project.projectMaximumBudget}}' },
            { key: 'project.location.place_name', display: 'Location', template: '{{project.location.place_name}}' },
            { key: 'threadId', display: 'Thread id', template: '{{threadId}}' }
        ]
    },

    selected_performer: {
        name: 'Selected performer',
        variables: [
            { key: 'project.title', display: 'Project title', template: '{{project.title}}' },
            { key: 'project.description', display: 'Project description', template: '{{project.description}}' },
            { key: 'project.projectMaximumBudget', display: 'Budget', template: '{{project.projectMaximumBudget}}' },
            { key: 'project.location.place_name', display: 'Location', template: '{{project.location.place_name}}' },
            { key: 'threadId', display: 'Thread id', template: '{{threadId}}' }
        ]
    },

    project_rejected: {
        name: 'Project rejected',
        variables: [
            { key: 'project.title', display: 'Title', template: '{{project.title}}' },
            { key: 'project.description', display: 'Description', template: '{{project.description}}' },
            { key: 'project.projectMaximumBudget', display: 'Budget', template: '{{project.projectMaximumBudget}}' },
            { key: 'project.location.place_name', display: 'Location', template: '{{project.location.place_name}}' }
        ]
    },

    project_completion_confirmation: {
        name: 'Project completion',
        variables: [
            { key: 'project.title', display: 'Title', template: '{{project.title}}' },
            { key: 'project.description', display: 'Description', template: '{{project.description}}' },
            { key: 'project.maxBudget', display: 'Budget', template: '{{project.maxBudget}}' },
            { key: 'project.location.place_name', display: 'Location', template: '{{project.location.place_name}}' },
            { key: 'thread.id', display: 'Thread id', template: '{{thread.id}}' }
        ]
    },

    evaluate_interaction: {
        name: 'Evaluate interaction',
        variables: [
            { key: 'project.title', display: 'Title', template: '{{project.title}}' },
            { key: 'project.description', display: 'Description', template: '{{project.description}}' },
            { key: 'project.projectMaximumBudget', display: 'Budget', template: '{{project.projectMaximumBudget}}' },
            { key: 'project.location.place_name', display: 'Location', template: '{{project.location.place_name}}' },
            { key: 'thread.id', display: 'Thread id', template: '{{thread.id}}' }
        ]
    },

    review_request_past_clients: {
        name: 'Review request (past clients)',
        variables: [
            { key: 'contractorName', display: 'Contractor name', template: '{{contractorName}}' },
            { key: 'contractorEmail', display: 'Contractor e-mail', template: '{{contractorEmail}}' },
            { key: 'message', display: 'Message', template: '{{message}}' },
            { key: 'link', display: 'Review link', template: '{{link}}' }
        ]
    },

    specialist_review_notification: {
        name: 'Specialist review notification',
        variables: [
            { key: 'specialist.name', display: 'Specialist name', template: '{{specialist.name}}' },
            { key: 'review.rating', display: 'Rating', template: '{{review.rating}}' },
            { key: 'review.message', display: 'Review message', template: '{{review.message}}' },
            { key: 'review.authorName', display: 'Author', template: '{{review.authorName}}' },
            { key: 'project.title', display: 'Project title', template: '{{project.title}}' }
        ]
    },

    bug_feedback: {
        name: 'Bug / feedback',
        variables: [
            { key: 'name', display: 'Reporter name', template: '{{name}}' },
            { key: 'email', display: 'Reporter e-mail', template: '{{email}}' },
            { key: 'description', display: 'Description', template: '{{description}}' },
            { key: 'location', display: 'URL', template: '{{location}}' },
            { key: 'screenshot', display: 'Screenshot URL', template: '{{screenshot}}' }
        ]
    },

    partner_application: {
        name: 'Partner application',
        variables: [
            { key: 'values.companyName', display: 'Company name', template: '{{values.companyName}}' },
            { key: 'values.contactPerson', display: 'Contact person', template: '{{values.contactPerson}}' }
        ]
    },

    partner_approved: {
        name: 'Partner approved',
        variables: [
            { key: 'values.companyName', display: 'Company name', template: '{{values.companyName}}' },
            { key: 'values.contactPerson', display: 'Contact person', template: '{{values.contactPerson}}' },
            { key: 'magicLink', display: 'Activation link', template: '{{magicLink}}' }
        ]
    },

    invite_connection: {
        name: 'Invite connection',
        variables: [
            { key: 'inviterName', display: 'Inviter name', template: '{{inviterName}}' },
            { key: 'categoryTitle', display: 'Category title', template: '{{categoryTitle}}' },
            { key: 'profileId', display: 'Profile id', template: '{{profileId}}' },
            { key: 'personalText', display: 'Personal text', template: '{{personalText}}' }
        ]
    }
};