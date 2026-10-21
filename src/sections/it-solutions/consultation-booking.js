import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Alert,
    Box,
    Button,
    Card,
    Chip,
    CircularProgress,
    Divider,
    Stack,
    TextField,
    Typography,
    Unstable_Grid2 as Grid
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CheckIcon from '@mui/icons-material/Check';
import VideocamIcon from '@mui/icons-material/Videocam';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { alpha } from '@mui/material/styles';
import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import { SHOP_CATEGORIES } from 'src/api/paid-features';
import { CALENDLY_URL, buildProjectDetails, sendServiceInquiry } from 'src/api/it-inquiry';
import { useAuth } from 'src/hooks/use-auth';
import { usePaidFeaturesConfig } from 'src/hooks/use-paid-features-config';
import { useSearchParams } from 'src/hooks/use-search-params';

export const BOOKING_SECTION_ID = 'book-consultation';

const CALENDLY_SCRIPT_SRC = 'https://assets.calendly.com/assets/external/widget.js';
const CALENDLY_HEIGHT = { xs: 860, md: 720 };

const STEP = {
    FORM: 'form',
    CALENDAR: 'calendar',
    BOOKED: 'booked'
};

const PERKS = [
    { icon: <ScheduleIcon fontSize="small" />, label: '30 minutes, free' },
    { icon: <VideocamIcon fontSize="small" />, label: 'Google Meet call' },
    { icon: <CalendarMonthIcon fontSize="small" />, label: 'Daily, 2 – 3 PM ET' }
];

let calendlyScriptPromise = null;

const loadCalendlyScript = () => {
    if (window.Calendly) return Promise.resolve();
    if (calendlyScriptPromise) return calendlyScriptPromise;
    calendlyScriptPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = CALENDLY_SCRIPT_SRC;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => {
            calendlyScriptPromise = null;
            reject(new Error('Calendly failed to load'));
        };
        document.body.appendChild(script);
    });
    return calendlyScriptPromise;
};

const CalendlyInline = ({ prefill, source, onScheduled }) => {
    const containerRef = useRef(null);
    const [status, setStatus] = useState('loading');

    useEffect(() => {
        let cancelled = false;
        loadCalendlyScript()
            .then(() => {
                if (cancelled || !containerRef.current || !window.Calendly) return;
                containerRef.current.innerHTML = '';
                window.Calendly.initInlineWidget({
                    url: `${CALENDLY_URL}?hide_gdpr_banner=1&hide_event_type_details=1`,
                    parentElement: containerRef.current,
                    prefill: {
                        name: prefill.name,
                        email: prefill.email,
                        customAnswers: prefill.details ? { a1: prefill.details.slice(0, 1500) } : undefined
                    },
                    utm: {
                        utmSource: 'ctmass-web',
                        utmMedium: source,
                        utmCampaign: 'it-consultation'
                    }
                });
                setStatus('ready');
            })
            .catch(() => {
                if (!cancelled) setStatus('error');
            });
        return () => {
            cancelled = true;
        };
    }, [prefill, source]);

    useEffect(() => {
        const handleMessage = (event) => {
            if (event.origin !== 'https://calendly.com') return;
            if (event.data?.event === 'calendly.event_scheduled') onScheduled();
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [onScheduled]);

    if (status === 'error') {
        return (
            <Alert severity="warning">
                We couldn&apos;t load the calendar. We already have your request and will reach out by email, or you can
                {' '}
                <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">open the booking page</a>.
            </Alert>
        );
    }

    return (
        <Box sx={{ position: 'relative', width: '100%' }}>
            {status === 'loading' && (
                <Stack alignItems="center" justifyContent="center" sx={{ position: 'absolute', inset: 0 }}>
                    <CircularProgress />
                </Stack>
            )}
            <Box
                ref={containerRef}
                sx={{
                    minWidth: 300,
                    height: CALENDLY_HEIGHT,
                    '& iframe': { display: 'block', width: '100%', height: '100%', border: 0 }
                }}
            />
        </Box>
    );
};

export const ConsultationBooking = () => {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const location = useLocation();
    const sectionRef = useRef(null);
    const { features } = usePaidFeaturesConfig();
    const [selected, setSelected] = useState([]);
    const [step, setStep] = useState(STEP.FORM);
    const [sending, setSending] = useState(false);
    const [prefill, setPrefill] = useState(null);
    const [error, setError] = useState(null);

    const source = searchParams.get('from') === 'shop' ? 'web-shop' : 'web';
    const presetService = searchParams.get('service');

    const services = useMemo(
        () => features
            .filter((feature) => feature.category === SHOP_CATEGORIES.IT_SERVICES)
            .map((feature) => feature.displayName)
            .filter(Boolean),
        [features]
    );

    useEffect(() => {
        if (!presetService) return;
        setSelected((prev) => (prev.includes(presetService) ? prev : [...prev, presetService]));
    }, [presetService]);

    const scrollToSection = useCallback(() => {
        sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, []);

    useEffect(() => {
        if (location.hash !== `#${BOOKING_SECTION_ID}`) return undefined;
        const timer = setTimeout(scrollToSection, 150);
        return () => clearTimeout(timer);
    }, [location.hash, location.search, scrollToSection]);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: user?.name || user?.displayName || '',
            email: user?.email || '',
            message: ''
        },
        validationSchema: Yup.object().shape({
            name: Yup.string().trim().required('Name is required'),
            email: Yup.string().trim().email('Enter a valid email').required('Email is required'),
            message: Yup.string()
        }),
        onSubmit: () => {}
    });

    const toggleService = (service) => {
        setSelected((prev) => (prev.includes(service)
            ? prev.filter((item) => item !== service)
            : [...prev, service]));
    };

    const validate = async () => {
        formik.setTouched({ name: true, email: true, message: true });
        const errors = await formik.validateForm();
        return Object.keys(errors).length === 0;
    };

    const readValues = () => ({
        name: formik.values.name.trim(),
        email: formik.values.email.trim(),
        message: formik.values.message.trim()
    });

    const handleBook = async () => {
        if (!(await validate())) return;
        const { name, email, message } = readValues();
        setError(null);
        sendServiceInquiry({ name, email, services: selected, message, source, booking: true })
            .catch((err) => console.error('sendServiceInquiry failed', err));
        setPrefill({ name, email, details: buildProjectDetails(selected, message) });
        setStep(STEP.CALENDAR);
        setTimeout(scrollToSection, 50);
    };

    const handleEmailOnly = async () => {
        if (!(await validate())) return;
        const { name, email, message } = readValues();
        if (selected.length === 0 && !message) {
            setError('Choose a service or write a message.');
            return;
        }
        setSending(true);
        setError(null);
        try {
            await sendServiceInquiry({ name, email, services: selected, message, source });
            toast.success('Thanks! Our team will get back to you by email soon.');
            formik.resetForm();
            setSelected([]);
        } catch (err) {
            console.error('sendServiceInquiry failed', err);
            setError("We couldn't send your message right now. Please email us at support@ctmass.com.");
        } finally {
            setSending(false);
        }
    };

    const handleScheduled = useCallback(() => {
        setStep(STEP.BOOKED);
        setTimeout(scrollToSection, 50);
    }, [scrollToSection]);

    return (
        <Box ref={sectionRef} id={BOOKING_SECTION_ID} sx={{ scrollMarginTop: 80 }}>
            <Stack spacing={1.5} alignItems="center" textAlign="center" sx={{ mb: 5 }}>
                <Typography variant="h3">Book a Free IT Consultation</Typography>
                <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 760, fontWeight: 400 }}>
                    Tell us about your project and pick a time that works for you. Our team will walk through your
                    idea, scope and next steps on a 30-minute call.
                </Typography>
                <Stack direction="row" flexWrap="wrap" justifyContent="center" gap={1} sx={{ pt: 1 }}>
                    {PERKS.map((perk) => (
                        <Chip key={perk.label} icon={perk.icon} label={perk.label} variant="outlined" />
                    ))}
                </Stack>
            </Stack>

            <Card
                sx={{
                    p: step === STEP.CALENDAR ? { xs: 1.5, md: 3 } : { xs: 2.5, md: 4 },
                    borderRadius: 3,
                    overflow: 'hidden'
                }}
            >
                {step === STEP.FORM && (
                    <Stack spacing={3}>
                        {error && <Alert severity="error">{error}</Alert>}

                        {services.length > 0 && (
                            <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
                                    What do you need?
                                </Typography>
                                <Stack direction="row" flexWrap="wrap" gap={1}>
                                    {services.map((service) => {
                                        const active = selected.includes(service);
                                        return (
                                            <Chip
                                                key={service}
                                                label={service}
                                                clickable
                                                color={active ? 'primary' : 'default'}
                                                variant={active ? 'filled' : 'outlined'}
                                                icon={active ? <CheckIcon /> : undefined}
                                                onClick={() => toggleService(service)}
                                            />
                                        );
                                    })}
                                </Stack>
                            </Box>
                        )}

                        <Grid container spacing={2}>
                            <Grid xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Name"
                                    name="name"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={Boolean(formik.touched.name && formik.errors.name)}
                                    helperText={formik.touched.name && formik.errors.name}
                                />
                            </Grid>
                            <Grid xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={Boolean(formik.touched.email && formik.errors.email)}
                                    helperText={formik.touched.email && formik.errors.email}
                                />
                            </Grid>
                            <Grid xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    minRows={4}
                                    label="Tell us about your project"
                                    name="message"
                                    placeholder="Goals, scope, deadlines, reference links..."
                                    value={formik.values.message}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                            </Grid>
                        </Grid>

                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={2}
                            alignItems={{ xs: 'stretch', sm: 'center' }}
                        >
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<CalendarMonthIcon />}
                                onClick={handleBook}
                                disabled={sending}
                            >
                                Choose a Time
                            </Button>
                            <Button
                                variant="text"
                                size="large"
                                color="inherit"
                                onClick={handleEmailOnly}
                                disabled={sending}
                            >
                                {sending ? 'Sending…' : 'Just send a message instead'}
                            </Button>
                        </Stack>
                    </Stack>
                )}

                {step === STEP.CALENDAR && prefill && (
                    <Stack spacing={{ xs: 1, md: 0 }}>
                        <Box
                            sx={{
                                p: { xs: 2, md: 2.5 },
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05)
                            }}
                        >
                            <Stack
                                direction={{ xs: 'column', md: 'row' }}
                                spacing={{ xs: 2, md: 3 }}
                                alignItems={{ xs: 'flex-start', md: 'center' }}
                                divider={<Divider flexItem orientation="vertical" sx={{ display: { xs: 'none', md: 'block' } }} />}
                            >
                                <Box sx={{ flexShrink: 0 }}>
                                    <Typography variant="overline" color="primary.main" sx={{ fontWeight: 800, lineHeight: 1.6 }}>
                                        CTMASS IT Team
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                        Free IT Consultation
                                    </Typography>
                                </Box>
                                <Stack spacing={0.75} sx={{ flexShrink: 0 }}>
                                    {PERKS.map((perk) => (
                                        <Stack
                                            key={perk.label}
                                            direction="row"
                                            spacing={1}
                                            alignItems="center"
                                            sx={{ color: 'text.secondary' }}
                                        >
                                            {perk.icon}
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {perk.label}
                                            </Typography>
                                        </Stack>
                                    ))}
                                </Stack>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                        {prefill.name}
                                        <Typography component="span" variant="body2" color="text.secondary">
                                            {' · '}{prefill.email}
                                        </Typography>
                                    </Typography>
                                    {prefill.details && (
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                mt: 0.5,
                                                whiteSpace: 'pre-line',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            {prefill.details}
                                        </Typography>
                                    )}
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                        Times are shown in your local time zone.
                                    </Typography>
                                </Box>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => setStep(STEP.FORM)}
                                    sx={{ flexShrink: 0 }}
                                >
                                    Edit details
                                </Button>
                            </Stack>
                        </Box>
                        <CalendlyInline prefill={prefill} source={source} onScheduled={handleScheduled} />
                    </Stack>
                )}

                {step === STEP.BOOKED && (
                    <Stack spacing={2} alignItems="center" textAlign="center" sx={{ py: 4 }}>
                        <CheckCircleOutlineIcon sx={{ fontSize: 64, color: 'success.main' }} />
                        <Typography variant="h5">You&apos;re booked!</Typography>
                        <Typography color="text.secondary" sx={{ maxWidth: 520 }}>
                            Check your email for the calendar invite and Google Meet link. We look forward to talking
                            about your project.
                        </Typography>
                    </Stack>
                )}
            </Card>
        </Box>
    );
};
