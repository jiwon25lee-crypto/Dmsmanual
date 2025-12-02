import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { downloadCSVData } from "./csv-handler.tsx";

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
    const { translations, commonVisibility, pageMetadata, menuStructure } = body;
    
    console.log('[Server] Saving manual data to KV store');
    console.log('[Server] Translation keys count:', Object.keys(translations?.ko || {}).length);
    console.log('[Server] Menu structure categories:', menuStructure?.length || 0);
    
    await kv.set('dms_manual_data_v1', {
      translations,
      commonVisibility,
      pageMetadata,
      menuStructure, // 🆕 menuStructure 저장
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

// 🆕 이미지 삭제 엔드포인트
app.post("/make-server-8aea8ee5/admin/delete-image", async (c) => {
  try {
    console.log('[Server] Image delete request received');
    
    const body = await c.req.json();
    const { imageUrl } = body;
    
    if (!imageUrl) {
      console.error('[Server] No imageUrl provided');
      return c.json({ success: false, error: 'No imageUrl provided' }, 400);
    }
    
    console.log('[Server] Deleting image:', imageUrl);
    
    // URL에서 파일 경로 추출
    // 예: https://xxx.supabase.co/storage/v1/object/public/make-8aea8ee5-manual-images/pageId/filename.png
    // -> pageId/filename.png
    const bucketName = 'make-8aea8ee5-manual-images';
    const match = imageUrl.match(/\/make-8aea8ee5-manual-images\/(.+)$/);
    
    if (!match) {
      console.error('[Server] Invalid image URL format:', imageUrl);
      return c.json({ success: false, error: 'Invalid image URL format' }, 400);
    }
    
    const filePath = match[1];
    console.log('[Server] Extracted file path:', filePath);
    
    // Supabase Storage에서 삭제
    const { data, error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);
    
    if (error) {
      console.error('[Server] Delete error:', error);
      return c.json({ success: false, error: error.message }, 500);
    }
    
    console.log('[Server] Delete successful:', filePath);
    
    return c.json({
      success: true,
      message: 'Image deleted successfully',
      deletedPath: filePath,
    });
  } catch (error) {
    console.error('[Server] Image delete error:', error);
    return c.json({ 
      success: false, 
      error: 'Delete failed', 
      details: error instanceof Error ? error.message : String(error) 
    }, 500);
  }
});

// 🆕 CSV 데이터 다운로드 엔드포인트
app.get("/make-server-8aea8ee5/admin/download-csv", async (c) => {
  try {
    console.log('[Server] CSV download request received');
    
    // CSV 생성
    const csvText = await downloadCSVData();
    
    console.log('[Server] CSV download successful');
    
    // CSV 텍스트 반환
    return c.text(csvText, 200, {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="dms-manual-data.csv"'
    });
    
  } catch (error) {
    console.error('[Server] CSV download error:', error);
    return c.json({ 
      error: 'CSV download failed', 
      details: error instanceof Error ? error.message : String(error) 
    }, 500);
  }
});

// 🆕 초기 데이터 로드 엔드포인트
app.post("/make-server-8aea8ee5/admin/load-initial-data", async (c) => {
  try {
    console.log('[Server] Initial data load request received');
    
    const body = await c.req.json();
    const { csvData } = body;
    
    if (!csvData || !Array.isArray(csvData)) {
      return c.json({ error: 'Invalid CSV data' }, 400);
    }
    
    console.log('[Server] Processing CSV rows:', csvData.length);
    
    // CSV를 구조화된 데이터로 변환
    const { transformCSVToTranslations } = await import('./csv-handler.tsx');
    const newData = transformCSVToTranslations(csvData);
    
    // 기존 데이터 로드
    const existingData = await kv.get('dms_manual_data_v1');
    console.log('[Server] Existing data loaded:', existingData ? 'yes' : 'no');
    
    // 데이터 병합
    const mergedData = {
      translations: {
        ko: {
          ...(existingData?.translations?.ko || {}),
          ...newData.translations.ko
        },
        en: {
          ...(existingData?.translations?.en || {}),
          ...newData.translations.en
        }
      },
      commonVisibility: {
        ...(existingData?.commonVisibility || {}),
        ...newData.commonVisibility
      },
      pageMetadata: {
        ...(existingData?.pageMetadata || {}),
        ...newData.pageMetadata
      },
      menuStructure: newData.menuStructure, // 새 메뉴 구조로 교체
      updatedAt: new Date().toISOString()
    };
    
    console.log('[Server] Merged data:', {
      koKeys: Object.keys(mergedData.translations.ko).length,
      enKeys: Object.keys(mergedData.translations.en).length,
      categories: mergedData.menuStructure.length
    });
    
    // Supabase에 저장
    await kv.set('dms_manual_data_v1', mergedData);
    
    console.log('[Server] ✅ Initial data load complete');
    
    return c.json({
      success: true,
      stats: {
        categoriesAdded: newData.menuStructure.length,
        translationsAdded: Object.keys(newData.translations.ko).length,
        totalCategories: mergedData.menuStructure.length,
        totalTranslations: Object.keys(mergedData.translations.ko).length
      }
    });
    
  } catch (error) {
    console.error('[Server] Initial data load error:', error);
    return c.json({ 
      error: 'Initial data load failed', 
      details: error instanceof Error ? error.message : String(error) 
    }, 500);
  }
});

Deno.serve(app.fetch);