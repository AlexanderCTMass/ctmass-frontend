import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Logo } from 'src/components/logo';
import { RouterLink } from 'src/components/router-link';
import { paths } from 'src/paths';
import { CheckList } from 'src/sections/landing/landing-kit';
import { blueprintBackdropSx, formScopeSx } from 'src/components/ctmass-ui';
import { BRAND, FONT, RADIUS, displayTitleSx } from 'src/theme/ctmass-tokens';

const VIDEOS = ['guitar', 'woman', 'phone', 'cleaning'];

const FACTS = [
    'Free for homeowners, always',
    'No paid leads for contractors',
    'Local pros in Connecticut and Massachusetts',
    'Reviews from real projects on CTMASS'
];

const Brand = ({ light = false }) => (
    <Stack
        alignItems="center"
        component={RouterLink}
        direction="row"
        display="inline-flex"
        href={paths.index}
        spacing={1.25}
        sx={{ textDecoration: 'none' }}
    >
        <Box sx={{ display: 'inline-flex', height: 48, width: 48 }}>
            <Logo />
        </Box>
        <Box
            sx={{
                fontFamily: FONT.display,
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: light ? '#FFFFFF' : BRAND.navy,
                '& span': { color: light ? '#7EE2AE' : BRAND.green }
            }}
        >
            CT<span>MASS</span>
        </Box>
    </Stack>
);

export const Layout = (props) => {
    const { children } = props;
    const [video, setVideo] = useState(null);

    useEffect(() => {
        setVideo(VIDEOS[Math.floor(Math.random() * VIDEOS.length)]);
    }, []);

    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) minmax(0, 1fr)', lg: 'minmax(0, 1.1fr) minmax(0, 1fr)' },
                minHeight: '100dvh',
                bgcolor: '#FFFFFF'
            }}
        >
            <Box
                sx={{
                    display: { xs: 'none', md: 'flex' },
                    position: 'sticky',
                    top: 0,
                    height: '100dvh',
                    p: { md: 2 }
                }}
            >
                <Box
                    sx={{
                        position: 'relative',
                        flex: 1,
                        overflow: 'hidden',
                        borderRadius: RADIUS.panel,
                        bgcolor: BRAND.navyDeep,
                        color: '#FFFFFF',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        p: { md: 5, lg: 6 }
                    }}
                >
                    {video && (
                        <Box
                            component="video"
                            autoPlay
                            loop
                            muted
                            playsInline
                            aria-hidden
                            sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55 }}
                        >
                            <source src={`/assets/video/${video}.mp4`} type="video/mp4" />
                        </Box>
                    )}
                    <Box
                        aria-hidden
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            pointerEvents: 'none',
                            background: `linear-gradient(180deg, ${alpha(BRAND.navyDeep, 0.55)} 0%, ${alpha(BRAND.navyDeep, 0.25)} 40%, ${alpha(BRAND.navyDeep, 0.92)} 100%)`
                        }}
                    />

                    <Box sx={{ position: 'relative' }}>
                        <Brand light />
                    </Box>

                    <Box sx={{ position: 'relative', maxWidth: 520 }}>
                        <Typography
                            component="p"
                            sx={{ ...displayTitleSx, color: '#FFFFFF', fontSize: { md: 40, lg: 50 }, lineHeight: 1.05 }}
                        >
                            Local pros and homeowners, in one place.
                        </Typography>
                        <Typography sx={{ mt: 2, color: alpha('#FFFFFF', 0.78), fontSize: 17, lineHeight: 1.6 }}>
                            Help people with what you do best, or find the right pro for your home.
                        </Typography>
                        <CheckList dark items={FACTS} sx={{ mt: 3.5 }} />
                    </Box>
                </Box>
            </Box>

            <Box
                sx={{
                    ...blueprintBackdropSx,
                    '&::after': { display: 'none' },
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0,
                    px: { xs: 2, sm: 4, lg: 8 },
                    pt: { xs: 3, md: 5 },
                    pb: { xs: 4, md: 5 }
                }}
            >
                <Box sx={{ position: 'relative', display: { md: 'none' }, mb: 4 }}>
                    <Brand />
                </Box>

                <Box
                    sx={{
                        position: 'relative',
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: { md: 'center' },
                        width: '100%',
                        maxWidth: 460,
                        mx: 'auto',
                        ...formScopeSx
                    }}
                >
                    {children}
                    <Typography sx={{ display: 'block', mt: 4, fontSize: 12, lineHeight: 1.6, color: BRAND.muted, '& a': { color: BRAND.navy, fontWeight: 600 } }}>
                        This site is protected by reCAPTCHA and the Google{' '}
                        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                            Privacy Policy
                        </a>{' '}
                        and{' '}
                        <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">
                            Terms of Service
                        </a>{' '}
                        apply.
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

Layout.propTypes = {
    children: PropTypes.node
};

export const AuthHeading = ({ title, subtitle }) => (
    <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <Typography component="h1" sx={{ ...displayTitleSx, fontSize: { xs: 32, md: 40 } }}>
            {title}
        </Typography>
        {subtitle && (
            <Typography sx={{ mt: 1, fontSize: 15, color: BRAND.muted, '& a': { color: BRAND.green, fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } } }}>
                {subtitle}
            </Typography>
        )}
    </Box>
);

export const authDividerSx = {
    fontSize: 13,
    fontWeight: 600,
    color: BRAND.muted,
    '&::before, &::after': { borderColor: alpha(BRAND.navy, 0.14) }
};

export const authGoogleButtonSx = {
    minHeight: 52,
    width: '100%',
    bgcolor: '#FFFFFF',
    color: BRAND.ink,
    border: `1px solid ${alpha(BRAND.navy, 0.16)}`,
    borderRadius: RADIUS.tile,
    fontWeight: 700,
    fontSize: 15,
    textTransform: 'none',
    boxShadow: 'none',
    '&:hover': { bgcolor: BRAND.mist, borderColor: alpha(BRAND.navy, 0.28), boxShadow: 'none' }
};
