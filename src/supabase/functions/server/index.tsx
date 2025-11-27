import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import adminApi from "./admin-api.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-8aea8ee5/health", (c) => {
  return c.json({ status: "ok" });
});

// Admin API routes
app.route("/", adminApi);

// 🆕 매뉴얼 데이터 로드
app.get("/make-server-8aea8ee5/manual/load", async (c) => {
  try {
    console.log('[Server] Loading manual data from KV store');
    const data = await kv.get('dms_manual_data_v1');
    
    if (data) {
      console.log('[Server] Manual data loaded successfully');
      return c.json(data);
    } else {
      console.log('[Server] No saved data found, returning empty');
      return c.json({ translations: null, commonVisibility: null, pageMetadata: null });
    }
  } catch (error) {
    console.error('[Server] Load error:', error);
    return c.json({ error: 'Load failed', details: String(error) }, 500);
  }
});

// 🆕 매뉴얼 데이터 저장
app.post("/make-server-8aea8ee5/manual/save", async (c) => {
  try {
    const body = await c.req.json();
    const { translations, commonVisibility, pageMetadata } = body;
    
    console.log('[Server] Saving manual data to KV store');
    console.log('[Server] Translation keys count:', Object.keys(translations?.ko || {}).length);
    
    await kv.set('dms_manual_data_v1', {
      translations,
      commonVisibility,
      pageMetadata, // 🆕 추가
      updatedAt: new Date().toISOString(),
    });
    
    console.log('[Server] Manual data saved successfully');
    return c.json({ success: true, message: 'Data saved successfully' });
  } catch (error) {
    console.error('[Server] Save error:', error);
    return c.json({ error: 'Save failed', details: String(error) }, 500);
  }
});

Deno.serve(app.fetch);