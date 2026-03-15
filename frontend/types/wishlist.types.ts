import { Product } from "./product.types";

export interface WishlistApi extends Product {
  wishlistId: string;
}
