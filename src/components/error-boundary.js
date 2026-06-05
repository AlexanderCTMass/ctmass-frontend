import { Component } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Container, Stack, Typography } from '@mui/material';

const isChunkLoadError = (error) => {
    if (!error) {
        return false;
    }
    const message = error.message || '';
    return (
        error.name === 'ChunkLoadError' ||
        /Loading chunk [\d]+ failed/i.test(message) ||
        /Loading CSS chunk/i.test(message) ||
        /Failed to fetch dynamically imported module/i.test(message) ||
        /error loading dynamically imported module/i.test(message)
    );
};

const RELOAD_FLAG = 'chunk-reload-attempted';

export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error) {
        if (isChunkLoadError(error) && !window.sessionStorage.getItem(RELOAD_FLAG)) {
            window.sessionStorage.setItem(RELOAD_FLAG, '1');
            window.location.reload();
        }
        console.error('ErrorBoundary caught an error:', error);
    }

    handleReload = () => {
        window.sessionStorage.removeItem(RELOAD_FLAG);
        window.location.reload();
    };

    render() {
        if (!this.state.hasError) {
            return this.props.children;
        }

        if (isChunkLoadError(this.state.error)) {
            return null;
        }

        return (
            <Box
                component="main"
                sx={{
                    alignItems: 'center',
                    display: 'flex',
                    flexGrow: 1,
                    minHeight: '100vh',
                    py: '80px'
                }}
            >
                <Container maxWidth="md">
                    <Stack spacing={3} alignItems="center" textAlign="center">
                        <Typography variant="h4">Something went wrong</Typography>
                        <Typography color="text.secondary">
                            The page could not be loaded. Please try again.
                        </Typography>
                        <Button variant="contained" onClick={this.handleReload}>
                            Reload page
                        </Button>
                    </Stack>
                </Container>
            </Box>
        );
    }
}

ErrorBoundary.propTypes = {
    children: PropTypes.node
};
