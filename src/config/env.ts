const required = (name: string, value: string | undefined) => {
  const resolved = value?.trim();
  if (!resolved) throw new Error(`Missing Vite environment variable: ${name}`);
  return resolved.replace(/\/$/, '');
};

export const env = {
  apiBaseUrl: required('VITE_API_BASE_URL', import.meta.env.VITE_API_BASE_URL),
  authApiUrl: required('VITE_AUTH_API_URL', import.meta.env.VITE_AUTH_API_URL),
  swaggerUrl: required('VITE_SWAGGER_URL', import.meta.env.VITE_SWAGGER_URL),
};
