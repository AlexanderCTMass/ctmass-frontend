import PropTypes from 'prop-types';
import { TopNav as BaseTopNav } from 'src/layouts/marketing/top-nav';
import { useCabinetNavItems } from './nav-items';

export const TopNav = ({ onMobileNavOpen }) => {
    const items = useCabinetNavItems();

    return <BaseTopNav onMobileNavOpen={onMobileNavOpen} items={items} />;
};

TopNav.propTypes = {
    onMobileNavOpen: PropTypes.func
};
