// components/AppProviders.tsx
"use client";

import { CartProvider } from "@/components/CartProvider";
import QueryProvider from "@/components/QueryProvider";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <CartProvider>{children}</CartProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}
