import { useMemo } from 'react';
import { useAuth } from 'src/hooks/use-auth';
import { paths } from 'src/paths';
import { roles } from 'src/roles';

export const useCabinetNavItems = () => {
    const { user } = useAuth();
    const role = user?.role;

    return useMemo(() => {
        const items = [];

        if (role === roles.WORKER) {
            items.push({ title: 'Find projects', path: paths.cabinet.projects.find.index });
            items.push({ title: 'My works', path: paths.cabinet.projects.contractor });
        }

        items.push({ title: 'My projects', path: paths.cabinet.projects.index, exactSearch: role === roles.WORKER });
        items.push({ title: 'Post a project', path: paths.cabinet.projects.create });
        items.push({ title: 'Dashboard', path: paths.dashboard.overview });
        items.push({ title: 'Support', path: paths.contact });

        return items;
    }, [role]);
};
