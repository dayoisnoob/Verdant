//////////////////////////////////////////
///////////// API RESPONSE ///////////////
//////////////////////////////////////////
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

//////////////////////////////////////////
//////////// PRODUCT TYPES ///////////////
//////////////////////////////////////////

export interface ProductImage {
  alt: string;
  url: string;
}

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

export interface ProductImage {
  url: string;
  alt: string;
}

//////////////////////////////////////////
/////////////// USER TYPES ///////////////
//////////////////////////////////////////
export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: Date;
}

export interface UserApi {
  success: string;
  statusCode: number;
  message: string;
  data: UserData;
  accessToken: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

//////////////////////////////////////////
/////////////// CART TYPES ///////////////
//////////////////////////////////////////
export interface GuestCart {
  product: Product;
  quantity: number;
}

export interface CartItems {
  id: string;
  productId: string;
  name: string;
  slug: string;
  imageUrl: string;
  unit: string;
  farm: string;
  isOrganic: boolean;
  pricePence: number;
  quantity: number;
}

export interface CartApi {
  id: string;
  userId: string;
  couponCode: string;
  createdAt: Date;
  updatedAt: Date;
  items: {
    id: string;
    productId: string;
    name: string;
    slug: string;
    imageUrl: string;
    unit: string;
    farm: string;
    isOrganic: boolean;
    pricePence: number;
    quantity: number;
  }[];
}

export interface Totals {
  subtotalPence: number;
  discountPence: number;
  deliveryPence: number;
  totalPence: number;
  subtotal: string;
  discount: string;
  delivery: string;
  total: string;
  itemCount: number;
  appliedCoupon: {
    code: string;
  };
}

//////////////////////////////////////////
////////////// ORDER TYPES ///////////////
//////////////////////////////////////////

export type FilterStatus =
  | "all"
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItems {
  id: string;
  orderId: string;
  image: string;
  productName: string;
  productId: string;
  quantity: number;
  unitPriceCents: string;
  totalPriceCents: string;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  status: string;
  subtotalCents: number;
  deliveryNotes?: string;
  shippingFee: number;
  stripeSessionId: string;
  customerEmail: string;
  discountAmount: number;
  userId: string;
  totalCents: number;
  currency?: number;
  shippingAddress: {
    firstName: string;
    lastName: string;
    phone1: string;
    phone2?: string;
    state: string;
    streetAddress: string;
  };
  createdAt: Date;
}

export interface SingleOrder {
  items: OrderItems[];
  order: CustomerOrder;
}

export interface AllOrders {
  id: string;
  status: string;
  createdAt: Date;
  totalCents: number;
  orderNumber: string;
  items: OrderItems[];
  subtotalCents: number;
}

export interface OrderSession {
  orderNumber: string;
}

//////////////////////////////////////////
//////////// ADDRESS TYPES ///////////////
//////////////////////////////////////////

export interface Address {
  id: string;
  firstName: string;
  lastName?: string;
  phone1: string;
  phone2?: string;
  streetAddress: string;
  state: string;
  isDefault: boolean;
}

//////////////////////////////////////////
////////// WISHLISTS TYPES ///////////////
//////////////////////////////////////////

export interface WishlistApi extends Product {
  wishlistId: string;
}

//////////////////////////////////////////
////////// ZUSTAND STORE ///////////////
//////////////////////////////////////////

export interface AuthCartStore {
  items: CartItems[];
  couponCode: string;
  discount: number;

  addItem: (product: Product, quantity?: number) => void;
  setCart: (cartItems: CartApi) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  updateQuantity: (id: string, quantity: number) => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  itemCount: () => number;
}

// Same flat shape as CartItems — no nested product object
export interface GuestCartStore {
  items: CartItems[];
  couponCode: string;
  discount: number;

  addItem: (product: Product, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  itemCount: () => number;
}

export interface AddressStore {
  selectedAddressId: string | null;
  setAddressId: (id: string) => void;
}

export interface AuthStore {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    isVerified: boolean;
    createdAt: Date;
  } | null;
  isLoggedIn: boolean;
  accessToken: string | null;
  signUpEmail: string;

  setEmail: (email: string) => void;
  setUser: (data: UserData) => void;
  login: (
    user: {
      firstName: string;
      lastName: string;
      email: string;
      role: string;
      isVerified: boolean;
      createdAt: Date;
    },
    accessToken: string,
  ) => void;
  logout: () => void;
}
