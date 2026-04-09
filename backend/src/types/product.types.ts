export interface Product {
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice: number | null;
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
  stock: number;
}

export interface ProductImage {
  alt: string;
  url: string;
}
