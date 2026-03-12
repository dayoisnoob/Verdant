import { ApiError } from "@/util";
import { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { toast } from "sonner";

// lib/shipping.ts
export function calculateOrderTotal(subtotalPence: number): {
  shippingFee: number;
  totalAmount: number;
} {
  const subtotal = parseFloat((subtotalPence / 100).toFixed(2));

  const shippingFee = subtotal >= 100.0 ? 0 : 4.99;
  const totalAmount = subtotal + shippingFee;

  return { shippingFee, totalAmount };
}

export const FREE_SHIPPING_THRESHOLD = 100;

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
