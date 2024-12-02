import ReactDOM from 'react-dom/client';
import { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { App } from './app';
import { LicenseInfo } from '@mui/x-license';

const root = ReactDOM.createRoot(document.getElementById('root'));

LicenseInfo.setLicenseKey(process.env.REACT_APP_MUI_LICENSE);

root.render(
  <HelmetProvider>
    <BrowserRouter>
      <Suspense>
        <App />
      </Suspense>
    </BrowserRouter>
  </HelmetProvider>
);
