import { Product, ProductCard, ProductsApi } from "@/types";
import { apiFetch } from "../apiFetch";

export const getPaginatedProducts = async (
  category?: string,
  sort?: string,
  filter?: string,
  page = 1,
  limit = 12,
  q?: string,
): Promise<ProductsApi> => {
  const params = new URLSearchParams();
  if (category && category !== "All") params.set("category", category);
  if (sort && sort !== "default") params.set("sort", sort);
  if (filter && filter !== "default") params.set("filter", filter);
  if (q && q !== "") params.set("search", q);
  params.set("page", String(page));
  params.set("limit", String(limit));

  console.log(q);

  return apiFetch(`/api/products?${params.toString()}`, {
    method: "GET",
  });
};

export const getAllProducts = async (): Promise<Product[]> => {
  const res = await apiFetch<{ products: Product[] }>("/api/products/all", {
    method: "GET",
  });
  return res.products;
};

export const getProductBySlug = async (slug: string): Promise<Product> => {
  const res = await apiFetch<{ product: Product }>(`/api/products/${slug}`, {
    method: "GET",
  });

  return res.product;
};

export const getCategories = async (): Promise<string[]> => {
  const res = await apiFetch<{ categories: string[] }>(
    "/api/products/categories",
    {
      method: "GET",
    },
  );

  return res.categories;
};

export const getBestSelling = async () => {
  const res = await apiFetch<{ bestSelling: ProductCard[] }>(
    "/api/products/analytics/best-selling",
    {
      method: "GET",
    },
  );

  return res.bestSelling;
};

export const getTrending = async () => {
  const res = await apiFetch<{ trending: ProductCard[] }>(
    "/api/products/analytics/trending",
    {
      method: "GET",
    },
  );

  return res.trending;
};

export const getSuggested = async (
  productIds: string[],
): Promise<ProductCard[]> => {
  const res = await apiFetch<{ products: ProductCard[] }>(
    "/api/products/suggested",
    {
      method: "POST",
      body: JSON.stringify({ productIds }),
    },
  );

  console.log(res);

  return res.products;
};

export const getRelated = async (slug: string): Promise<ProductCard[]> => {
  const res = await apiFetch<{ products: ProductCard[] }>(
    `/api/products/related/${slug}`,
    {
      method: "GET",
    },
  );

  console.log(res);

  return res.products;
};
