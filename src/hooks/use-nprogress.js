import { useEffect, useState } from 'react';
import nProgress from 'nprogress';
import { useMounted } from './use-mounted';
import { usePathname } from './use-pathname';

export function useNprogress() {
  const isMounted = useMounted();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!visible) {
      nProgress.start();
      setVisible(true);
    }

    if (visible) {
      nProgress.done();
      setVisible(false);
    }

    if (!visible && isMounted()) {
      setVisible(false);
      nProgress.done();
    }

    return () => {
      nProgress.done();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, isMounted]);
}
