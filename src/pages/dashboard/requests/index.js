import { memo } from 'react';
import { Seo } from 'src/components/seo';
import RequestsContent from './components';

const RequestsPage = () => (
    <>
        <Seo title="My Requests" />
        <RequestsContent />
    </>
);

export default memo(RequestsPage);
