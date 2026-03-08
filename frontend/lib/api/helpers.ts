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
