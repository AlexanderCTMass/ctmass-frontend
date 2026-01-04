import { useEffect, useMemo, useState } from 'react';
import { tradesApi } from 'src/api/trades';

const DEFAULT_STATS = {
    totalTrades: 0,
    totalViewsThisWeek: 0,
    newOrders: 0
};

export const useUserTrades = (userId) => {
    const [trades, setTrades] = useState([]);
    const [loading, setLoading] = useState(Boolean(userId));
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!userId) {
            setTrades([]);
            setLoading(false);
            return undefined;
        }

        setLoading(true);
        setError(null);

        const unsubscribe = tradesApi.subscribeToUserTrades(
            userId,
            (items) => {
                setTrades(items);
                setLoading(false);
            },
            (err) => {
                setError(err);
                setLoading(false);
            }
        );

        return () => {
            unsubscribe?.();
        };
    }, [userId]);

    const stats = useMemo(() => {
        if (!trades.length) {
            return DEFAULT_STATS;
        }

        return trades.reduce(
            (acc, trade) => {
                acc.totalTrades += 1;
                acc.totalViewsThisWeek += Number(trade.viewsThisWeek ?? trade.metrics?.viewsThisWeek ?? 0);
                acc.newOrders += Number(trade.newOrders ?? 0);
                return acc;
            },
            {
                totalTrades: 0,
                totalViewsThisWeek: 0,
                newOrders: 0
            }
        );
    }, [trades]);

    return {
        trades,
        loading,
        error,
        stats
    };
};