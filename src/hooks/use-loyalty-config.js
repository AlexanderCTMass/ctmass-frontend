import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { firestore } from 'src/libs/firebase';
import { DEFAULT_LOYALTY_RULES } from 'src/api/loyalty-admin';

const fetchLoyaltyRules = async () => {
  const snapshot = await getDocs(
    query(collection(firestore, 'loyalty_config'), orderBy('sortOrder', 'asc'))
  );
  const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  return docs.filter((r) => r.enabled && r.archived !== true);
};

export const useLoyaltyConfig = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchLoyaltyRules()
      .then((data) => {
        if (!cancelled) {
          setRules(data.length > 0 ? data : DEFAULT_LOYALTY_RULES.filter((r) => r.enabled));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRules(DEFAULT_LOYALTY_RULES.filter((r) => r.enabled));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { rules, loading };
};
