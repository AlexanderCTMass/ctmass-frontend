import { Box, Chip, Skeleton, Stack, Typography } from '@mui/material';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import HandymanOutlinedIcon from '@mui/icons-material/HandymanOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import { StatusPill, Surface, SurfaceHeader } from 'src/components/ctmass-ui';
import {
    PRICE_DISCLAIMER,
    businessRoleLabel,
    businessStructureLabel,
    crewSizeLabel,
    paymentMethodLabel,
    responseShortLabel,
    tierBadgeLabel,
    tierFor
} from 'src/constants/trade-options';
import { useUserTradesQuery } from 'src/queries/use-trades';
import { BRAND, RADIUS } from 'src/theme/ctmass-tokens';
import { readBusiness, yearsInBusiness } from 'src/utils/business-profile';
import {
    availabilityLine,
    hasListedRate,
    priceLine,
    priceSubline,
    servicesPreview,
    trustItems
} from 'src/utils/trade-display';

const factSx = { fontSize: 14, color: BRAND.muted, lineHeight: 1.5, minWidth: 0, overflowWrap: 'anywhere' };

function TradeTile({ trade }) {
    const details = trade.details;
    const years = details?.experienceYears ?? null;
    const tier = years === null ? null : tierFor(years);
    const services = servicesPreview(details?.services ?? [], 6);
    const trust = details ? trustItems(details) : [];
    const schedule = details ? availabilityLine(details.availability) : '';
    const response = details ? responseShortLabel(details.responseTime) : '';
    const subPrice = details ? priceSubline(details.rates) : '';
    const listed = details ? hasListedRate(details.rates) : false;
    const label = trade.primarySpecialtyLabel || trade.subtitle || 'Trade';

    return (
        <Box
            sx={{
                p: { xs: 2, md: 2.5 },
                borderRadius: RADIUS.inner,
                border: '1px solid',
                borderColor: 'divider',
                minWidth: 0
            }}
        >
            <Stack spacing={1.25}>
                <Stack direction="row" spacing={1} alignItems="flex-start" justifyContent="space-between" sx={{ minWidth: 0 }}>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography noWrap title={trade.title} sx={{ fontWeight: 800, fontSize: 16, color: BRAND.ink }}>
                            {trade.title || label}
                        </Typography>
                        <Typography noWrap title={label} sx={{ fontSize: 13.5, fontWeight: 600, color: BRAND.muted }}>
                            {label}
                        </Typography>
                    </Box>
                    {tier ? (
                        <Box
                            component="span"
                            sx={{
                                flexShrink: 0,
                                px: 1.1,
                                py: 0.4,
                                borderRadius: RADIUS.pill,
                                bgcolor: tier.color,
                                color: '#04170D',
                                fontSize: 11,
                                fontWeight: 900,
                                letterSpacing: '0.04em',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {tierBadgeLabel(years)}
                        </Box>
                    ) : null}
                </Stack>

                <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: 15, color: listed ? BRAND.ink : BRAND.muted }}>
                        {priceLine(details?.rates ?? null)}
                    </Typography>
                    {subPrice ? <Typography sx={factSx}>{subPrice}</Typography> : null}
                </Box>

                {services.shown.length > 0 ? (
                    <Stack direction="row" flexWrap="wrap" sx={{ gap: 0.75 }}>
                        {services.shown.map((service) => (
                            <Chip key={service} label={service} size="small" sx={{ maxWidth: '100%' }} />
                        ))}
                        {services.more > 0 ? <Chip label={`+${services.more}`} size="small" /> : null}
                    </Stack>
                ) : null}

                {trust.length > 0 ? (
                    <Stack direction="row" flexWrap="wrap" sx={{ gap: 0.75 }}>
                        {trust.map((item) => (
                            <StatusPill key={item.key} icon={<ShieldOutlinedIcon />}>{item.label}</StatusPill>
                        ))}
                    </Stack>
                ) : null}

                {schedule ? <Typography sx={factSx}>{schedule}</Typography> : null}
                {response ? <Typography sx={factSx}>{`${response} (set by contractor)`}</Typography> : null}
                {details?.radiusMiles ? <Typography sx={factSx}>{`Serves within ${details.radiusMiles} mi`}</Typography> : null}
            </Stack>
        </Box>
    );
}

export function SpecialistTradesSection({ profile }) {
    const ownerId = profile?.id;
    const { data: trades = [], isLoading } = useUserTradesQuery(ownerId);
    const visible = trades.filter((trade) => trade.status !== 'rejected');

    if (!isLoading && visible.length === 0) {
        return null;
    }

    return (
        <Surface sx={{ mt: 3 }}>
            <SurfaceHeader
                icon={<HandymanOutlinedIcon />}
                title="Trades"
                subtitle="Experience, pricing and availability are set separately for each trade."
            />
            {isLoading ? (
                <Skeleton variant="rounded" height={180} sx={{ borderRadius: RADIUS.inner }} />
            ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
                    {visible.map((trade) => (
                        <TradeTile key={trade.id} trade={trade} />
                    ))}
                </Box>
            )}
            <Typography sx={{ mt: 2, fontSize: 12.5, color: BRAND.muted }}>
                {PRICE_DISCLAIMER} Licenses and insurance are provided by the contractor and are not verified by CTMASS.
            </Typography>
        </Surface>
    );
}

export function SpecialistBusinessSection({ profile }) {
    const business = readBusiness(profile || {});
    const years = yearsInBusiness(business);
    const rows = [
        ['Company', profile?.businessName || ''],
        ['Role', businessRoleLabel(business.role)],
        ['Business structure', businessStructureLabel(business.structure)],
        ['Crew size', business.crewSize
            ? `${crewSizeLabel(business.crewSize)}${business.usesSubcontractors ? ', uses subcontractors' : ''}`
            : ''],
        ['Years in business', years !== null ? String(years) : ''],
        ['Languages', business.languages.join(', ')],
        ['Payment methods', business.paymentMethods.map(paymentMethodLabel).join(', ')],
        ['Website', business.website.replace(/^https?:\/\//i, '').replace(/\/$/, '')]
    ].filter(([, value]) => value);

    if (rows.length === 0) {
        return null;
    }

    return (
        <Surface sx={{ mt: 3 }}>
            <SurfaceHeader icon={<BusinessOutlinedIcon />} title="Business" />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
                {rows.map(([label, value]) => (
                    <Box key={label} sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: BRAND.muted }}>{label}</Typography>
                        {label === 'Website' ? (
                            <Typography
                                component="a"
                                href={business.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ fontSize: 15, fontWeight: 600, color: BRAND.green, overflowWrap: 'anywhere' }}
                            >
                                {value}
                            </Typography>
                        ) : (
                            <Typography sx={{ fontSize: 15, fontWeight: 600, color: BRAND.ink, overflowWrap: 'anywhere' }}>{value}</Typography>
                        )}
                    </Box>
                ))}
            </Box>
        </Surface>
    );
}
