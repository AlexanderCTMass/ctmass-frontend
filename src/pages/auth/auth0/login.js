import {useCallback, useEffect} from 'react';
import {useAuth} from 'src/hooks/use-auth';
import {paths} from 'src/paths';
import {roles} from "src/roles";

const Page = () => {
    const {loginWithRedirect, user} = useAuth();

    const handle = useCallback(async () => {
        const searchParams = new URLSearchParams(window.location.search);
        const returnTo = searchParams.get('returnTo');
        await loginWithRedirect({
            returnTo: returnTo || (user.role === roles.CUSTOMER ? paths.cabinet.projects.index : user.role === roles.WORKER ? paths.cabinet.projects.find : paths.dashboard.index)
        });
    }, [loginWithRedirect]);

    useEffect(() => {
            handle();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []);

    return null;
};

export default Page;
