/**
 * 백오피스 CMS API
 * 
 * 페이지, 번역, Visibility, 이미지 관리 API
 */

import { Hono } from "npm:hono";
import { createClient } from "jsr:@supabase/supabase-js@2";

const app = new Hono();

// Supabase 클라이언트 생성
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

// ========================================
// 🗄️ 데이터베이스 초기화
// ========================================

/**
 * 테이블 생성 (최초 실행 시)
 */
app.post("/make-server-8aea8ee5/admin/initialize", async (c) => {
  try {
    // 이미지 스토리지 버킷 생성
    const bucketName = "make-8aea8ee5-page-images";
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((bucket) => bucket.name === bucketName);
    
    if (!bucketExists) {
      const { error: bucketError } = await supabase.storage.createBucket(bucketName, {
        public: true, // Public access for images
      });
      
      if (bucketError) {
        console.error("Bucket creation error:", bucketError);
        throw bucketError;
      }
    }

    return c.json({
      success: true,
      message: "Storage bucket initialized successfully. Please run SQL migration in Supabase dashboard to create tables.",
    });
  } catch (error) {
    console.error("Database initialization error:", error);
    return c.json(
      {
        success: false,
        error: String(error),
      },
      500,
    );
  }
});

// ========================================
// 📄 페이지 관리 API
// ========================================

/**
 * 모든 페이지 조회
 */
app.get("/make-server-8aea8ee5/admin/pages", async (c) => {
  try {
    const { data, error } = await supabase
      .from("pages")
      .select("*")
      .order("category")
      .order("order_num");

    if (error) throw error;

    return c.json({ success: true, data });
  } catch (error) {
    console.error("Get pages error:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * 특정 페이지 조회
 */
app.get("/make-server-8aea8ee5/admin/pages/:id", async (c) => {
  try {
    const pageId = c.req.param("id");

    const { data, error } = await supabase
      .from("pages")
      .select("*")
      .eq("id", pageId)
      .single();

    if (error) throw error;

    return c.json({ success: true, data });
  } catch (error) {
    console.error("Get page error:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * 페이지 생성
 */
app.post("/make-server-8aea8ee5/admin/pages", async (c) => {
  try {
    const body = await c.req.json();
    const { id, component, category, order_num, is_first_in_category } = body;

    const { data, error } = await supabase
      .from("pages")
      .insert({
        id,
        component,
        category,
        order_num,
        is_first_in_category: is_first_in_category ?? false,
      })
      .select()
      .single();

    if (error) throw error;

    return c.json({ success: true, data });
  } catch (error) {
    console.error("Create page error:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * 페이지 수정
 */
app.put("/make-server-8aea8ee5/admin/pages/:id", async (c) => {
  try {
    const pageId = c.req.param("id");
    const body = await c.req.json();

    const { data, error } = await supabase
      .from("pages")
      .update(body)
      .eq("id", pageId)
      .select()
      .single();

    if (error) throw error;

    return c.json({ success: true, data });
  } catch (error) {
    console.error("Update page error:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * 페이지 삭제
 */
app.delete("/make-server-8aea8ee5/admin/pages/:id", async (c) => {
  try {
    const pageId = c.req.param("id");

    // 연관 데이터도 함께 삭제
    await supabase.from("translations").delete().eq("page_id", pageId);
    await supabase.from("visibility").delete().eq("page_id", pageId);

    const { error } = await supabase.from("pages").delete().eq("id", pageId);

    if (error) throw error;

    return c.json({ success: true });
  } catch (error) {
    console.error("Delete page error:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ========================================
// 🌐 번역 관리 API
// ========================================

/**
 * 특정 페이지의 모든 번역 조회
 */
app.get("/make-server-8aea8ee5/admin/translations/:pageId", async (c) => {
  try {
    const pageId = c.req.param("pageId");

    const { data, error } = await supabase
      .from("translations")
      .select("*")
      .eq("page_id", pageId);

    if (error) throw error;

    return c.json({ success: true, data });
  } catch (error) {
    console.error("Get translations error:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * 모든 번역 조회 (전체 페이지)
 */
app.get("/make-server-8aea8ee5/admin/translations", async (c) => {
  try {
    const { data, error } = await supabase
      .from("translations")
      .select("*")
      .order("page_id")
      .order("key");

    if (error) throw error;

    return c.json({ success: true, data });
  } catch (error) {
    console.error("Get all translations error:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * 번역 생성/수정 (Upsert)
 */
app.post("/make-server-8aea8ee5/admin/translations", async (c) => {
  try {
    const body = await c.req.json();
    const { page_id, key, value_ko, value_en } = body;

    const { data, error } = await supabase
      .from("translations")
      .upsert(
        {
          page_id,
          key,
          value_ko,
          value_en,
        },
        {
          onConflict: "page_id,key",
        },
      )
      .select()
      .single();

    if (error) throw error;

    return c.json({ success: true, data });
  } catch (error) {
    console.error("Upsert translation error:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * 번역 일괄 수정 (Batch Update)
 */
app.post("/make-server-8aea8ee5/admin/translations/batch", async (c) => {
  try {
    const body = await c.req.json();
    const { translations } = body; // Array of translation objects

    const { data, error } = await supabase
      .from("translations")
      .upsert(translations, {
        onConflict: "page_id,key",
      })
      .select();

    if (error) throw error;

    return c.json({ success: true, data });
  } catch (error) {
    console.error("Batch update translations error:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * 번역 삭제
 */
app.delete("/make-server-8aea8ee5/admin/translations/:id", async (c) => {
  try {
    const id = c.req.param("id");

    const { error } = await supabase
      .from("translations")
      .delete()
      .eq("id", parseInt(id));

    if (error) throw error;

    return c.json({ success: true });
  } catch (error) {
    console.error("Delete translation error:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ========================================
// 👁️ Visibility 관리 API
// ========================================

/**
 * 특정 페이지의 Visibility 조회
 */
app.get("/make-server-8aea8ee5/admin/visibility/:pageId", async (c) => {
  try {
    const pageId = c.req.param("pageId");

    const { data, error } = await supabase
      .from("visibility")
      .select("*")
      .eq("page_id", pageId)
      .order("step_num");

    if (error) throw error;

    return c.json({ success: true, data });
  } catch (error) {
    console.error("Get visibility error:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * 모든 Visibility 조회
 */
app.get("/make-server-8aea8ee5/admin/visibility", async (c) => {
  try {
    const { data, error } = await supabase
      .from("visibility")
      .select("*")
      .order("page_id")
      .order("step_num");

    if (error) throw error;

    return c.json({ success: true, data });
  } catch (error) {
    console.error("Get all visibility error:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * Visibility 생성/수정 (Upsert)
 */
app.post("/make-server-8aea8ee5/admin/visibility", async (c) => {
  try {
    const body = await c.req.json();
    const { page_id, step_num, is_visible, image_visible } = body;

    const { data, error } = await supabase
      .from("visibility")
      .upsert(
        {
          page_id,
          step_num,
          is_visible: is_visible ?? true,
          image_visible: image_visible ?? true,
        },
        {
          onConflict: "page_id,step_num",
        },
      )
      .select()
      .single();

    if (error) throw error;

    return c.json({ success: true, data });
  } catch (error) {
    console.error("Upsert visibility error:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * Visibility 일괄 수정 (Batch Update)
 */
app.post("/make-server-8aea8ee5/admin/visibility/batch", async (c) => {
  try {
    const body = await c.req.json();
    const { visibility } = body; // Array of visibility objects

    const { data, error } = await supabase
      .from("visibility")
      .upsert(visibility, {
        onConflict: "page_id,step_num",
      })
      .select();

    if (error) throw error;

    return c.json({ success: true, data });
  } catch (error) {
    console.error("Batch update visibility error:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ========================================
// 🖼️ 이미지 관리 API
// ========================================

/**
 * 이미지 업로드 (개선된 버전)
 */
app.post("/make-server-8aea8ee5/admin/upload-image", async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body.file as File;
    const pageId = body.pageId as string;
    const fileName = body.fileName as string;

    if (!file || !pageId || !fileName) {
      return c.json(
        { success: false, error: "Missing required fields" },
        400,
      );
    }

    const bucketName = "make-8aea8ee5-page-images";
    
    // 버킷이 없으면 생성
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((bucket) => bucket.name === bucketName);
    
    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, {
        public: true, // Public access for images
      });
    }

    // 파일 경로: pageId/fileName
    const filePath = `${pageId}/${fileName}`;

    // 파일 업로드
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        contentType: file.type,
        upsert: true, // 같은 이름이면 덮어쓰기
      });

    if (error) throw error;

    // Public URL 생성
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return c.json({
      success: true,
      data: {
        path: data.path,
        publicUrl: urlData.publicUrl,
      },
    });
  } catch (error) {
    console.error("Image upload error:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * 이미지 업로드 (기존 버전 - 호환성 유지)
 */
app.post("/make-server-8aea8ee5/admin/images/upload", async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body.file as File;
    const pageId = body.pageId as string;
    const language = body.language as string; // 'ko' or 'en'

    if (!file || !pageId || !language) {
      return c.json(
        { success: false, error: "Missing required fields" },
        400,
      );
    }

    const bucketName = "make-8aea8ee5-page-images";
    const filePath = `${pageId}/${language}.png`;

    // 기존 파일이 있으면 삭제
    await supabase.storage.from(bucketName).remove([filePath]);

    // 새 파일 업로드
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        contentType: file.type,
        upsert: true,
      });

    if (error) throw error;

    // Public URL 생성
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return c.json({
      success: true,
      data: {
        path: data.path,
        publicUrl: urlData.publicUrl,
      },
    });
  } catch (error) {
    console.error("Image upload error:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * 이미지 삭제
 */
app.delete("/make-server-8aea8ee5/admin/images", async (c) => {
  try {
    const body = await c.req.json();
    const { pageId, language } = body;

    if (!pageId || !language) {
      return c.json(
        { success: false, error: "Missing required fields" },
        400,
      );
    }

    const bucketName = "make-8aea8ee5-page-images";
    const filePath = `${pageId}/${language}.png`;

    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) throw error;

    return c.json({ success: true });
  } catch (error) {
    console.error("Image delete error:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * 이미지 목록 조회
 */
app.get("/make-server-8aea8ee5/admin/images", async (c) => {
  try {
    const bucketName = "make-8aea8ee5-page-images";

    const { data, error } = await supabase.storage
      .from(bucketName)
      .list("", {
        limit: 1000,
        offset: 0,
      });

    if (error) throw error;

    return c.json({ success: true, data });
  } catch (error) {
    console.error("List images error:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * 특정 페이지의 이미지 URL 조회
 */
app.get("/make-server-8aea8ee5/admin/images/:pageId", async (c) => {
  try {
    const pageId = c.req.param("pageId");
    const bucketName = "make-8aea8ee5-page-images";

    const { data: koData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(`${pageId}/ko.png`);

    const { data: enData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(`${pageId}/en.png`);

    return c.json({
      success: true,
      data: {
        ko: koData.publicUrl,
        en: enData.publicUrl,
      },
    });
  } catch (error) {
    console.error("Get page images error:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ========================================
// 🗂️ 카테고리 관리 API
// ========================================

/**
 * 모든 카테고리 조회
 */
app.get("/make-server-8aea8ee5/admin/categories", async (c) => {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("order_num");

    if (error) throw error;

    return c.json({ success: true, data });
  } catch (error) {
    console.error("Get categories error:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * 카테고리 생성
 */
app.post("/make-server-8aea8ee5/admin/categories", async (c) => {
  try {
    const body = await c.req.json();
    const { id, name_ko, name_en, icon, order_num } = body;

    const { data, error } = await supabase
      .from("categories")
      .insert({
        id,
        name_ko,
        name_en,
        icon,
        order_num,
      })
      .select()
      .single();

    if (error) throw error;

    return c.json({ success: true, data });
  } catch (error) {
    console.error("Create category error:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * 카테고리 수정
 */
app.put("/make-server-8aea8ee5/admin/categories/:id", async (c) => {
  try {
    const categoryId = c.req.param("id");
    const body = await c.req.json();

    const { data, error } = await supabase
      .from("categories")
      .update(body)
      .eq("id", categoryId)
      .select()
      .single();

    if (error) throw error;

    return c.json({ success: true, data });
  } catch (error) {
    console.error("Update category error:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * 카테고리 삭제
 */
app.delete("/make-server-8aea8ee5/admin/categories/:id", async (c) => {
  try {
    const categoryId = c.req.param("id");

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", categoryId);

    if (error) throw error;

    return c.json({ success: true });
  } catch (error) {
    console.error("Delete category error:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ========================================
// 📊 통계 API
// ========================================

/**
 * 대시보드 통계 조회
 */
app.get("/make-server-8aea8ee5/admin/stats", async (c) => {
  try {
    // 페이지 수
    const { count: pageCount } = await supabase
      .from("pages")
      .select("*", { count: "exact", head: true });

    // 번역 수
    const { count: translationCount } = await supabase
      .from("translations")
      .select("*", { count: "exact", head: true });

    // 이미지 수
    const bucketName = "make-8aea8ee5-page-images";
    const { data: images } = await supabase.storage
      .from(bucketName)
      .list("", { limit: 1000 });

    return c.json({
      success: true,
      data: {
        totalPages: pageCount ?? 0,
        totalTranslations: translationCount ?? 0,
        totalImages: images?.length ?? 0,
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

export default app;