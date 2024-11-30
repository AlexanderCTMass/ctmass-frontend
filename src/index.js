import ReactDOM from 'react-dom/client';
import { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { App } from './app';
import { LicenseInfo } from '@mui/x-license';

const root = ReactDOM.createRoot(document.getElementById('root'));

LicenseInfo.setLicenseKey('d1a2147c96e46840eebf33551388ff92Tz0xMDMyMTIsRT0xNzY0NTk2MzY3MDAwLFM9cHJvLExNPXN1YnNjcmlwdGlvbixQVj1RMy0yMDI0LEtWPTI=');

root.render(
  <HelmetProvider>
    <BrowserRouter>
      <Suspense>
        <App />
      </Suspense>
    </BrowserRouter>
  </HelmetProvider>
);
