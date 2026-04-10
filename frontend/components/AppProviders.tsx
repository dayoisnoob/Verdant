// components/AppProviders.tsx
"use client";

import { CartProvider } from "@/components/CartProvider";
import QueryProvider from "@/components/QueryProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
// import { useAppReady } from "@/hooks";

// function AppReady({ children }: { children: React.ReactNode }) {
//   const appReady = useAppReady();

//   if (!appReady) {
//     return (
//       <div className="min-h-screen bg-cream flex items-center justify-center">
//         <div className="w-8 h-8 rounded-full border-2 border-green border-t-transparent animate-spin" />
//       </div>
//     );
//   }

//   return <>{children}</>;
// }

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
