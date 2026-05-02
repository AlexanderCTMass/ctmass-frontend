import { useEffect, useState } from 'react';
import { paidFeaturesApi, DEFAULT_SHOP_ITEMS } from 'src/api/paid-features';

export const usePaidFeaturesConfig = () => {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    paidFeaturesApi
      .getEnabled()
      .then((data) => {
        if (!cancelled) {
          setFeatures(data.length > 0 ? data : DEFAULT_SHOP_ITEMS.filter((f) => f.enabled));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFeatures(DEFAULT_SHOP_ITEMS.filter((f) => f.enabled));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { features, loading };
};
