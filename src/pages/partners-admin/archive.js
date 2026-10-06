import { Seo } from 'src/components/seo';
import { BannersManager } from 'src/sections/partners-admin/banners-manager';

const Page = () => (
    <>
        <Seo title="Archive · Partners admin" />
        <BannersManager archived />
    </>
);

export default Page;
