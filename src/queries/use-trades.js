import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { tradesApi } from 'src/api/trades';

export const tradeKey = (tradeId) => ['trade', tradeId];
export const userTradesKey = (userId) => ['trades', 'by-user', userId];
export const latestTradeKey = (userId) => ['trade', 'latest', userId];

// The user's most recent trade (for pricing / story fallbacks).
export const useLatestTrade = (userId) =>
    useQuery({
        queryKey: latestTradeKey(userId),
        queryFn: () => tradesApi.getLatestTrade(userId),
        enabled: Boolean(userId),
        staleTime: 2 * 60 * 1000
    });

// Single trade by id (view / edit prefill).
export const useTrade = (tradeId) =>
    useQuery({
        queryKey: tradeKey(tradeId),
        queryFn: () => tradesApi.getTrade(tradeId),
        enabled: Boolean(tradeId),
        staleTime: 60 * 1000
    });

// One-shot list of a user's trades (NOT the live subscription in
// src/hooks/use-user-trades.js — this is for read-only consumers).
export const useUserTradesQuery = (userId) =>
    useQuery({
        queryKey: userTradesKey(userId),
        queryFn: () => tradesApi.getTradesByUser(userId),
        enabled: Boolean(userId),
        staleTime: 60 * 1000
    });

export const useInvalidateUserTrades = (userId) => {
    const queryClient = useQueryClient();
    return useCallback(
        () => queryClient.invalidateQueries({ queryKey: userTradesKey(userId) }),
        [queryClient, userId]
    );
};
