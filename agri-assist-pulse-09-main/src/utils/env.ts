/**
 * Environment variable utilities with fallbacks for production
 */

export const getEnvVar = (key: string, fallback: string = ''): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || fallback;
  }
  return fallback;
};

export const isDevelopment = () => {
  return getEnvVar('MODE') === 'development' || getEnvVar('DEV') === 'true';
};

export const isProduction = () => {
  return getEnvVar('MODE') === 'production' || getEnvVar('PROD') === 'true';
};

export const getApiUrl = (endpoint: string): string => {
  const baseUrl = getEnvVar('VITE_API_URL', '');
  return baseUrl ? `${baseUrl}${endpoint}` : endpoint;
};
