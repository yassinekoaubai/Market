export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  sku: string;
  image_url?: string;
  categoryId: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  image_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ProductWithCategory extends Product {
  category: Category;
}

export interface SearchResult {
  data: ProductWithCategory[];
  total: number;
  limit: number;
  offset: number;
}
