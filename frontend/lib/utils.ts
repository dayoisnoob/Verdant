import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const toPence = (price: string | number) =>
  Math.round(parseFloat(String(price)) * 100);
