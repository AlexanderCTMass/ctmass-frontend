import PropTypes from 'prop-types';
import {Container, useMediaQuery} from '@mui/material';
import {styled} from '@mui/material/styles';
import {Footer} from './footer';
import {SideNav} from './side-nav';
import {TopNav} from './top-nav';
import {useMobileNav} from './use-mobile-nav';
import {withAuthGuard} from "src/hocs/with-auth-guard";

const LayoutRoot = styled('div')(({theme}) => ({
    backgroundColor: theme.palette.background.default,
    height: '100%'
}));

export const LayoutGuard = withAuthGuard((props) => {
    const {children} = props;
    const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
    const mobileNav = useMobileNav();

    return (
        <>
            <TopNav onMobileNavOpen={mobileNav.handleOpen}/>
            {!lgUp && (
                <SideNav
                    onClose={mobileNav.handleClose}
                    open={mobileNav.open}
                />
            )}
            <LayoutRoot sx={{
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'top center',
                backgroundImage: 'url("/assets/gradient-bg.svg")',
                pt: 16,
                pb: 8,
            }}>
                <Container maxWidth="lg">
                    {children}
                </Container>
                <Footer/>
            </LayoutRoot>
        </>
    );
});

LayoutGuard.propTypes = {
    children: PropTypes.node
};
