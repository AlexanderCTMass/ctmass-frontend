// src/service/github-projects-service.js
import { GraphQLClient } from 'graphql-request';

class GitHubProjectsService {
    constructor() {
        this.token = process.env.REACT_APP_GITHUB_TOKEN;
        this.owner = process.env.REACT_APP_GITHUB_OWNER;
        this.repo = process.env.REACT_APP_GITHUB_REPO;
        this.projectNumber = parseInt(process.env.REACT_APP_GITHUB_PROJECT_NUMBER);
        this.defaultAssignee = process.env.REACT_APP_DEFAULT_ASSIGNEE;

        this.client = new GraphQLClient('https://api.github.com/graphql', {
            headers: {
                authorization: `Bearer ${this.token}`,
            },
        });

        this.ownerType = null;
    }

    async determineOwnerType() {
        if (this.ownerType) return this.ownerType;

        const orgQuery = `
            query CheckOrganization($login: String!) {
                organization(login: $login) {
                    login
                }
            }
        `;

        try {
            const orgResult = await this.client.request(orgQuery, { login: this.owner });
            if (orgResult.organization) {
                this.ownerType = 'organization';
                return 'organization';
            }
        } catch (error) {
            // Not an organization
        }

        const userQuery = `
            query CheckUser($login: String!) {
                user(login: $login) {
                    login
                }
            }
        `;

        try {
            const userResult = await this.client.request(userQuery, { login: this.owner });
            if (userResult.user) {
                this.ownerType = 'user';
                return 'user';
            }
        } catch (error) {
            // Not a user
        }

        throw new Error(`Could not find user or organization with login '${this.owner}'`);
    }

    async createBugReport(bugData) {
        try {
            await this.determineOwnerType();

            const repoId = await this.getRepositoryId();
            const projectData = await this.getProjectData();
            const projectId = projectData.id;

            const issue = await this.createIssue(repoId, bugData);

            const projectItem = await this.addIssueToProject(projectId, issue.id);

            await this.setProjectFields(projectItem.itemId, bugData, projectData.fields);

            await this.addLabelToIssue(issue.id, 'bug');

            if (this.defaultAssignee) {
                await this.assignIssue(issue.id, this.defaultAssignee);
            }

            return {
                success: true,
                issueNumber: issue.number,
                issueUrl: issue.url,
                issueId: issue.id,
                projectItemId: projectItem.itemId,
            };
        } catch (error) {
            console.error('Failed to create GitHub bug report:', error);
            throw error;
        }
    }

    async getRepositoryId() {
        const query = `
            query GetRepositoryId($owner: String!, $name: String!) {
                repository(owner: $owner, name: $name) {
                    id
                    name
                    nameWithOwner
                }
            }
        `;

        const result = await this.client.request(query, {
            owner: this.owner,
            name: this.repo,
        });

        if (!result.repository) {
            throw new Error(`Repository ${this.owner}/${this.repo} not found`);
        }

        return result.repository.id;
    }

    async getProjectData() {
        const ownerType = await this.determineOwnerType();

        let query;
        if (ownerType === 'organization') {
            query = `
                query GetProjectData($owner: String!, $number: Int!) {
                    organization(login: $owner) {
                        projectV2(number: $number) {
                            id
                            title
                            fields(first: 20) {
                                nodes {
                                    ... on ProjectV2Field {
                                        id
                                        name
                                        dataType
                                    }
                                    ... on ProjectV2IterationField {
                                        id
                                        name
                                        dataType
                                    }
                                    ... on ProjectV2SingleSelectField {
                                        id
                                        name
                                        dataType
                                        options {
                                            id
                                            name
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            `;
        } else {
            query = `
                query GetProjectData($owner: String!, $number: Int!) {
                    user(login: $owner) {
                        projectV2(number: $number) {
                            id
                            title
                            fields(first: 20) {
                                nodes {
                                    ... on ProjectV2Field {
                                        id
                                        name
                                        dataType
                                    }
                                    ... on ProjectV2IterationField {
                                        id
                                        name
                                        dataType
                                    }
                                    ... on ProjectV2SingleSelectField {
                                        id
                                        name
                                        dataType
                                        options {
                                            id
                                            name
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            `;
        }

        const result = await this.client.request(query, {
            owner: this.owner,
            number: this.projectNumber,
        });

        const ownerData = ownerType === 'organization'
            ? result.organization
            : result.user;

        if (!ownerData || !ownerData.projectV2) {
            throw new Error(`Project #${this.projectNumber} not found for ${this.owner}`);
        }

        return {
            id: ownerData.projectV2.id,
            title: ownerData.projectV2.title,
            fields: ownerData.projectV2.fields.nodes,
        };
    }

    truncateLogs(logs, maxSize = 30000) {
        if (!logs) return null;

        let logsStr = JSON.stringify(logs, null, 2);
        if (logsStr.length <= maxSize) return logsStr;

        // Обрезаем логи
        const truncated = logs.slice(0, 50); // Берем только первые 50 логов
        const truncatedStr = JSON.stringify(truncated, null, 2);

        if (truncatedStr.length > maxSize) {
            // Если все еще слишком много, уменьшаем еще
            return JSON.stringify(truncated.slice(0, 20), null, 2);
        }

        return truncatedStr + `\n\n... and ${logs.length - 50} more logs (truncated due to size limit)`;
    }

    formatIssueBody(bugData) {
        const screenshotSection = bugData.screenshot
            ? `![Screenshot](${bugData.screenshot})`
            : 'No screenshot attached';

        // Обрезаем логи, если они есть
        let logsSection = 'No console logs collected';
        if (bugData.consoleLogs) {
            let logsData;
            try {
                logsData = JSON.parse(bugData.consoleLogs);
                const truncatedLogs = this.truncateLogs(logsData);
                logsSection = `<details>\n<summary>Click to expand (${bugData.logsCount || 0} logs, showing first ${this.getLogsCount(truncatedLogs)})</summary>\n\n\`\`\`json\n${truncatedLogs}\n\`\`\`\n\n</details>`;
            } catch (e) {
                logsSection = 'Error parsing console logs';
            }
        }

        const body = `
## 🐛 Bug Report #${bugData.bugNumber}

### 👤 User Information
| Field | Value |
|-------|-------|
| **Name** | ${this.escapeMarkdown(bugData.name)} |
| **Email** | ${this.escapeMarkdown(bugData.email)} |
| **Reported** | ${new Date().toLocaleString()} |
| **Bug ID** | #${bugData.bugNumber} |

### 📝 Description
${this.escapeMarkdown(bugData.description)}

### 📸 Screenshot
${screenshotSection}

### 🔧 Technical Details
| Field | Value |
|-------|-------|
| **URL** | ${this.escapeMarkdown(bugData.location || bugData.url)} |
| **User Agent** | ${this.escapeMarkdown(bugData.userAgent)} |
| **Browser** | ${this.getBrowserInfo()} |
| **OS** | ${this.getOSInfo()} |
| **Screen Resolution** | ${window.screen.width}x${window.screen.height} |
| **Viewport** | ${window.innerWidth}x${window.innerHeight} |

### 📊 Console Logs
${logsSection}

### 🌐 Environment
\`\`\`json
{
  "url": "${this.escapeMarkdown(bugData.url)}",
  "timestamp": "${bugData.timestamp}",
  "referrer": "${this.escapeMarkdown(document.referrer)}",
  "language": "${navigator.language}",
  "cookieEnabled": ${navigator.cookieEnabled},
  "onLine": ${navigator.onLine}
}
\`\`\`

---
*This bug report was automatically created by the Feedback System*
        `;

        // Ограничиваем общий размер body (максимум 65000 символов для безопасности)
        if (body.length > 65000) {
            // Если все еще слишком много, обрезаем описание и логи
            const truncatedBody = body.substring(0, 60000) + "\n\n... (truncated due to size limit)";
            return truncatedBody;
        }

        return body;
    }

    getLogsCount(truncatedLogs) {
        try {
            const logs = JSON.parse(truncatedLogs);
            return logs.length;
        } catch (e) {
            return 'some';
        }
    }

    escapeMarkdown(text) {
        if (!text) return '';
        // Экранируем специальные символы Markdown
        return text.replace(/[\\`*_{}[\]()#+\-.!]/g, '\\$&');
    }

    getBrowserInfo() {
        const ua = navigator.userAgent;
        if (ua.includes('Chrome')) return 'Chrome';
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Safari')) return 'Safari';
        if (ua.includes('Edge')) return 'Edge';
        return 'Unknown';
    }

    getOSInfo() {
        const ua = navigator.userAgent;
        if (ua.includes('Windows')) return 'Windows';
        if (ua.includes('Mac')) return 'macOS';
        if (ua.includes('Linux')) return 'Linux';
        if (ua.includes('Android')) return 'Android';
        if (ua.includes('iOS')) return 'iOS';
        return 'Unknown';
    }

    async createIssue(repositoryId, bugData) {
        const mutation = `
            mutation CreateIssue($repositoryId: ID!, $title: String!, $body: String!) {
                createIssue(input: {
                    repositoryId: $repositoryId
                    title: $title
                    body: $body
                }) {
                    issue {
                        id
                        number
                        url
                        title
                    }
                }
            }
        `;

        const title = `[BUG #${bugData.bugNumber}] ${bugData.description.substring(0, 80)}${bugData.description.length > 80 ? '...' : ''}`;
        const body = this.formatIssueBody(bugData);

        // Проверяем размер body перед отправкой
        if (body.length > 65536) {
            console.warn(`Body length (${body.length}) exceeds GitHub limit. Truncating...`);
            // Это уже должно быть обработано в formatIssueBody, но на всякий случай
        }

        const result = await this.client.request(mutation, {
            repositoryId,
            title,
            body,
        });

        return {
            id: result.createIssue.issue.id,
            number: result.createIssue.issue.number,
            url: result.createIssue.issue.url,
            title: result.createIssue.issue.title,
        };
    }

    async addIssueToProject(projectId, contentId) {
        const mutation = `
            mutation AddProjectItem($projectId: ID!, $contentId: ID!) {
                addProjectV2ItemById(input: {
                    projectId: $projectId
                    contentId: $contentId
                }) {
                    item {
                        id
                    }
                }
            }
        `;

        const result = await this.client.request(mutation, {
            projectId,
            contentId,
        });

        return {
            itemId: result.addProjectV2ItemById.item.id,
        };
    }

    async setProjectFields(itemId, bugData, fields) {
        const statusField = fields.find(f =>
            f.name === 'Status' ||
            f.name === 'Статус' ||
            f.name.toLowerCase().includes('status')
        );

        const priorityField = fields.find(f =>
            f.name === 'Priority' ||
            f.name === 'Приоритет' ||
            f.name.toLowerCase().includes('priority')
        );

        const updates = [];

        if (statusField && statusField.options) {
            const newStatusOption = statusField.options.find(
                opt => opt.name === 'Todo' ||
                    opt.name === 'New' ||
                    opt.name === '🆕 New' ||
                    opt.name === 'To Do' ||
                    opt.name.toLowerCase().includes('todo')
            );
            if (newStatusOption) {
                updates.push(this.updateProjectSingleSelectField(itemId, statusField.id, newStatusOption.id));
            }
        }

        if (priorityField && priorityField.options) {
            const mediumPriority = priorityField.options.find(
                opt => opt.name === 'Medium' ||
                    opt.name === '🟡 Medium' ||
                    opt.name.toLowerCase().includes('medium')
            );
            if (mediumPriority) {
                updates.push(this.updateProjectSingleSelectField(itemId, priorityField.id, mediumPriority.id));
            }
        }

        await Promise.all(updates);
    }

    async updateProjectSingleSelectField(itemId, fieldId, optionId) {
        const mutation = `
            mutation UpdateProjectField($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
                updateProjectV2ItemFieldValue(input: {
                    projectId: $projectId
                    itemId: $itemId
                    fieldId: $fieldId
                    value: {
                        singleSelectOptionId: $optionId
                    }
                }) {
                    projectV2Item {
                        id
                    }
                }
            }
        `;

        const projectData = await this.getProjectData();
        const projectId = projectData.id;

        await this.client.request(mutation, {
            projectId,
            itemId,
            fieldId,
            optionId,
        });
    }

    async addLabelToIssue(issueId, labelName) {
        const labelId = await this.getLabelId(labelName);
        if (!labelId) {
            console.log(`Label "${labelName}" not found, skipping...`);
            return;
        }

        const mutation = `
            mutation AddLabel($labelableId: ID!, $labelIds: [ID!]!) {
                addLabelsToLabelable(input: {
                    labelableId: $labelableId
                    labelIds: $labelIds
                }) {
                    clientMutationId
                }
            }
        `;

        try {
            await this.client.request(mutation, {
                labelableId: issueId,
                labelIds: [labelId],
            });
        } catch (error) {
            console.error('Failed to add label:', error);
        }
    }

    async getLabelId(labelName) {
        const query = `
            query GetLabelId($owner: String!, $name: String!, $labelName: String!) {
                repository(owner: $owner, name: $name) {
                    labels(first: 10, query: $labelName) {
                        nodes {
                            id
                            name
                        }
                    }
                }
            }
        `;

        const result = await this.client.request(query, {
            owner: this.owner,
            name: this.repo,
            labelName,
        });

        const label = result.repository.labels.nodes.find(l => l.name === labelName);
        return label ? label.id : null;
    }

    async assignIssue(issueId, assigneeLogin) {
        const userId = await this.getUserId(assigneeLogin);
        if (!userId) {
            console.log(`User "${assigneeLogin}" not found, skipping assignment...`);
            return;
        }

        const mutation = `
            mutation AssignIssue($issueId: ID!, $assigneeIds: [ID!]!) {
                addAssigneesToAssignable(input: {
                    assignableId: $issueId
                    assigneeIds: $assigneeIds
                }) {
                    clientMutationId
                }
            }
        `;

        try {
            await this.client.request(mutation, {
                issueId,
                assigneeIds: [userId],
            });
        } catch (error) {
            console.error('Failed to assign issue:', error);
        }
    }

    async getUserId(login) {
        const query = `
            query GetUserId($login: String!) {
                user(login: $login) {
                    id
                    login
                }
            }
        `;

        try {
            const result = await this.client.request(query, { login });
            return result.user ? result.user.id : null;
        } catch (error) {
            console.error('Failed to get user ID:', error);
            return null;
        }
    }
}

export const githubProjectsService = new GitHubProjectsService();