import { useEffect } from 'react';
import { APP_STORE_URL, GOOGLE_PLAY_URL, detectMobilePlatform } from 'src/constants/mobile-apps';

const Page = () => {
    useEffect(() => {
        const platform = detectMobilePlatform();
        const target = platform === 'ios' ? APP_STORE_URL : platform === 'android' ? GOOGLE_PLAY_URL : '/';
        window.location.replace(target);
    }, []);

    return null;
};

export default Page;
