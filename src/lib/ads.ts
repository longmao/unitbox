export type AdProvider = 'none' | 'adsense' | 'direct';

const provider = (import.meta.env.PUBLIC_ADS_PROVIDER || 'none') as AdProvider;
const publisherId = import.meta.env.PUBLIC_ADSENSE_PUBLISHER_ID || '';

export const ADS = {
  provider,
  publisherId,
  siteVerification: /^ca-pub-\d+$/.test(publisherId),
  enabled: import.meta.env.PUBLIC_ADS_ENABLED === 'true' &&
    provider === 'adsense' &&
    /^ca-pub-\d+$/.test(publisherId),
};
