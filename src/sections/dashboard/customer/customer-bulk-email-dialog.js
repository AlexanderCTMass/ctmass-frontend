import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Alert,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    LinearProgress,
    Stack,
    Typography
} from '@mui/material';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import { customersApi } from 'src/api/customers';
import { EmailSenderFeatureToggles } from 'src/featureToggles/EmailSenderFeatureToggles';
import { useAuth } from 'src/hooks/use-auth';
import { emailSender, isEmailOptedOut } from 'src/libs/email-sender';
import { isValidEmail } from 'src/utils/is-valid-email';
import { AdminEmailComposer, EMPTY_EMAIL_DRAFT, isEmailDraftReady } from './admin-email-composer';

const PACE_MS = 1100;
const SIMULATED_PACE_MS = 120;
const MAX_FAILURES_IN_A_ROW = 5;

const PHASE = {
    COMPOSE: 'compose',
    CONFIRM: 'confirm',
    SENDING: 'sending',
    DONE: 'done'
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const splitRecipients = (recipients) => {
    const eligible = [];
    const noEmail = [];
    const optedOut = [];
    recipients.forEach((customer) => {
        if (!customer.email || !isValidEmail(customer.email)) {
            noEmail.push(customer);
        } else if (isEmailOptedOut(customer)) {
            optedOut.push(customer);
        } else {
            eligible.push(customer);
        }
    });
    return { eligible, noEmail, optedOut };
};

const describeEntry = (draft, count) => {
    const images = draft.images.length
        ? ` (+${draft.images.length} image${draft.images.length > 1 ? 's' : ''})`
        : '';
    return `Group email to ${count} users: ${draft.subject.trim()}${images}`;
};

export const CustomerBulkEmailDialog = (props) => {
    const { open, onClose, recipients } = props;
    const { user } = useAuth();
    const [phase, setPhase] = useState(PHASE.COMPOSE);
    const [draft, setDraft] = useState(EMPTY_EMAIL_DRAFT);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState({ done: 0, total: 0 });
    const [results, setResults] = useState({ sent: [], failed: [] });
    const [stopped, setStopped] = useState(false);
    const [autoStopped, setAutoStopped] = useState(false);
    const [notAttempted, setNotAttempted] = useState([]);
    const stopRef = useRef(false);

    const simulated = !EmailSenderFeatureToggles.sendRealEmail;
    const { eligible, noEmail, optedOut } = useMemo(() => splitRecipients(recipients), [recipients]);
    const canSend = eligible.length > 0 && !uploading && isEmailDraftReady(draft);

    const runSend = useCallback(async (targets) => {
        stopRef.current = false;
        setStopped(false);
        setAutoStopped(false);
        setNotAttempted([]);
        let attempted = 0;
        let failuresInARow = 0;
        let tooManyFailures = false;
        setPhase(PHASE.SENDING);
        setProgress({ done: 0, total: targets.length });
        const sent = [];
        const failed = [];
        const subject = draft.subject.trim();
        const message = draft.message.trim();
        const entry = {
            description: describeEntry(draft, targets.length),
            createdAt: new Date().getTime(),
            sentBy: user?.email || null
        };

        for (let index = 0; index < targets.length; index += 1) {
            if (stopRef.current) break;
            const customer = targets[index];
            attempted = index + 1;
            try {
                await emailSender.sendAdminDirectMessage(customer, subject, message, draft.images);
                sent.push(customer);
                failuresInARow = 0;
                if (!simulated) {
                    customersApi.addEmail(customer.id, entry).catch((err) => console.error(err));
                }
            } catch (err) {
                failed.push({ customer, error: err?.text || err?.message || 'Failed to send' });
                failuresInARow += 1;
                if (failuresInARow >= MAX_FAILURES_IN_A_ROW) {
                    tooManyFailures = true;
                    stopRef.current = true;
                }
            }
            setProgress({ done: index + 1, total: targets.length });
            setResults({ sent: [...sent], failed: [...failed] });
            if (index < targets.length - 1 && !stopRef.current) {
                await wait(simulated ? SIMULATED_PACE_MS : PACE_MS);
            }
        }

        setStopped(stopRef.current);
        setAutoStopped(tooManyFailures);
        setNotAttempted(targets.slice(attempted));
        setPhase(PHASE.DONE);
    }, [draft, simulated, user]);

    useEffect(() => {
        if (phase !== PHASE.SENDING) return undefined;
        const warn = (event) => {
            event.preventDefault();
            event.returnValue = '';
        };
        window.addEventListener('beforeunload', warn);
        return () => window.removeEventListener('beforeunload', warn);
    }, [phase]);

    const handleStop = useCallback(() => {
        stopRef.current = true;
    }, []);

    const remaining = useMemo(
        () => [...results.failed.map((item) => item.customer), ...notAttempted],
        [results, notAttempted]
    );

    const handleClose = useCallback(() => {
        if (phase === PHASE.SENDING) return;
        const finished = phase === PHASE.DONE;
        setPhase(PHASE.COMPOSE);
        setProgress({ done: 0, total: 0 });
        setResults({ sent: [], failed: [] });
        setNotAttempted([]);
        if (finished && remaining.length === 0) {
            setDraft(EMPTY_EMAIL_DRAFT);
        }
        onClose(finished ? { remaining } : null);
    }, [phase, remaining, onClose]);

    const handleSendRemaining = useCallback(() => {
        runSend(remaining);
    }, [remaining, runSend]);

    const percent = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;

    return (
        <Dialog
            disableScrollLock
            fullWidth
            maxWidth="md"
            onClose={handleClose}
            open={open}
        >
            <DialogTitle>
                <Stack
                    alignItems="center"
                    direction="row"
                    spacing={1}
                >
                    <MailOutlineIcon color="primary" />
                    <Typography variant="h6">
                        Group email
                    </Typography>
                    <Chip
                        label={`${eligible.length} recipient${eligible.length === 1 ? '' : 's'}`}
                        size="small"
                    />
                </Stack>
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ pt: 2.5 }}>
                {(phase === PHASE.COMPOSE || phase === PHASE.CONFIRM) && (
                    <Stack spacing={2}>
                        {simulated && (
                            <Alert severity="info">
                                Real emails are sent only in production. Here sending is simulated and not recorded.
                            </Alert>
                        )}
                        {(noEmail.length > 0 || optedOut.length > 0) && (
                            <Alert severity="warning">
                                {noEmail.length > 0 && (
                                    <div>
                                        {noEmail.length} selected user{noEmail.length === 1 ? ' has' : 's have'} no valid email and will be skipped.
                                    </div>
                                )}
                                {optedOut.length > 0 && (
                                    <div>
                                        {optedOut.length} selected user{optedOut.length === 1 ? ' has' : 's have'} turned off email notifications and will be skipped.
                                    </div>
                                )}
                            </Alert>
                        )}
                        <Typography
                            color="text.secondary"
                            variant="body2"
                        >
                            Each person gets a separate email that starts with &quot;Hi {'{name}'},&quot;. Recipients don&apos;t see each other.
                        </Typography>
                        <AdminEmailComposer
                            disabled={phase === PHASE.CONFIRM}
                            onChange={setDraft}
                            onUploadingChange={setUploading}
                            value={draft}
                        />
                        <Box>
                            <Typography
                                color="text.secondary"
                                sx={{ mb: 0.5 }}
                                variant="caption"
                                component="div"
                            >
                                Recipients
                            </Typography>
                            <Typography
                                sx={{ maxHeight: 72, overflowY: 'auto', wordBreak: 'break-word' }}
                                variant="body2"
                            >
                                {eligible.map((customer) => customer.email).join(', ') || '—'}
                            </Typography>
                        </Box>
                        {phase === PHASE.CONFIRM && (
                            <Alert severity="warning">
                                You are about to email {eligible.length} user{eligible.length === 1 ? '' : 's'}. This can&apos;t be undone.
                                Sending takes about {Math.max(1, Math.ceil((eligible.length * PACE_MS) / 60000))} min, keep this tab open.
                            </Alert>
                        )}
                    </Stack>
                )}

                {phase === PHASE.SENDING && (
                    <Stack
                        spacing={2}
                        sx={{ py: 3 }}
                    >
                        <Typography variant="subtitle1">
                            Sending {progress.done} of {progress.total}…
                        </Typography>
                        <LinearProgress
                            value={percent}
                            variant="determinate"
                        />
                        <Typography
                            color="text.secondary"
                            variant="body2"
                        >
                            Sent: {results.sent.length} · Failed: {results.failed.length}. Keep this tab open until it finishes.
                        </Typography>
                    </Stack>
                )}

                {phase === PHASE.DONE && (
                    <Stack
                        spacing={2}
                        sx={{ py: 1 }}
                    >
                        {autoStopped && (
                            <Alert severity="error">
                                Sending stopped after {MAX_FAILURES_IN_A_ROW} failures in a row. The EmailJS monthly quota may be used up, check the EmailJS dashboard before retrying.
                            </Alert>
                        )}
                        <Alert severity={results.failed.length ? 'warning' : 'success'}>
                            {stopped ? 'Stopped. ' : ''}
                            {simulated ? 'Simulated: ' : ''}
                            {results.sent.length} sent, {results.failed.length} failed
                            {notAttempted.length ? `, ${notAttempted.length} not sent yet` : ''}.
                        </Alert>
                        {results.failed.length > 0 && (
                            <Box>
                                <Typography
                                    sx={{ mb: 1 }}
                                    variant="subtitle2"
                                >
                                    Failed
                                </Typography>
                                <Stack
                                    divider={<Divider flexItem />}
                                    sx={{ maxHeight: 240, overflowY: 'auto' }}
                                >
                                    {results.failed.map(({ customer, error }) => (
                                        <Stack
                                            direction={{ xs: 'column', sm: 'row' }}
                                            justifyContent="space-between"
                                            key={customer.id}
                                            spacing={{ xs: 0, sm: 2 }}
                                            sx={{ py: 0.75 }}
                                        >
                                            <Typography variant="body2">
                                                {customer.email}
                                            </Typography>
                                            <Typography
                                                color="error"
                                                variant="caption"
                                            >
                                                {error}
                                            </Typography>
                                        </Stack>
                                    ))}
                                </Stack>
                            </Box>
                        )}
                    </Stack>
                )}
            </DialogContent>
            <Divider />
            <DialogActions>
                {phase === PHASE.COMPOSE && (
                    <>
                        <Button onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button
                            disabled={!canSend}
                            onClick={() => setPhase(PHASE.CONFIRM)}
                            variant="contained"
                        >
                            Send to {eligible.length} user{eligible.length === 1 ? '' : 's'}
                        </Button>
                    </>
                )}
                {phase === PHASE.CONFIRM && (
                    <>
                        <Button onClick={() => setPhase(PHASE.COMPOSE)}>
                            Back
                        </Button>
                        <Button
                            onClick={() => runSend(eligible)}
                            variant="contained"
                        >
                            Yes, send now
                        </Button>
                    </>
                )}
                {phase === PHASE.SENDING && (
                    <Button
                        color="error"
                        onClick={handleStop}
                    >
                        Stop
                    </Button>
                )}
                {phase === PHASE.DONE && (
                    <>
                        {remaining.length > 0 && (
                            <Button onClick={handleSendRemaining}>
                                Send remaining ({remaining.length})
                            </Button>
                        )}
                        <Button
                            onClick={handleClose}
                            variant="contained"
                        >
                            Close
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
};

CustomerBulkEmailDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    recipients: PropTypes.array.isRequired
};
