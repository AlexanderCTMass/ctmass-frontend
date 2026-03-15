export const logger = {
    info: (message, data = {}) => {
        console.log(JSON.stringify({ level: 'info', message, ...data, timestamp: new Date().toISOString() }));
    },
    error: (message, error, data = {}) => {
        console.error(JSON.stringify({
            level: 'error',
            message,
            error: error.message,
            stack: error.stack,
            ...data,
            timestamp: new Date().toISOString()
        }));
    }
};