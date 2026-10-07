import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { partnerAdsApi } from 'src/api/partner-ads';
import { ctr } from 'src/constants/partner-ads';

const sumMetrics = (stats) => ({
    impressions: stats?.impressions || 0,
    clicks: stats?.clicks || 0
});

export const usePartnerAdsData = () => {
    const [banners, setBanners] = useState([]);
    const [stats, setStats] = useState({});
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const onError = (error) => {
            setLoading(false);
            toast.error(error?.message || 'Failed to load partner ads');
        };
        const offBanners = partnerAdsApi.subscribeBanners((items) => {
            setBanners(items);
            setLoading(false);
        }, onError);
        const offStats = partnerAdsApi.subscribeStats(setStats, onError);
        const offSettings = partnerAdsApi.subscribeSettings(setSettings, onError);
        return () => {
            offBanners();
            offStats();
            offSettings();
        };
    }, []);

    const metricsById = useMemo(() => {
        const result = {};
        banners.forEach((banner) => {
            const metrics = sumMetrics(stats[banner.id]);
            result[banner.id] = { ...metrics, ctr: ctr(metrics.clicks, metrics.impressions) };
        });
        return result;
    }, [banners, stats]);

    return { banners, stats, settings, loading, metricsById };
};
