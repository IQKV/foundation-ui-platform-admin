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

export interface CmsPageSummary {
  id: string;
  slug: string;
  parentId: string | null;
  template: string | null;
  status: CmsPageStatus;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CmsPageHierarchyItem {
  id: string;
  slug: string;
  parentId: string | null;
  title: string | null;
}
