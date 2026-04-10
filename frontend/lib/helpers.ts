import { useAuthStore, useCartStore, useGuestCartStore } from "@/store/store";
import { UserApi } from "@/types";
import { ApiError } from "@/util";
import { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { toast } from "sonner";
import { getCart, mergeGuestCart } from "./api";

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
  useAuthStore.getState().login(res.user, res.accessToken);

  try {
    const guestItems = useGuestCartStore.getState().items;
    if (guestItems.length > 0) {
      await mergeGuestCart(guestItems);
      useGuestCartStore.getState().clearCart();
      useGuestCartStore.persist.clearStorage();
    }

    // const { cart, totals } = await getCart();

    // useCartStore.getState().setCart(cart, totals);
  } catch (err) {
    console.error("Cart sync failed after login", err);
  }
};
