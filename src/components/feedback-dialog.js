import {useCallback, useState, useRef, useEffect} from 'react';
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    TextField,
    Typography,
    FormControlLabel,
    Checkbox,
    Alert,
    Chip,
    Stack,
    Tooltip,
    Link,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import ScreenshotIcon from '@mui/icons-material/Screenshot';
import TerminalIcon from '@mui/icons-material/Terminal';
import GitHubIcon from '@mui/icons-material/GitHub';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import {useAuth} from 'src/hooks/use-auth';
import {storage} from 'src/libs/firebase';
import {getDownloadURL, ref, uploadBytes} from 'firebase/storage';
import {v4 as uuidv4} from 'uuid';
import {emailService} from 'src/service/email-service';
import {getNextBugNumber} from 'src/api/bug-reports';
import {githubProjectsService} from 'src/service/github-service';

// src/utils/console-logger.js
class ConsoleLogger {
    constructor(maxLogs = 1000) {
        this.logs = [];
        this.maxLogs = maxLogs;
        this.originalConsole = {
            log: console.log,
            error: console.error,
            warn: console.warn,
            info: console.info,
        };
        this.currentPage = window.location.pathname;
    }

    start() {
        this.logs = [];

        const addLog = (type, args) => {
            // Получаем стек вызовов для определения источника ошибки
            const stack = new Error().stack;
            const relevantStack = this.extractRelevantStack(stack);

            const logEntry = {
                type,
                timestamp: new Date().toISOString(),
                message: args.map(arg => {
                    try {
                        if (typeof arg === 'object') {
                            // Ограничиваем размер объектов
                            const str = JSON.stringify(arg, null, 2);
                            return str.length > 500 ? str.substring(0, 500) + '...' : str;
                        }
                        return String(arg);
                    } catch (e) {
                        return '[Unserializable]';
                    }
                }).join(' '),
                stack: relevantStack,
                page: window.location.pathname,
                component: this.extractComponentName(stack)
            };

            this.logs.push(logEntry);

            // Ограничиваем количество логов
            if (this.logs.length > this.maxLogs) {
                this.logs.shift();
            }
        };

        console.log = (...args) => {
            addLog('log', args);
            this.originalConsole.log.apply(console, args);
        };

        console.error = (...args) => {
            addLog('error', args);
            this.originalConsole.error.apply(console, args);
        };

        console.warn = (...args) => {
            addLog('warn', args);
            this.originalConsole.warn.apply(console, args);
        };

        console.info = (...args) => {
            addLog('info', args);
            this.originalConsole.info.apply(console, args);
        };
    }

    extractRelevantStack(stack) {
        if (!stack) return '';
        const lines = stack.split('\n');
        // Находим строки, относящиеся к нашему приложению (не node_modules)
        const relevantLines = lines.filter(line =>
            line.includes('/src/') &&
            !line.includes('node_modules') &&
            !line.includes('console-logger')
        );
        return relevantLines.slice(0, 3).join('\n');
    }

    extractComponentName(stack) {
        if (!stack) return 'unknown';
        const match = stack.match(/at\s+(\w+)\s*\(/);
        if (match && match[1] !== 'console') {
            return match[1];
        }

        // Попытка найти компонент в пути
        const pathMatch = stack.match(/\/src\/(.+?)\//);
        if (pathMatch) {
            return pathMatch[1];
        }

        return 'unknown';
    }

    stop() {
        console.log = this.originalConsole.log;
        console.error = this.originalConsole.error;
        console.warn = this.originalConsole.warn;
        console.info = this.originalConsole.info;
    }

    getLogs(lastMinutes = 3, filters = {}) {
        const cutoffTime = new Date(Date.now() - lastMinutes * 60 * 1000);
        let filteredLogs = this.logs.filter(log => new Date(log.timestamp) >= cutoffTime);

        // Фильтр по типу (только ошибки и важные предупреждения)
        if (filters.onlyErrors) {
            filteredLogs = filteredLogs.filter(log =>
                log.type === 'error' ||
                (log.type === 'warn' && this.isImportantWarning(log.message))
            );
        }

        // Фильтр по текущей странице
        if (filters.currentPageOnly) {
            const currentPage = window.location.pathname;
            filteredLogs = filteredLogs.filter(log => log.page === currentPage);
        }

        // Фильтр по компоненту
        if (filters.component && filters.component !== 'all') {
            filteredLogs = filteredLogs.filter(log =>
                log.component === filters.component
            );
        }

        // Группировка по типу
        if (filters.groupByType) {
            filteredLogs = this.groupLogsByType(filteredLogs);
        }

        // Удаляем дубликаты
        filteredLogs = this.removeDuplicates(filteredLogs);

        // Ограничиваем количество (максимум 50)
        if (filteredLogs.length > 50) {
            filteredLogs = filteredLogs.slice(-50);
        }

        return filteredLogs;
    }

    isImportantWarning(message) {
        const importantWarnings = [
            'Failed to load',
            '404',
            '500',
            'network error',
            'timeout',
            'permission denied',
            'unauthorized',
            'authentication failed',
            'api error',
            'stripe',
            'firebase',
            'database'
        ];

        return importantWarnings.some(warning =>
            message.toLowerCase().includes(warning.toLowerCase())
        );
    }

    groupLogsByType(logs) {
        const grouped = {};
        logs.forEach(log => {
            if (!grouped[log.type]) {
                grouped[log.type] = [];
            }
            grouped[log.type].push(log);
        });

        // Возвращаем плоский массив, но сгруппированный
        return [
            ...(grouped.error || []),
            ...(grouped.warn || []),
            ...(grouped.info || []),
            ...(grouped.log || [])
        ];
    }

    removeDuplicates(logs) {
        const unique = [];
        const seen = new Set();

        logs.forEach(log => {
            const key = `${log.type}:${log.message.substring(0, 100)}:${log.component}`;
            if (!seen.has(key)) {
                seen.add(key);
                unique.push(log);
            }
        });

        return unique;
    }

    getSummary() {
        const now = Date.now();
        const lastHour = now - 60 * 60 * 1000;

        const recentLogs = this.logs.filter(log => new Date(log.timestamp).getTime() >= lastHour);

        return {
            total: this.logs.length,
            errors: this.logs.filter(l => l.type === 'error').length,
            warnings: this.logs.filter(l => l.type === 'warn').length,
            recentErrors: recentLogs.filter(l => l.type === 'error').length,
            byPage: this.groupByPage(this.logs),
            byComponent: this.groupByComponent(this.logs)
        };
    }

    groupByPage(logs) {
        const pages = {};
        logs.forEach(log => {
            if (!pages[log.page]) {
                pages[log.page] = 0;
            }
            pages[log.page]++;
        });
        return pages;
    }

    groupByComponent(logs) {
        const components = {};
        logs.forEach(log => {
            if (!components[log.component]) {
                components[log.component] = 0;
            }
            components[log.component]++;
        });
        return components;
    }

    clear() {
        this.logs = [];
    }
}

let consoleLogger = null;

export const initConsoleLogger = () => {
    if (!consoleLogger) {
        consoleLogger = new ConsoleLogger();
        consoleLogger.start();
    }
};

export const getConsoleLogger = () => consoleLogger;


const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    description: Yup.string().required('Description is required'),
    screenshot: Yup.mixed(),
    includeLogs: Yup.boolean(),
});

const FeedbackDialog = ({open, onClose}) => {
    const {user} = useAuth();
    const [isTakingScreenshot, setIsTakingScreenshot] = useState(false);
    const [logs, setLogs] = useState([]);
    const [shouldReopen, setShouldReopen] = useState(false);
    const [githubStatus, setGithubStatus] = useState(null);
    const dialogRef = useRef(null);

    // Получаем логи при открытии диалога
    useEffect(() => {
        if (open && consoleLogger) {
            const recentLogs = consoleLogger.getLogs(3);
            setLogs(recentLogs);
        }
    }, [open]);

    // Эффект для переоткрытия диалога после скриншота
    useEffect(() => {
        if (shouldReopen) {
            setShouldReopen(false);
            // Небольшая задержка перед открытием
            setTimeout(() => {
                onClose();
                toast.success('Screenshot captured! Please reopen the feedback dialog to continue.', {
                    duration: 3000,
                });
            }, 100);
        }
    }, [shouldReopen, onClose]);

    const formik = useFormik({
        initialValues: {
            name: user?.name || '',
            email: user?.email || '',
            description: '',
            screenshot: null,
            includeLogs: true,
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            let bugNumber = null;
            let githubResult = null;

            try {
                bugNumber = await getNextBugNumber();

                let screenshotUrl = null;
                if (values.screenshot) {
                    const storageRef = ref(storage, `bug-reports/${uuidv4()}/${values.screenshot.name}`);
                    await uploadBytes(storageRef, values.screenshot);
                    screenshotUrl = await getDownloadURL(storageRef);
                }

                const params = {
                    bugNumber,
                    name: values.name,
                    email: values.email,
                    description: values.description,
                    location: window.location.href,
                    screenshot: screenshotUrl,
                    userAgent: navigator.userAgent,
                    timestamp: new Date().toISOString(),
                    url: window.location.href,
                };

                // Добавляем логи, если пользователь согласился
                if (values.includeLogs && logs.length > 0) {
                    params.consoleLogs = JSON.stringify(logs, null, 2);
                    params.logsCount = logs.length;
                }

                // Создаем тикет в GitHub Projects
                setGithubStatus({loading: true});
                try {
                    githubResult = await githubProjectsService.createBugReport(params);
                    setGithubStatus({
                        success: true,
                        url: githubResult.issueUrl,
                        number: githubResult.issueNumber,
                    });
                    params.githubIssueUrl = githubResult.issueUrl;
                    params.githubIssueNumber = githubResult.issueNumber;
                } catch (githubError) {
                    console.error('GitHub integration failed:', githubError);
                    setGithubStatus({
                        success: false,
                        error: githubError.message,
                    });
                }

                // Отправляем email уведомления
                await emailService.sendBugReportToAdmin(params);
                await emailService.sendBugReportConfirmationToUser(params);

                // Показываем успешное сообщение
                if (githubResult && githubResult.success) {
                    toast.success(
                        <Box>
                            <Typography variant="body2" gutterBottom>
                                ✅ Bug #{bugNumber} reported successfully!
                            </Typography>
                            <Link
                                href={githubResult.issueUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{fontSize: '0.875rem'}}
                            >
                                <GitHubIcon sx={{fontSize: 14, mr: 0.5}}/>
                                View on GitHub →
                            </Link>
                        </Box>,
                        {duration: 8000}
                    );
                } else {
                    toast.success(`Thank you for your feedback! Bug #${bugNumber}`);
                }

                formik.resetForm();
                onClose();
            } catch (error) {
                toast.error('An error occurred. Please try again.');
                console.error(error);
            } finally {
                setTimeout(() => {
                    setGithubStatus(null);
                }, 5000);
            }
        },
    });

    const handleScreenshotUpload = useCallback((event) => {
        const file = event.target.files[0];
        if (file) {
            // Проверяем размер файла (макс 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Screenshot size should be less than 5MB');
                return;
            }
            formik.setFieldValue('screenshot', file);
        }
        event.target.value = '';
    }, [formik]);

    const handleRemoveScreenshot = useCallback(() => {
        formik.setFieldValue('screenshot', null);
    }, [formik]);

    const takeScreenshot = useCallback(async () => {
        if (!window.navigator.mediaDevices?.getDisplayMedia) {
            toast.error('Screen capture is not supported in this browser. Please upload a screenshot manually.');
            return;
        }

        try {
            setIsTakingScreenshot(true);

            // Закрываем диалог
            onClose();
            await new Promise(resolve => setTimeout(resolve, 200));

            toast.loading('Select the area to capture...', {id: 'screenshot-toast'});

            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: "always",
                    displaySurface: "window",
                },
                audio: false,
                preferCurrentTab: true,
            });

            const video = document.createElement('video');
            video.srcObject = stream;

            await new Promise((resolve) => {
                video.onloadedmetadata = () => {
                    video.play();
                    resolve();
                };
            });

            await new Promise(resolve => setTimeout(resolve, 100));

            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85));
            const file = new File([blob], `screenshot-${Date.now()}.jpg`, {type: 'image/jpeg'});

            stream.getTracks().forEach(track => track.stop());

            formik.setFieldValue('screenshot', file);

            toast.success('Screenshot captured!', {id: 'screenshot-toast'});
            setShouldReopen(true);
        } catch (err) {
            if (err.name === 'NotAllowedError') {
                toast.error('You need to grant screen capture permission to take a screenshot.');
            } else if (err.name === 'AbortError') {
                toast('Screenshot cancelled.');
            } else {
                console.error('Screenshot error:', err);
                toast.error('Failed to capture screenshot. Please try uploading manually.');
            }
            setShouldReopen(true);
        } finally {
            setIsTakingScreenshot(false);
        }
    }, [formik, onClose]);

    const previewUrl = formik.values.screenshot
        ? URL.createObjectURL(formik.values.screenshot)
        : null;

    // Очищаем URL объект при размонтировании
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const logSummary = logs.length > 0
        ? `${logs.length} log${logs.length !== 1 ? 's' : ''} (last 3 min)`
        : 'No logs available';

    const errorLogsCount = logs.filter(log => log.type === 'error').length;

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" ref={dialogRef}>
            <DialogTitle>
                Report a Bug or Suggestion
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{position: 'absolute', right: 8, top: 8}}
                >
                    <CloseIcon/>
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <form onSubmit={formik.handleSubmit}>
                    <TextField
                        fullWidth
                        label="Name"
                        name="name"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.name && Boolean(formik.errors.name)}
                        helperText={formik.touched.name && formik.errors.name}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.email && Boolean(formik.errors.email)}
                        helperText={formik.touched.email && formik.errors.email}
                        margin="normal"

                    />
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Description"
                        name="description"
                        value={formik.values.description}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.description && Boolean(formik.errors.description)}
                        helperText={formik.touched.description && formik.errors.description}
                        placeholder="Describe the issue or suggestion in detail..."
                        margin="normal"
                    />

                    {/* Секция для скриншотов */}
                    <Typography variant="body2" color="text.secondary" sx={{mt: 2, mb: 1}}>
                        Screenshot (optional)
                    </Typography>

                    <Stack direction="row" spacing={1} sx={{mb: 2}}>
                        <Tooltip title="Take screenshot of entire page (dialog will close temporarily)">
                            <Button
                                variant="outlined"
                                startIcon={isTakingScreenshot ? <CircularProgress size={18}/> : <ScreenshotIcon/>}
                                onClick={takeScreenshot}
                                disabled={isTakingScreenshot || formik.isSubmitting}
                            >
                                Take Screenshot
                            </Button>
                        </Tooltip>

                        {!previewUrl && (
                            <>
                                <input
                                    accept="image/*"
                                    style={{display: 'none'}}
                                    id="screenshot-upload"
                                    type="file"
                                    onChange={handleScreenshotUpload}
                                />
                                <label htmlFor="screenshot-upload">
                                    <Button
                                        variant="outlined"
                                        component="span"
                                        startIcon={<CameraAltIcon/>}
                                        disabled={formik.isSubmitting}
                                    >
                                        Upload Screenshot
                                    </Button>
                                </label>
                            </>
                        )}
                    </Stack>

                    {previewUrl && (
                        <Box sx={{position: 'relative', display: 'inline-block', mb: 2}}>
                            <Box
                                component="img"
                                src={previewUrl}
                                alt="Screenshot preview"
                                sx={{
                                    display: 'block',
                                    maxWidth: '100%',
                                    maxHeight: 200,
                                    borderRadius: 1,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                }}
                            />
                            <IconButton
                                size="small"
                                onClick={handleRemoveScreenshot}
                                sx={{
                                    position: 'absolute',
                                    top: 6,
                                    right: 6,
                                    bgcolor: 'rgba(0,0,0,0.55)',
                                    color: '#fff',
                                    '&:hover': {bgcolor: 'rgba(0,0,0,0.75)'},
                                }}
                            >
                                <DeleteIcon fontSize="small"/>
                            </IconButton>
                        </Box>
                    )}

                    {/* Секция логов консоли */}
                    <Box sx={{mt: 2}}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="includeLogs"
                                    checked={formik.values.includeLogs}
                                    onChange={formik.handleChange}
                                    disabled={logs.length === 0}
                                />
                            }
                            label={
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <TerminalIcon fontSize="small"/>
                                    <Typography variant="body2">
                                        Include console logs (last 3 minutes)
                                    </Typography>
                                    {logs.length > 0 && (
                                        <Chip
                                            label={logSummary}
                                            size="small"
                                            color={errorLogsCount > 0 ? "error" : "default"}
                                            variant="outlined"
                                        />
                                    )}
                                </Stack>
                            }
                        />

                        {logs.length === 0 && (
                            <Alert severity="info" sx={{mt: 1}}>
                                No console logs available. Logs are collected from the moment you open the app.
                            </Alert>
                        )}

                        {formik.values.includeLogs && logs.length > 0 && errorLogsCount > 0 && (
                            <Alert severity="warning" sx={{mt: 1}}>
                                Found {errorLogsCount} error{errorLogsCount !== 1 ? 's' : ''} in the logs that might
                                help debug the issue.
                            </Alert>
                        )}
                    </Box>

                    {githubStatus && (
                        <Alert
                            severity={githubStatus.success ? 'success' : 'warning'}
                            sx={{mt: 2}}
                            icon={githubStatus.success ? <GitHubIcon/> : undefined}
                        >
                            {githubStatus.success ? (
                                <Box>
                                    <Typography variant="body2">
                                        ✅ GitHub issue #{githubStatus.number} created successfully!
                                    </Typography>
                                    <Link
                                        href={githubStatus.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        sx={{fontSize: '0.75rem'}}
                                    >
                                        View on GitHub →
                                    </Link>
                                </Box>
                            ) : (
                                <Typography variant="body2">
                                    ⚠️ GitHub integration failed: {githubStatus.error}
                                    <br/>
                                    <small>Email notification was sent as backup.</small>
                                </Typography>
                            )}
                        </Alert>
                    )}

                    <DialogActions sx={{px: 0, pt: 3}}>
                        <Button
                            onClick={onClose}
                            color="error"
                            disabled={formik.isSubmitting || isTakingScreenshot}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            color="primary"
                            variant="contained"
                            disabled={formik.isSubmitting || isTakingScreenshot}
                            startIcon={formik.isSubmitting ? <CircularProgress size={18} color="inherit"/> : null}
                        >
                            Submit Report
                        </Button>
                    </DialogActions>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default FeedbackDialog;