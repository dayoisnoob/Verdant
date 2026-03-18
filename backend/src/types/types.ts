export interface DeviceInfo {
  ip: string | undefined;
  userAgent: string | undefined;
  deviceId: string | null;
}

export interface RegisterResult {
  message: string;
  data: {
    firstName: string;
    lastName: string | null;
    email: string;
  };
}

export interface SendMail {
  firstName: string;
  email: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  passwordHash: string;
  role: string;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: Date;
}

export interface JwtPayload {
  id: string;
  role: string;
  email: string;
  isActive: boolean;
}

export interface ProductImage {
  alt: string;
  url: string;
}

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
}

// export interface CartItem {
//   id: string;
//   productId: string;
//   name: string;
//   slug: string;
//   imageUrl: string;
//   unit: string;
//   farm: string;
//   isOrganic: boolean;
//   pricePence: number;
//   quantity: number;
// }

// export interface Cart {
//   id: string;
//   userId: string;
//   couponCode: string;
//   discount: string;
//   createdAt: Date;
//   updatedAt: Date;
//   items: [];
// }
