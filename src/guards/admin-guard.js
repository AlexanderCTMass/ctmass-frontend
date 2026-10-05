import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from 'src/hooks/use-auth';
import { useRouter } from 'src/hooks/use-router';
import { paths } from 'src/paths';
import { roles } from 'src/roles';

export const isAdminUser = (user) => Boolean(user?.isAdmin) || user?.role === roles.ADMIN;

export const AdminGuard = (props) => {
    const { children } = props;
    const router = useRouter();
    const { user } = useAuth();
    const allowed = isAdminUser(user);

    useEffect(() => {
        if (!allowed) {
            router.replace(paths.dashboard.index);
        }
    }, [allowed, router]);

    if (!allowed) {
        return null;
    }

    return <>{children}</>;
};

AdminGuard.propTypes = {
    children: PropTypes.node
};
