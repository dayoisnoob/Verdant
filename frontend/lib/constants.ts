export const ORDER_STATUS_CONFIG: Record<
  string,
  { label: string; dot: string; bg: string; text: string; pulse?: boolean }
> = {
  pending: {
    label: "Pending",
    dot: "bg-yellow-400",
    bg: "bg-yellow-50",
    text: "text-yellow-600",
  },
  paid: {
    label: "paid",
    dot: "bg-blue-400",
    bg: "bg-blue-50",
    text: "text-blue-600",
    pulse: true,
  },
  shipped: {
    label: "On the way",
    dot: "bg-orange",
    bg: "bg-orange-pale",
    text: "text-orange",
    pulse: true,
  },
  delivered: {
    label: "Delivered",
    dot: "bg-green",
    bg: "bg-green-pale",
    text: "text-green",
  },
  cancelled: {
    label: "Cancelled",
    dot: "bg-red-400",
    bg: "bg-red-50",
    text: "text-red-500",
  },
};

export const ORDER_PREVIEW_LIMIT = 4;
