import { BanknoteArrowDown, LockKeyhole, Truck } from "lucide-react";

export const TrustBadges = () => {
  return (
    <div className="flex flex-col gap-3 px-2 mt-2">
      {[
        {
          icon: <LockKeyhole size={16} color="green" />,
          text: "Secure, SSL-encrypted checkout",
        },
        {
          icon: <Truck size={16} color="orange" />,
          text: "100% traceable to the source",
        },
        {
          icon: <BanknoteArrowDown size={16} color="blue" />,
          text: "Freshness guaranteed or full refund",
        },
      ].map((t) => (
        <div
          key={t.text}
          className="flex items-center gap-3 text-sm text-gray-600 font-medium"
        >
          <span className="text-lg">{t.icon}</span>
          {t.text}
        </div>
      ))}
    </div>
  );
};
