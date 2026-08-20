import { Env } from "./env";
import { createRouter } from "./router";
import { runRetentionCleanup } from "./cron/cleanup";

const app = createRouter();

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return app.fetch(request, env, ctx);
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(runRetentionCleanup(env.DB));
  },
};
