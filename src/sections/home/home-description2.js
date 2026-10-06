import { useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { RouterLink } from 'src/components/router-link';
import { useAuth } from 'src/hooks/use-auth';
import { trackClick } from 'src/libs/analytics/behavior';
import { paths } from 'src/paths';
import { roles } from 'src/roles';
import { BRAND, RADIUS, SHADOW, displayTitleSx } from 'src/theme/ctmass-tokens';
import { HomeSection, SectionHeading } from 'src/sections/home/home-section';
import { FadeStack, SegmentedSwitch } from 'src/sections/home/segmented-switch';

const AUDIENCES = [
    {
        value: 'homeowners',
        label: 'Homeowners',
        title: 'Need work done at home?',
        lead: 'Describe the job once and hear back from local pros who actually serve your town.',
        benefits: ['Reliable local contractors', 'Genuine reviews from neighbors', 'Compare offers before you hire', 'Post projects for free'],
        image: '/assets/home/audience-homeowners.jpg',
        alt: 'Homeowner planning a renovation on a laptop while a contractor measures the wall',
        learnMore: paths.forHomeowners
    },
    {
        value: 'contractors',
        label: 'Contractors',
        title: 'Find local jobs without paying for leads',
        lead: 'List your trade, show your past work and get requests from homeowners nearby.',
        benefits: ['Advertise your services free', 'A portfolio clients trust', 'Projects matched to your trade', 'Connect with other pros'],
        image: '/assets/home/audience-contractors.jpg',
        position: '50% 45%',
        alt: 'Contractor holding a hammer next to a hard hat and tool belt',
        learnMore: paths.forContractors
    },
    {
        value: 'partners',
        label: 'Partners',
        title: 'Reach homeowners and pros in CT and MA',
        lead: 'Suppliers, brands and local businesses can work with us to meet the people who build.',
        benefits: ['A focused local audience', 'Co-marketing opportunities', 'Shared insights and resources', 'Growth for both sides'],
        image: '/assets/home/audience-partners.jpg',
        alt: 'Two people discussing a partnership in a bright office',
        learnMore: paths.forPartners
    }
];

const resolveCta = (audience, user) => {
    if (audience === 'homeowners') {
        return {
            label: 'Post a project',
            href: user ? paths.cabinet.projects.create : paths.register.customer
        };
    }

    if (audience === 'contractors') {
        if (!user) return { label: 'Become a service provider', href: paths.register.serviceProvider };
        if (user.role === roles.WORKER) return { label: 'Find projects', href: paths.cabinet.projects.find.index };
        return { label: 'Become a service provider', href: paths.cabinet.profiles.specialistCreateWizard };
    }

    return { label: 'Become a partner', href: paths.partners.apply };
};

const AudienceCopy = ({ item, user }) => {
    const cta = resolveCta(item.value, user);

    return (
        <Box>
            <Typography component="h3" sx={{ ...displayTitleSx, fontSize: { xs: 24, md: 34 } }}>
                {item.title}
            </Typography>
            <Typography sx={{ mt: 1.5, maxWidth: 480, color: BRAND.muted, fontSize: { xs: 15, md: 17 }, lineHeight: 1.6 }}>
                {item.lead}
            </Typography>

            <Box
                component="ul"
                sx={{
                    listStyle: 'none',
                    p: 0,
                    m: 0,
                    mt: { xs: 2.5, md: 3.5 },
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                    gap: { xs: 1.25, md: 1.75 }
                }}
            >
                {item.benefits.map((benefit) => (
                    <Stack key={benefit} component="li" direction="row" spacing={1.25} alignItems="center">
                        <Box
                            sx={{
                                width: 26,
                                height: 26,
                                flexShrink: 0,
                                borderRadius: '9px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: alpha(BRAND.green, 0.12),
                                color: BRAND.green
                            }}
                        >
                            <CheckRoundedIcon sx={{ fontSize: 17 }} />
                        </Box>
                        <Typography sx={{ fontSize: 15, fontWeight: 600, color: BRAND.ink }}>{benefit}</Typography>
                    </Stack>
                ))}
            </Box>

            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 1.5, sm: 3 }}
                alignItems={{ xs: 'stretch', sm: 'center' }}
                sx={{ mt: { xs: 3, md: 4.5 } }}
            >
                <Button
                    component={RouterLink}
                    href={cta.href}
                    variant="contained"
                    color="success"
                    size="large"
                    sx={{
                        px: 4,
                        py: 1.5,
                        borderRadius: RADIUS.tile,
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        boxShadow: SHADOW.green,
                        '&:active': { transform: 'translateY(1px)' }
                    }}
                >
                    {cta.label}
                </Button>
                <Box
                    component={RouterLink}
                    href={item.learnMore}
                    data-track={`home_desc_learn_${item.value}`}
                    onClick={() => trackClick(`home_desc_learn_${item.value}`)}
                    sx={{
                        alignSelf: { xs: 'center', sm: 'auto' },
                        color: BRAND.navy,
                        fontWeight: 700,
                        fontSize: 15,
                        textDecoration: 'underline',
                        textDecorationColor: alpha(BRAND.navy, 0.3),
                        textUnderlineOffset: 4,
                        '&:hover': { textDecorationColor: BRAND.navy }
                    }}
                >
                    Learn more
                </Box>
            </Stack>
        </Box>
    );
};

const AudiencePhoto = ({ item }) => (
    <Box
        component="img"
        src={item.image}
        alt={item.alt}
        loading="lazy"
        sx={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', objectPosition: item.position || '50% 35%' }}
    />
);

export const HomeDescription2 = () => {
    const { user } = useAuth();
    const [audience, setAudience] = useState(AUDIENCES[0].value);

    return (
        <HomeSection bg="mist">
            <SectionHeading
                title="Use CTMASS"
                subtitle="One platform for the people who need work done, the people who do it, and the businesses around them."
            />

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.05fr) minmax(0, 0.95fr)' },
                    gridTemplateAreas: { xs: '"switch" "photo" "copy"', md: '"switch photo" "copy photo"' },
                    gridTemplateRows: { md: 'auto 1fr' },
                    columnGap: 8,
                    rowGap: { xs: 2.5, md: 4.5 }
                }}
            >
                <SegmentedSwitch
                    ariaLabel="Choose who you are"
                    options={AUDIENCES}
                    value={audience}
                    onChange={setAudience}
                    sx={{ gridArea: 'switch', alignSelf: 'end', width: '100%', maxWidth: 460 }}
                />

                <FadeStack
                    activeKey={audience}
                    sx={{ gridArea: 'copy', alignSelf: 'start' }}
                    items={AUDIENCES.map((item) => ({ key: item.value, content: <AudienceCopy item={item} user={user} /> }))}
                />

                <Box
                    sx={{
                        gridArea: 'photo',
                        position: 'relative',
                        borderRadius: RADIUS.panel,
                        overflow: 'hidden',
                        aspectRatio: { xs: '16 / 11', md: '1 / 1' },
                        maxHeight: { md: 520 },
                        boxShadow: SHADOW.lg,
                        bgcolor: alpha(BRAND.navy, 0.08)
                    }}
                >
                    <FadeStack
                        activeKey={audience}
                        sx={{ height: '100%', '& > *': { height: '100%' } }}
                        items={AUDIENCES.map((item) => ({ key: item.value, content: <AudiencePhoto item={item} /> }))}
                    />
                    <Box
                        aria-hidden
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            pointerEvents: 'none',
                            background: `linear-gradient(180deg, ${alpha(BRAND.navyDeep, 0)} 55%, ${alpha(BRAND.navyDeep, 0.35)} 100%)`
                        }}
                    />
                </Box>
            </Box>
        </HomeSection>
    );
};
