import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Button,
    CircularProgress,
    Paper,
    Stack,
    Typography
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import { profileApi } from 'src/api/profile';

const PRICE_TYPE_SUFFIX = {
    fixed: '',
    hourly: '/hr',
    daily: '/day',
    weekly: '/week',
    sqm: '/sq.ft.'
};

const humanizeText = (value) => {
    if (!value) {
        return '';
    }

    return String(value)
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatPrice = (service) => {
    const suffix = PRICE_TYPE_SUFFIX[service?.priceType] || '';

    const formatValue = (value) => {
        if (value === undefined || value === null || value === '') {
            return null;
        }
        if (typeof value === 'number' && Number.isFinite(value)) {
            return `$${value.toLocaleString()}`;
        }
        const str = String(value).trim();
        if (!str) {
            return null;
        }
        return str.startsWith('$') ? str : `$${str}`;
    };

    const priceFrom = formatValue(service?.priceFrom ?? service?.priceMin);
    const priceTo = formatValue(service?.priceTo ?? service?.priceMax);

    if (priceFrom && priceTo) {
        return `${priceFrom} – ${priceTo}${suffix}`;
    }

    const singleValue =
        formatValue(service?.price) ||
        formatValue(service?.priceLabel) ||
        formatValue(service?.priceRange) ||
        (typeof service?.priceRangeLabel === 'string' ? service.priceRangeLabel : null);

    if (singleValue) {
        return `${singleValue}${suffix}`;
    }

    if (service?.priceDescription) {
        return service.priceDescription;
    }

    return 'Quote';
};

const ServicesSection = ({
    profile,
    dictionarySpecialties,
    dictionaryServices,
    onRequest,
    onAvailabilityChange
}) => {
    const [loading, setLoading] = useState(true);
    const [services, setServices] = useState([]);
    const [expanded, setExpanded] = useState(false);

    const userId = profile?.profile?.id || profile?.profile?.userId || null;
    const specialtiesList = useMemo(
        () => (Array.isArray(profile?.specialties) ? profile.specialties : []),
        [profile?.specialties]
    );
    const profileLevelServices = useMemo(
        () => (Array.isArray(profile?.services) ? profile.services : []),
        [profile?.services]
    );
    const embeddedServices = useMemo(
        () => (Array.isArray(profile?.profile?.services) ? profile.profile.services : []),
        [profile?.profile?.services]
    );

    const specialtiesDictionary = dictionarySpecialties?.byId || {};
    const servicesDictionary = dictionaryServices?.byId || {};

    useEffect(() => {
        if (!userId) {
            setServices([]);
            setLoading(false);
            onAvailabilityChange?.(false);
            return;
        }

        let active = true;

        const loadServices = async () => {
            setLoading(true);
            onAvailabilityChange?.(false);

            try {
                const [userServices] = await Promise.all([
                    profileApi.getUserServices(userId).catch(() => [])
                ]);

                const aggregated = new Map();
                const specialtyLabelLookup = {};

                const addServiceToMap = (service, fallbackSpecialtyId, fallbackSpecialtyLabel) => {
                    if (!service) {
                        return;
                    }

                    const specialtyId = service.specialtyId || service.specialty || fallbackSpecialtyId;
                    if (!specialtyId) {
                        return;
                    }

                    const serviceId =
                        service.serviceId ||
                        service.service ||
                        service.id ||
                        service.name ||
                        service.label ||
                        `${specialtyId}-${Math.random().toString(36).slice(2, 8)}`;

                    const dictionaryItem = servicesDictionary[serviceId];
                    const label =
                        service.label ||
                        service.name ||
                        dictionaryItem?.label ||
                        humanizeText(serviceId);

                    if (!label) {
                        return;
                    }

                    const key = `${specialtyId}__${serviceId}`.toLowerCase();

                    const specialtyLabel =
                        fallbackSpecialtyLabel ||
                        specialtyLabelLookup[specialtyId] ||
                        service.specialtyLabel ||
                        specialtiesDictionary[specialtyId]?.label ||
                        humanizeText(specialtyId);

                    const description =
                        service.description ||
                        dictionaryItem?.description ||
                        '';

                    aggregated.set(key, {
                        id: key,
                        label,
                        description,
                        price: formatPrice(service),
                        specialtyId,
                        specialtyLabel
                    });
                };

                specialtiesList.forEach((spec) => {
                    if (!spec) {
                        return;
                    }

                    const specialtyId = spec.specialty || spec.id;
                    if (!specialtyId) {
                        return;
                    }

                    const specialtyLabel =
                        spec.label ||
                        specialtiesDictionary[specialtyId]?.label ||
                        humanizeText(specialtyId);

                    specialtyLabelLookup[specialtyId] = specialtyLabel;

                    if (Array.isArray(spec.services)) {
                        spec.services.forEach((service) => {
                            addServiceToMap(service, specialtyId, specialtyLabel);
                        });
                    }
                });

                (userServices || []).forEach((service) => addServiceToMap(service));
                (profileLevelServices || []).forEach((service) => addServiceToMap(service));
                (embeddedServices || []).forEach((service) => addServiceToMap(service));

                const normalized = Array.from(aggregated.values())
                    .filter((item) => item && item.label)
                    .sort((a, b) => {
                        if (a.specialtyLabel !== b.specialtyLabel) {
                            return a.specialtyLabel.localeCompare(b.specialtyLabel);
                        }
                        return a.label.localeCompare(b.label);
                    });

                if (active) {
                    setServices(normalized);
                    setExpanded(false);
                    onAvailabilityChange?.(normalized.length > 0);
                }
            } catch (error) {
                console.error(error);
                if (active) {
                    setServices([]);
                    onAvailabilityChange?.(false);
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        loadServices();

        return () => {
            active = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        userId,
        specialtiesList,
        profileLevelServices,
        embeddedServices,
        dictionarySpecialties,
        dictionaryServices,
        onAvailabilityChange
    ]);

    const visibleServices = useMemo(
        () => (expanded ? services : services.slice(0, 6)),
        [services, expanded]
    );

    const hasServices = services.length > 0;

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                p: { xs: 3, md: 4 }
            }}
        >
            <Stack spacing={3}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <DesignServicesIcon color="primary" />
                    <Typography variant="h6" fontWeight={700}>
                        Services
                    </Typography>
                </Stack>

                {loading ? (
                    <Stack alignItems="center" spacing={2} py={6}>
                        <CircularProgress size={28} />
                        <Typography variant="body2" color="text.secondary">
                            Loading services…
                        </Typography>
                    </Stack>
                ) : hasServices ? (
                    <>
                        <Box
                            sx={{
                                display: 'grid',
                                gap: 2,
                                gridTemplateColumns: {
                                    xs: 'repeat(1, minmax(0, 1fr))',
                                    sm: 'repeat(2, minmax(0, 1fr))',
                                    lg: 'repeat(3, minmax(0, 1fr))'
                                }
                            }}
                        >
                            {visibleServices.map((service) => (
                                <Box
                                    key={service.id}
                                    sx={{
                                        height: '100%',
                                        borderRadius: 3,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.02),
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        p: 2.5,
                                        '&:hover': {
                                            borderColor: 'primary.main',
                                            boxShadow: (theme) => theme.shadows[2]
                                        }
                                    }}
                                >
                                    <Stack spacing={1.25} flexGrow={1}>
                                        <Stack spacing={0.5}>
                                            <Typography variant="subtitle2" fontWeight={600}>
                                                {service.label}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {service.specialtyLabel}
                                            </Typography>
                                            {service.description && (
                                                <Typography variant="body2" color="text.secondary">
                                                    {service.description}
                                                </Typography>
                                            )}
                                        </Stack>

                                        <Stack
                                            direction="row"
                                            justifyContent="space-between"
                                            alignItems="center"
                                            mt="auto"
                                            spacing={1}
                                        >
                                            <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                                                {service.price}
                                            </Typography>

                                            <Button
                                                size="small"
                                                variant="outlined"
                                                startIcon={<RequestQuoteIcon />}
                                                onClick={() => service.specialtyId && onRequest(service.specialtyId)}
                                                disabled={!service.specialtyId}
                                                sx={{ textTransform: 'none' }}
                                            >
                                                Request
                                            </Button>
                                        </Stack>
                                    </Stack>
                                </Box>
                            ))}
                        </Box>

                        {services.length > 6 && (
                            <Box display="flex" justifyContent="flex-end">
                                <Button
                                    size="small"
                                    variant="text"
                                    onClick={() => setExpanded((prev) => !prev)}
                                    sx={{ textTransform: 'none' }}
                                >
                                    {expanded ? 'Show fewer services' : 'View all services'}
                                </Button>
                            </Box>
                        )}
                    </>
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        No services added.
                    </Typography>
                )}
            </Stack>
        </Paper>
    );
};

ServicesSection.propTypes = {
    profile: PropTypes.object,
    dictionarySpecialties: PropTypes.shape({
        byId: PropTypes.object
    }),
    dictionaryServices: PropTypes.shape({
        byId: PropTypes.object
    }),
    onRequest: PropTypes.func.isRequired,
    onAvailabilityChange: PropTypes.func
};

ServicesSection.defaultProps = {
    profile: null,
    dictionarySpecialties: null,
    dictionaryServices: null,
    onAvailabilityChange: undefined
};

export default ServicesSection;