"use client";

import { Image as ImageIcon } from "lucide-react";
import Image, { ImageProps } from "next/image";
import { useState } from "react";

export default function BlurImage({
  src,
  alt,
  className,
  ...props
}: ImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-50 text-gray-300">
        <ImageIcon strokeWidth={1.5} size={32} />
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse z-0" />
      )}

      <Image
        src={src}
        alt={alt}
        onLoad={() => setIsLoading(false)}
        onError={() => setError(true)}
        className={`
          transition-all duration-500 ease-in-out z-10
          ${isLoading ? "scale-105 blur-sm opacity-0" : "scale-100 blur-0 opacity-100"}
          ${className || ""}
        `}
        {...props}
      />
    </>
  );
}
