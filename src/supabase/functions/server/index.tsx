import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "jsr:@supabase/supabase-js@2";

const app = new Hono();

// Supabase 클라이언트 (Storage 사용)
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

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

// 🆕 이미지 업로드 엔드포인트
app.post("/make-server-8aea8ee5/admin/upload-image", async (c) => {
  try {
    console.log('[Server] Image upload request received');
    
    // FormData 파싱
    const formData = await c.req.formData();
    const file = formData.get("file") as File;
    const pageId = formData.get("pageId") as string || "general";
    const fileName = formData.get("fileName") as string;
    
    if (!file) {
      console.error('[Server] No file provided');
      return c.json({ success: false, error: 'No file provided' }, 400);
    }
    
    console.log('[Server] Uploading file:', fileName, 'for page:', pageId);
    
    // Storage 버킷 확인 및 생성
    const bucketName = 'make-8aea8ee5-manual-images';
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log('[Server] Creating bucket:', bucketName);
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true, // 공개 버킷으로 생성
        fileSizeLimit: 5242880, // 5MB
      });
      
      if (createError) {
        console.error('[Server] Bucket creation error:', createError);
        throw createError;
      }
    }
    
    // 파일을 ArrayBuffer로 변환
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Supabase Storage에 업로드
    const filePath = `${pageId}/${fileName}`;
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, uint8Array, {
        contentType: file.type,
        upsert: true, // 같은 이름 파일이 있으면 덮어쓰기
      });
    
    if (error) {
      console.error('[Server] Upload error:', error);
      return c.json({ success: false, error: error.message }, 500);
    }
    
    // 공개 URL 생성
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    console.log('[Server] Upload successful:', publicUrlData.publicUrl);
    
    return c.json({
      success: true,
      data: {
        path: filePath,
        publicUrl: publicUrlData.publicUrl,
      },
    });
  } catch (error) {
    console.error('[Server] Image upload error:', error);
    return c.json({ 
      success: false, 
      error: 'Upload failed', 
      details: error instanceof Error ? error.message : String(error) 
    }, 500);
  }
});

Deno.serve(app.fetch);