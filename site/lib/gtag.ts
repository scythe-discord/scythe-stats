import { GA_TRACKING_ID } from './env';

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url: string) => {
  if (window.gtag && GA_TRACKING_ID) {
    window.gtag('config', GA_TRACKING_ID, {
      // eslint-disable-next-line
      page_path: url,
    });
  }
};
