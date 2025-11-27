/**
 * 백오피스 API 클라이언트
 */

import { projectId, publicAnonKey } from "./info";

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-8aea8ee5`;

const headers = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${publicAnonKey}`,
};

// ========================================
// 📄 페이지 API
// ========================================

export interface Page {
  id: string;
  component: string;
  category: string;
  order_num: number;
  is_first_in_category: boolean;
  created_at?: string;
  updated_at?: string;
}

export const pagesApi = {
  getAll: async (): Promise<Page[]> => {
    const res = await fetch(`${API_BASE}/admin/pages`, { headers });
    const json = await res.json();
    return json.data || [];
  },

  getById: async (id: string): Promise<Page | null> => {
    const res = await fetch(`${API_BASE}/admin/pages/${id}`, { headers });
    const json = await res.json();
    return json.data || null;
  },

  create: async (page: Omit<Page, "created_at" | "updated_at">): Promise<Page> => {
    const res = await fetch(`${API_BASE}/admin/pages`, {
      method: "POST",
      headers,
      body: JSON.stringify(page),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    return json.data;
  },

  update: async (id: string, page: Partial<Page>): Promise<Page> => {
    const res = await fetch(`${API_BASE}/admin/pages/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(page),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    return json.data;
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/admin/pages/${id}`, {
      method: "DELETE",
      headers,
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
  },
};

// ========================================
// 🌐 번역 API
// ========================================

export interface Translation {
  id?: number;
  page_id: string;
  key: string;
  value_ko: string | null;
  value_en: string | null;
  created_at?: string;
  updated_at?: string;
}

export const translationsApi = {
  getAll: async (): Promise<Translation[]> => {
    const res = await fetch(`${API_BASE}/admin/translations`, { headers });
    const json = await res.json();
    return json.data || [];
  },

  getByPageId: async (pageId: string): Promise<Translation[]> => {
    const res = await fetch(`${API_BASE}/admin/translations/${pageId}`, { headers });
    const json = await res.json();
    return json.data || [];
  },

  upsert: async (translation: Omit<Translation, "id" | "created_at" | "updated_at">): Promise<Translation> => {
    const res = await fetch(`${API_BASE}/admin/translations`, {
      method: "POST",
      headers,
      body: JSON.stringify(translation),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    return json.data;
  },

  batchUpsert: async (translations: Omit<Translation, "id" | "created_at" | "updated_at">[]): Promise<Translation[]> => {
    const res = await fetch(`${API_BASE}/admin/translations/batch`, {
      method: "POST",
      headers,
      body: JSON.stringify({ translations }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    return json.data;
  },

  delete: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE}/admin/translations/${id}`, {
      method: "DELETE",
      headers,
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
  },
};

// ========================================
// 👁️ Visibility API
// ========================================

export interface Visibility {
  id?: number;
  page_id: string;
  step_num: number;
  is_visible: boolean;
  image_visible: boolean;
  created_at?: string;
  updated_at?: string;
}

export const visibilityApi = {
  getAll: async (): Promise<Visibility[]> => {
    const res = await fetch(`${API_BASE}/admin/visibility`, { headers });
    const json = await res.json();
    return json.data || [];
  },

  getByPageId: async (pageId: string): Promise<Visibility[]> => {
    const res = await fetch(`${API_BASE}/admin/visibility/${pageId}`, { headers });
    const json = await res.json();
    return json.data || [];
  },

  upsert: async (visibility: Omit<Visibility, "id" | "created_at" | "updated_at">): Promise<Visibility> => {
    const res = await fetch(`${API_BASE}/admin/visibility`, {
      method: "POST",
      headers,
      body: JSON.stringify(visibility),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    return json.data;
  },

  batchUpsert: async (visibility: Omit<Visibility, "id" | "created_at" | "updated_at">[]): Promise<Visibility[]> => {
    const res = await fetch(`${API_BASE}/admin/visibility/batch`, {
      method: "POST",
      headers,
      body: JSON.stringify({ visibility }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    return json.data;
  },
};

// ========================================
// 🖼️ 이미지 API
// ========================================

export const imagesApi = {
  upload: async (pageId: string, language: "ko" | "en", file: File): Promise<{ path: string; publicUrl: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("pageId", pageId);
    formData.append("language", language);

    const res = await fetch(`${API_BASE}/admin/images/upload`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${publicAnonKey}`,
      },
      body: formData,
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    return json.data;
  },

  delete: async (pageId: string, language: "ko" | "en"): Promise<void> => {
    const res = await fetch(`${API_BASE}/admin/images`, {
      method: "DELETE",
      headers,
      body: JSON.stringify({ pageId, language }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
  },

  getByPageId: async (pageId: string): Promise<{ ko: string; en: string }> => {
    const res = await fetch(`${API_BASE}/admin/images/${pageId}`, { headers });
    const json = await res.json();
    return json.data || { ko: "", en: "" };
  },
};

// ========================================
// 🗂️ 카테고리 API
// ========================================

export interface Category {
  id: string;
  name_ko: string;
  name_en: string;
  icon: string | null;
  order_num: number;
  created_at?: string;
  updated_at?: string;
}

export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const res = await fetch(`${API_BASE}/admin/categories`, { headers });
    const json = await res.json();
    return json.data || [];
  },

  create: async (category: Omit<Category, "created_at" | "updated_at">): Promise<Category> => {
    const res = await fetch(`${API_BASE}/admin/categories`, {
      method: "POST",
      headers,
      body: JSON.stringify(category),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    return json.data;
  },

  update: async (id: string, category: Partial<Category>): Promise<Category> => {
    const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(category),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    return json.data;
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
      method: "DELETE",
      headers,
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
  },
};

// ========================================
// 📊 통계 API
// ========================================

export interface Stats {
  totalPages: number;
  totalTranslations: number;
  totalImages: number;
}

export const statsApi = {
  get: async (): Promise<Stats> => {
    const res = await fetch(`${API_BASE}/admin/stats`, { headers });
    const json = await res.json();
    return json.data || { totalPages: 0, totalTranslations: 0, totalImages: 0 };
  },
};

// ========================================
// 🔧 초기화 API
// ========================================

export const initializeApi = {
  run: async (): Promise<void> => {
    const res = await fetch(`${API_BASE}/admin/initialize`, {
      method: "POST",
      headers,
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
  },
};
