export {
  changePassword,
  deleteUserApi,
  forgotPassword,
  loginApi,
  logoutApi,
  registerApi,
  resendVerificationEmail,
  resetPassword,
  updateProfile,
  verifyEmail,
} from "./auth.api";

export {
  addUserAddress,
  getUserAddresses,
  removeAddress,
  setDefaultAddress,
  updateUserAddresses,
} from "./address.api";

export {
  addItemToCart,
  getCart,
  getCartTotal,
  mergeGuestCart,
  removeItemFromCart,
  updateItem,
} from "./cart.api";

export {
  createCheckoutSession,
  getOrderById,
  getOrderBySessionId,
  getuserOrders,
} from "./order.api";

export {
  getCategories,
  getProductBySlug,
  getPaginatedProducts,
  getAllProducts,
  getBestSelling,
  getTrending,
  getSuggested,
} from "./product.api";

export {
  addToWishlist,
  getUserWishlist,
  removeFromWishlist,
} from "./wishlist.api";

export { applyCouponApi, removeCouponApi } from "./coupon.api";
