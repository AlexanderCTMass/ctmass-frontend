import PropTypes from 'prop-types';
import { Box, Container, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Footer } from './footer';
import { SideNav } from './side-nav';
import { TopNav } from './top-nav';
import { useMobileNav } from './use-mobile-nav';
import { withAuthGuard } from "src/hocs/with-auth-guard";
import WorkersCounterCompact from "src/components/workers-counter-compact";
import { BRAND } from 'src/theme/ctmass-tokens';
import { blueprintBackdropSx } from 'src/components/ctmass-ui';

const LayoutRoot = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.default,
    height: '100%'
}));

export const LayoutGuard = withAuthGuard((props) => {
    const { children } = props;
    const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
    const mobileNav = useMobileNav();

    return (
        <>
            <TopNav onMobileNavOpen={mobileNav.handleOpen} />
            {!lgUp && (
                <SideNav
                    onClose={mobileNav.handleClose}
                    open={mobileNav.open}
                />
            )}
            <LayoutRoot sx={{ position: 'relative', bgcolor: BRAND.mist }}>
                <Box
                    aria-hidden
                    sx={{
                        ...blueprintBackdropSx,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: { xs: 360, md: 440 },
                        bgcolor: '#FFFFFF',
                        '&::after': { display: 'none' },
                        WebkitMaskImage: 'linear-gradient(180deg, #000 55%, transparent 100%)',
                        maskImage: 'linear-gradient(180deg, #000 55%, transparent 100%)'
                    }}
                />
                <Container maxWidth="lg" sx={{ position: 'relative', p: 0, pt: { xs: 15, md: 17 }, pb: { xs: 7, md: 12 }, minHeight: '70vh' }}>
                    {children}
                </Container>
                <Footer />
            </LayoutRoot>
        </>
    );
});

LayoutGuard.propTypes = {
    children: PropTypes.node
};
