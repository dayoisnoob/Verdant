export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  originalPrice: string | null;
  category: string;
  unit: string;
  weight: string;
  farm: string;
  origin: string;
  isOrganic: boolean;
  isSeasonal: boolean;
  isFeatured: boolean;
  isOnSale: boolean;
  inStock: boolean;
  rating: string;
  reviewCount: number;
  harvestDaysAgo: number;
  tags: string[];
  nutritionHighlights: string[];
  storageInstructions: string;
  images: ProductImage[];
}

export interface CategoryMeta {
  bg: string;
  img: string;
}

export interface ProductsApi {
  products: Product[];
  pagination: {
    totalItems: number;
    currentPage: number;
    limit: number;
    totalPages: number;
  };
}

interface ProductImage {
  url: string;
  alt: string;
}

export type ProductCard = Pick<
  Product,
  | "id"
  | "name"
  | "slug"
  | "price"
  | "images"
  | "farm"
  | "unit"
  | "isOrganic"
  | "inStock"
  | "originalPrice"
  | "reviewCount"
  | "rating"
  | "origin"
  | "isSeasonal"
  | "isOnSale"
> & { totalSold?: number };

export interface ProductSectionProps {
  title: string;
  label: string;
  description?: string;
  products: ProductCard[];
}
