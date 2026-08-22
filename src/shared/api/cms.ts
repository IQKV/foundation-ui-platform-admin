import { httpClient } from "./http-client";
import type {
  CmsPage,
  CmsPageStatus,
  CmsPageTranslation,
  CmsPageSummary,
  CmsPageHierarchyItem,
} from "../../entities";

// ─── API-specific types ───────────────────────────────────────────────────────

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
