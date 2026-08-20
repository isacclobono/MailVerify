export interface Env {
  // Cloudflare Bindings
  DB: D1Database;
  CACHE: KVNamespace;

  // Cloudflare Variables / Secrets
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  SESSION_SECRET: string;
  APP_BASE_URL: string;
}

export type AppContext = {
  Bindings: Env;
  Variables: {
    user?: {
      id: string;
      email: string;
      name?: string;
      avatar_url?: string;
    };
    sessionId?: string;
  };
};
