import {useCallback, useEffect, useState} from "react";
import {useMounted} from "./use-mounted";
import {servicesFeedApi} from "../api/servicesFeed";
import toast from "react-hot-toast";

export const useConnection = (user, profile, handleConnectionsGet) => {
    const [connection, setConnection] = useState();
    const isMounted = useMounted();

    const handleConnectionGet = useCallback(async () => {
        if (!profile)
            return;
        let response = await servicesFeedApi.getConnection(user.id, profile.id);
        if (response.empty) {
            response = await servicesFeedApi.getConnection(profile.id, user.id);
        }
        const firstDoc = response.docs[0];

        if (isMounted()) {
            setConnection(firstDoc ? {id: firstDoc.id, ...firstDoc.data()} : null);
            handleConnectionsGet();
        }
    }, [user, profile, isMounted]);

    useEffect(() => {
            handleConnectionGet();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [user, profile]);

    const handleConnectionAdd = useCallback(async () => {
        if (!connection) {
            await servicesFeedApi.addConnection(user.id, profile.id, "pending");
            toast.success('Connection request send');
            handleConnectionGet();
        } else {
            await servicesFeedApi.updateConnection(connection.id, "connected")
        }
    }, [connection]);

    const handleConnectionCancel = useCallback(async () => {
        if (connection.status === "pending") {
            await servicesFeedApi.deleteConnection(connection.id);
            toast.success('Connection cancel send');
            handleConnectionGet();
        } else {
            await servicesFeedApi.updateConnection(connection.id, "not_connected")
        }
    }, [connection]);

    return [connection, handleConnectionGet, handleConnectionAdd, handleConnectionCancel];
};

function getPageUrl(profile) {
    return process.env.REACT_APP_HOST_P + "/specialist/" + profile.profilePage;
}


export const useConnections = (user, search = '') => {
    const [connections, setConnections] = useState([]);
    const isMounted = useMounted();

    const handleConnectionsGet = useCallback(async () => {
        if (!user) {
            return;
        }
        const userId = user.id;
        const response = await servicesFeedApi.getConnections({userId: userId});

        let userConnections = [];
        let idSet = new Set();
        response.forEach((doc) => {
            const id = doc.id;
            const data = doc.data();
            userConnections.push({id, ...data});
            idSet.add(data.user1);
            idSet.add(data.user2);
        });
        if (userConnections.length > 0) {
            const response2 = await servicesFeedApi.getProfilesForConnections(idSet);
            const profiles = new Map();
            response2.forEach((doc) => {
                const id = doc.id;
                profiles.set(id, doc.data());
            });
            userConnections = userConnections.filter((con) => {
                const id = con.user1 === userId ? con.user2 : con.user1;
                return profiles.get(id);

            }).map((con) => {
                const id = con.user1 === userId ? con.user2 : con.user1;
                const user = profiles.get(id);

                return (
                    {
                        id: con.id,
                        avatar: user.avatar,
                        commonConnections: 1,
                        name: user.businessName,
                        status: con.status,
                        url: getPageUrl(user)
                    })
            });
        }

        if (isMounted()) {
            setConnections(userConnections);
        }
    }, [user, isMounted]);

    useEffect(() => {
            handleConnectionsGet();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [user, search]);

    return [connections.filter((connection) => {
        return connection.name?.toLowerCase().includes(search);
    }), handleConnectionsGet];
};