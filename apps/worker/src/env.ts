export interface Env {
  // Cloudflare Bindings
  DB: D1Database;
  CACHE: KVNamespace;

  // Cloudflare Variables / Secrets
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  SESSION_SECRET: string;
  APP_BASE_URL: string;
  ADMIN_EMAILS?: string;
  ADMIN_PASSWORD?: string;
}

export type AppContext = {
  Bindings: Env;
  Variables: {
    user?: {
      id: string;
      email: string;
      name?: string;
      avatar_url?: string;
      isAdmin?: boolean;
    };
    sessionId?: string;
  };
};
