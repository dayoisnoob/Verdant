import { useAuthStore, useGuestCartStore } from "@/store/store";
import { ProductCard, UserApi } from "@/types";
import { ApiError } from "@/util";
import { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { toast } from "sonner";
import { mergeGuestCart } from "./api";

export const convertDate = (date: Date) => {
  const result = new Date(date);
  return result.toLocaleString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export function handleFormError<T extends FieldValues>(
  err: unknown,
  setError: UseFormSetError<T>,
  fieldOverrides?: Partial<Record<number, { field: Path<T>; message: string }>>,
) {
  if (!(err instanceof ApiError)) {
    toast.error("Something went wrong, please try again");
    return;
  }
  if (err.errors?.length) {
    for (const { field, message } of err.errors) {
      setError(field as Path<T>, { message });
    }
    return;
  }
  const override = fieldOverrides?.[err.statusCode];
  if (override) {
    setError(override.field, { message: override.message ?? err.message });
    return;
  }
  toast.error(err.message ?? "Something went wrong");
}

export const initiateLogin = async (res: UserApi) => {
  useAuthStore.getState().login(res.user);

  try {
    const guestItems = useGuestCartStore.getState().items;
    if (guestItems.length > 0) {
      await mergeGuestCart(guestItems);
      useGuestCartStore.getState().clearCart();
      useGuestCartStore.persist.clearStorage();
    }
  } catch (err) {
    console.error("Cart sync failed after login", err);
  }
};

export const formatNewCartItem = (product: ProductCard, quantity: number) => ({
  id: crypto.randomUUID(),
  productId: product.id,
  name: product.name,
  slug: product.slug,
  stock: product.stock,
  imageUrl: product.images[0].url,
  unit: product.unit,
  farm: product.farm,
  isOrganic: product.isOrganic,
  pricePence: product.price,
  quantity,
});
