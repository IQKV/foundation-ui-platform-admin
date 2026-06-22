import { httpClient } from "./http-client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CmsPageStatus = "DRAFT" | "PENDING" | "PUBLISHED" | "ARCHIVED";

export interface CmsPageTranslation {
  locale: string;
  title: string;
  content: string;
  seoTitle: string | null;
  seoDescription: string | null;
  seoOpenGraphTitle: string | null;
  seoOpenGraphDescription: string | null;
  seoCanonicalUrl: string | null;
}

export interface CmsPage {
  id: string;
  slug: string;
  parentId: string | null;
  template: string | null;
  status: CmsPageStatus;
  createdAt: string;
  updatedAt: string;
  translations: CmsPageTranslation[];
}

/** Lightweight summary row returned by the admin list endpoint (en-US title included). */
export interface CmsPageSummary {
  id: string;
  slug: string;
  parentId: string | null;
  template: string | null;
  status: CmsPageStatus;
  /** en-US fallback title — may be null if no en-US translation exists yet. */
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CmsPageSummaryListResponse {
  items: CmsPageSummary[];
  totalElements: number;
}

export interface CmsPageTranslationRequest {
  locale: string;
  title: string;
  content: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoOpenGraphTitle?: string | null;
  seoOpenGraphDescription?: string | null;
  seoCanonicalUrl?: string | null;
}

export interface CreateCmsPageRequest {
  slug: string;
  parentId?: string | null;
  template?: string | null;
  status: CmsPageStatus;
  translations: CmsPageTranslationRequest[];
}

export interface UpdateCmsPageRequest {
  slug: string;
  parentId?: string | null;
  template?: string | null;
  status: CmsPageStatus;
  translations: CmsPageTranslationRequest[];
}

export interface ListCmsPageParams {
  limit?: number;
  offset?: number;
}

// ─── API ──────────────────────────────────────────────────────────────────────

/** Lightweight item for the parent-page picker. Returned by the hierarchy endpoint. */
export interface CmsPageHierarchyItem {
  id: string;
  slug: string;
  parentId: string | null;
  /** en-US fallback title — may be null if no en-US translation exists yet. */
  title: string | null;
}

export const cmsApi = {
  listPages: (tenantKey: string, params: ListCmsPageParams = {}) =>
    httpClient
      .get<CmsPageSummaryListResponse>(`/v1/cms/admin/${encodeURIComponent(tenantKey)}/pages`, {
        params,
      })
      .then((r) => r.data),

  getPage: (tenantKey: string, id: string) =>
    httpClient
      .get<CmsPage>(`/v1/cms/admin/${encodeURIComponent(tenantKey)}/pages/${id}`)
      .then((r) => r.data),

  createPage: (tenantKey: string, data: CreateCmsPageRequest) =>
    httpClient
      .post<CmsPage>(`/v1/cms/admin/${encodeURIComponent(tenantKey)}/pages`, data)
      .then((r) => r.data),

  updatePage: (tenantKey: string, id: string, data: UpdateCmsPageRequest) =>
    httpClient
      .put<CmsPage>(`/v1/cms/admin/${encodeURIComponent(tenantKey)}/pages/${id}`, data)
      .then((r) => r.data),

  deletePage: (tenantKey: string, id: string) =>
    httpClient.delete(`/v1/cms/admin/${encodeURIComponent(tenantKey)}/pages/${id}`),

  listPageHierarchy: (tenantKey: string) =>
    httpClient
      .get<CmsPageHierarchyItem[]>(`/v1/cms/admin/${encodeURIComponent(tenantKey)}/pages/hierarchy`)
      .then((r) => r.data),
};
