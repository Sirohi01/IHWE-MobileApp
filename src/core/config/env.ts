const DEV_SERVER_URL = 'https://nenita-untoured-nonhesitantly.ngrok-free.dev';
const PROD_SERVER_URL = 'https://api.ihwe.in';

const extra = (globalThis as any)?.expo?.modules?.ExpoConstants?.expoConfig?.extra || {};

export const SERVER_URL =
  extra.serverUrl ||
  process.env.EXPO_PUBLIC_SERVER_URL ||
  (__DEV__ ? DEV_SERVER_URL : PROD_SERVER_URL);

export const API_URL =
  extra.apiUrl ||
  process.env.EXPO_PUBLIC_API_URL ||
  `${SERVER_URL.replace(/\/$/, '')}/api`;

export const RAZORPAY_KEY_ID =
  extra.razorpayKeyId ||
  process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID ||
  '';

export const imageUrl = (path?: string | null) => {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  const cleanServer = SERVER_URL.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanServer}${cleanPath}`;
};
