import { createClient } from "@vercel/kv";

export const kv = createClient({
  url: process.env.KV_MUM_KV_REST_API_URL!,
  token: process.env.KV_MUM_KV_REST_API_TOKEN!,
});
