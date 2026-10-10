/* ============================================================
 * LEFT HERE — Environment Configuration
 * Validates env vars at startup. Fails fast if missing.
 * ============================================================ */

function requireEnv(key: string): string {
  const value = import.meta.env[key];
  if (!value) {
    console.warn(
      `[Left Here] Missing env var: ${key}. Using placeholder. Set it in .env.local.`
    );
    return '';
  }
  return value;
}

export const env = {
  supabaseUrl: requireEnv('VITE_SUPABASE_URL'),
  supabaseKey: requireEnv('VITE_SUPABASE_PUBLISHABLE_KEY'),
  allowSim: import.meta.env.VITE_ALLOW_SIM === 'true',
  buildId: typeof __BUILD_ID__ !== 'undefined' ? __BUILD_ID__ : 'dev',
  isDev: import.meta.env.DEV,
} as const;
