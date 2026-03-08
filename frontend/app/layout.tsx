import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import QueryProvider from "@/components/QueryProvider";
import { CartProvider } from "@/components/CartProvider";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "Verdant — Farm Fresh Produce",
  description:
    "Farm-fresh produce delivered. Straight from local farms to your table — seasonal produce, picked at peak ripeness.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${dmSans.variable} font-sans bg-cream`}
      >
        <CartProvider>
          <QueryProvider>{children}</QueryProvider>
        </CartProvider>
        <Toaster richColors />
      </body>
    </html>
  );
}
