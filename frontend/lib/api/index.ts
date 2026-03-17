export {
  changePassword,
  deleteUser,
  forgotPassword,
  login,
  logout,
  register,
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
  updateUserAddress,
} from "./address.api";

export {
  addItemToCart,
  getCart,
  mergeGuestCart,
  removeItemFromCart,
  updateItem,
} from "./cart.api";

export {
  createCheckoutSession,
  getOrderById,
  getOrderBySessionId,
  getUserOrders,
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

export { applyCoupon, removeCoupon } from "./coupon.api";

export { refreshAccessToken } from "./token.api";
