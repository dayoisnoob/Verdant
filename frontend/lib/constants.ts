import { FilterStatus } from "@/types";

export const ORDER_STATUS_CONFIG: Record<
  string,
  { label: string; dot: string; bg: string; text: string; pulse?: boolean }
> = {
  delivered: {
    label: "Delivered",
    dot: "bg-green",
    bg: "bg-green/10",
    text: "text-green",
  },
  shipped: {
    label: "On the way",
    dot: "bg-orange-500",
    bg: "bg-orange-50",
    text: "text-orange-600",
    pulse: true,
  },
  paid: {
    label: "Paid",
    dot: "bg-blue-500",
    bg: "bg-blue-50",
    text: "text-blue-600",
  },
  processing: {
    label: "Processing",
    dot: "bg-yellow-500",
    bg: "bg-yellow-50",
    text: "text-yellow-600",
    pulse: true,
  },
  cancelled: {
    label: "Cancelled",
    dot: "bg-red-400",
    bg: "bg-red-50",
    text: "text-red-500",
  },
};

export const ORDER_PREVIEW_LIMIT = 4;

export const FREE_SHIPPING_THRESHOLD = 4000;
export const DELIVERY_FEE = 499;
export const LOW_PRODUCT_THRESHOLD = 10;

export const MAX_ADDRESSES = 5;
export const MAX_CART_LIMIT = 10;

export const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT — Abuja",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

export const FILTERS = [
  { label: "All", value: "all" },
  { label: "Organic", value: "organic" },
  { label: "Seasonal", value: "seasonal" },
  { label: "On Sale", value: "on-sale" },
  { label: "In Stock", value: "in-stock" },
];

export const ORDER_FILTERS: { id: FilterStatus; label: string }[] = [
  { id: "all", label: "All Orders" },
  { id: "processing", label: "Processing" },
  { id: "shipped", label: "On the Way" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
];

export const NAV_LINKS = [
  { label: "Shop", href: "/shop" },
  { label: "Farms", href: "/farms" },
  { label: "Seasonal", href: "/seasonal" },
  { label: "About", href: "/about" },
];

export const PAGE_LIMIT = 12;
