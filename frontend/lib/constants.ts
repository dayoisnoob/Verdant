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

export const CATEGORY_META: Record<string, { img: string }> = {
  "Leafy Greens": {
    img: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&h=600&fit=crop",
  },
  Brassicas: {
    img: "https://images.unsplash.com/photo-1628611048979-d33b63e4a0c5?w=800&h=600&fit=crop",
  },
  "Root Vegetables": {
    img: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&h=600&fit=crop",
  },
  Berries: {
    img: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=800&h=600&fit=crop",
  },
  "Stone Fruits": {
    img: "https://images.unsplash.com/photo-1595124750784-b19a2792d379?w=800&h=600&fit=crop",
  },
  "Fruiting Vegetables": {
    img: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=800&h=600&fit=crop",
  },
  Alliums: {
    img: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&h=600&fit=crop",
  },
  Legumes: {
    img: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=800&h=600&fit=crop",
  },
  "Squash & Gourds": {
    img: "https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=800&h=600&fit=crop",
  },
  Herbs: {
    img: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&h=600&fit=crop",
  },
  Mushrooms: {
    img: "https://images.unsplash.com/photo-1504545102780-26774c1bb073?w=800&h=600&fit=crop",
  },
};

export const FARM_ICONS: Record<string, string> = {
  "Green Meadow Farm": "🌿",
  "Sunrise Valley Farm": "🌅",
  "Willowbrook Organics": "🌾",
  "Golden Fields Farm": "🌻",
  "Purple Root Farm": "🥕",
  "Bluebell Ridge Farm": "🫐",
  "Thornberry Produce": "🧅",
  "River Bend Farm": "💧",
  "Coastal Acres": "🏖️",
  "Orchard House Farm": "🍑",
  "Hillside Organics": "⛰️",
  "Strawberry Hill Farm": "🍓",
  "Harvest Moon Farm": "🎃",
  "Meadow Herb Garden": "🌱",
  "Sunflower Organics": "🌸",
  "Wildcraft Foragers": "🍄",
  "Wakefield Rhubarb Co.": "🎋",
};
