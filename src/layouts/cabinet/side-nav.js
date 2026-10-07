import PropTypes from 'prop-types';
import { SideNav as BaseSideNav } from 'src/layouts/marketing/side-nav';
import { useCabinetNavItems } from './nav-items';

export const SideNav = ({ onClose, open = false }) => {
    const items = useCabinetNavItems();

    return <BaseSideNav onClose={onClose} open={open} items={items} />;
};

SideNav.propTypes = {
    onClose: PropTypes.func,
    open: PropTypes.bool
};
