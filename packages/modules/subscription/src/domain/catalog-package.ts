export interface CatalogPackageItem {
  catalogItemCode: string;
  quantity?: number;
}

export interface CatalogPackage {
  code: string;
  name: string;
  tagline: string;
  description: string;
  benefits: string[];
  items: CatalogPackageItem[];
  isActive: boolean;
  sortOrder: number;
  version: number;
}
